"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import mqtt from "mqtt";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function ViewVitalsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("patient_profiles")
        .select("name, condition, age, gender, blood_group, address")
        .eq("id", id)
        .single();

      if (error) setError(error.message);
      else setPatient(data);
      setLoading(false);
    };

    fetchPatientData();
  }, [id]);

  useEffect(() => {
    const brokerUrl = "wss://w811e716.ala.asia-southeast1.emqxsl.com:8084/mqtt";
    const mqttOptions = {
      username: "rpm-hack",
      password: "rpm-hack",
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
    };

    const client = mqtt.connect(brokerUrl, mqttOptions);
    const topics = [
      `patient/${id}/heart_rate`,
      `patient/${id}/blood_pressure`,
      `patient/${id}/temperature`,
      `patient/${id}/respiratory_rate`,
      `patient/${id}/oxygen_saturation`,
    ];

    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      topics.forEach((topic) => client.subscribe(topic));
    });

    client.on("message", (topic, message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        const key = topic.split("/").pop();
        let value;

        switch (key) {
          case "heart_rate":
            value = parsedMessage.heart_rate
              ? `${parsedMessage.heart_rate} bpm`
              : "Fetching...";
            break;
          case "blood_pressure":
            value =
              parsedMessage.systolic && parsedMessage.diastolic
                ? `${parsedMessage.systolic}/${parsedMessage.diastolic} mmHg`
                : "Fetching...";
            break;
          case "temperature":
            value = parsedMessage.temperature
              ? `${parsedMessage.temperature}°C`
              : "Fetching...";
            break;
          case "respiratory_rate":
            value = parsedMessage.respiratory_rate
              ? `${parsedMessage.respiratory_rate} bpm`
              : "Fetching...";
            break;
          case "oxygen_saturation":
            value = parsedMessage.spo2
              ? `${parsedMessage.spo2}%`
              : "Fetching...";
            break;
          default:
            value = "Unknown";
        }

        setVitals((prevVitals) => ({
          ...prevVitals,
          [key]: value,
        }));
      } catch (error) {
        console.error("Error parsing MQTT message:", error);
      }
    });

    return () => {
      client.end();
    };
  }, [id]);

  const getGaugeColor = (key, value) => {
    if (value === "Fetching..." || value === "Unknown") return "#cccccc";
    const numericValue = parseFloat(value);
    switch (key) {
      case "heart_rate":
      case "respiratory_rate":
        return numericValue > 100
          ? "#e63946"
          : numericValue > 60
          ? "#f4a261"
          : "#2a9d8f";
      case "oxygen_saturation":
        return numericValue < 90
          ? "#e63946"
          : numericValue < 95
          ? "#f4a261"
          : "#2a9d8f";
      case "temperature":
        return numericValue > 38
          ? "#e63946"
          : numericValue > 36
          ? "#f4a261"
          : "#2a9d8f";
      default:
        return "#2a9d8f";
    }
  };

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gray-50">
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
        onClick={() => router.back()}
      >
        ← Back
      </button>
      <div className="bg-white p-6 shadow-xl rounded-2xl w-full max-w-3xl">
        {loading ? (
          <p className="text-gray-600 text-center text-xl animate-pulse">
            Loading...
          </p>
        ) : error ? (
          <p className="text-red-500 text-center text-xl">{error}</p>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-blue-700 text-center mb-4">
              Patient Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-md text-gray-700 p-4 rounded-lg">
              <p>
                <strong>Name:</strong> {patient?.name}
              </p>
              <p>
                <strong>Condition:</strong> {patient?.condition}
              </p>
              <p>
                <strong>Age:</strong> {patient?.age}
              </p>
              <p>
                <strong>Gender:</strong> {patient?.gender}
              </p>
              <p>
                <strong>Blood Group:</strong> {patient?.blood_group}
              </p>
              <p>
                <strong>Address:</strong> {patient?.address}
              </p>
            </div>
            <h2 className="text-2xl font-bold text-red-600 text-center mt-6 mb-4">
              Real-time Vitals
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 justify-center">
              {Object.entries(vitals).map(([key, value]) => (
                <div
                  key={key}
                  className="p-3 bg-white shadow-lg rounded-lg flex flex-col items-center w-40 h-40"
                >
                  <CircularProgressbar
                    value={value === "Fetching..." ? 0 : parseFloat(value)}
                    text={value === "Fetching..." ? "-" : `${value}`}
                    styles={buildStyles({
                      textSize: "12px",
                      pathColor: getGaugeColor(key, value),
                      textColor: "#333",
                      trailColor: "#ddd",
                    })}
                  />
                  <p className="mt-1 text-sm font-semibold capitalize text-center">
                    {key.replace("_", " ")}
                    
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
