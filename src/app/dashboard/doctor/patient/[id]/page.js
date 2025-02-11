"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import mqtt from "mqtt";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import BloodPressureCard from "../../../../../components/BloodPressureCard";

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
      `patient/${id}/watch_heart_rate`, // Add this new topic
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
          case "watch_heart_rate":
            value = parsedMessage.heartRate
              ? `${parsedMessage.heartRate} bpm`
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
      case "watch_heart_rate": // Add this case
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

  const getDisplayName = (key) => {
    switch (key) {
      case "heart_rate":
        return "ECG Heart Rate";
      case "watch_heart_rate":
        return "Watch Heart Rate";
      default:
        return key.replace(/_/g, " ");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-lg p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            onClick={() => router.back()}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back to Patients</span>
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            Patient Monitoring Dashboard
          </h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Patient Info Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {patient?.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {patient?.condition}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <InfoRow icon="🎂" label="Age" value={patient?.age} />
                  <InfoRow icon="⚧" label="Gender" value={patient?.gender} />
                  <InfoRow
                    icon="🩸"
                    label="Blood Group"
                    value={patient?.blood_group}
                  />
                  <InfoRow icon="📍" label="Address" value={patient?.address} />
                </div>
              </div>
            </div>

            {/* Vitals Display */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.entries(vitals).map(([key, value]) => {
                  if (key === "blood_pressure") {
                    return <BloodPressureCard key={key} value={value} />;
                  }
                  return (
                    <div
                      key={key}
                      className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-200"
                    >
                      <div className="h-48 w-48 mx-auto">
                        <CircularProgressbar
                          value={
                            value === "Fetching..." ? 0 : parseFloat(value)
                          }
                          text={value === "Fetching..." ? "..." : value}
                          styles={buildStyles({
                            textSize: "12px",
                            pathColor: getGaugeColor(key, value),
                            textColor: "#374151",
                            trailColor: "#E5E7EB",
                            rotation: 0.25,
                            strokeLinecap: "round",
                            pathTransitionDuration: 0.5,
                            textPosition: "center",
                            // Customize the text layout
                            text: {
                              fontSize: "16px",
                              fill: "#374151",
                              dominantBaseline: "middle",
                              textAnchor: "middle",
                            },
                          })}
                        />
                      </div>
                      <div className="mt-6 text-center">
                        <h3 className="text-lg font-semibold text-gray-700 capitalize mb-2">
                          {getDisplayName(key)}
                        </h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                            getVitalStatus(key, value) === "Normal"
                              ? "bg-green-100 text-green-800"
                              : getVitalStatus(key, value) === "Critical"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {getVitalStatus(key, value)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center space-x-3">
    <span className="text-lg">{icon}</span>
    <span className="text-gray-600">{label}:</span>
    <span className="font-medium text-gray-800">{value}</span>
  </div>
);

const getVitalStatus = (key, value) => {
  if (value === "Fetching..." || value === "Unknown") return "Measuring...";

  const numericValue = parseFloat(value);
  switch (key) {
    case "heart_rate":
    case "watch_heart_rate": // Add this case
      return numericValue > 100 ? "High" : numericValue < 60 ? "Low" : "Normal";
    case "oxygen_saturation":
      return numericValue < 90
        ? "Critical"
        : numericValue < 95
        ? "Low"
        : "Normal";
    case "temperature":
      return numericValue > 38 ? "High" : numericValue < 36 ? "Low" : "Normal";
    case "respiratory_rate":
      return numericValue > 100 ? "High" : numericValue < 60 ? "Low" : "Normal";
    default:
      return "Normal";
  }
};
