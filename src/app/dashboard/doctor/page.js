"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError(null);

      // Get the current doctor
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      // Fetch patients assigned to the doctor
      const { data, error } = await supabase
        .from("doctor_patient_mapping")
        .select(
          `patient_id, 
          patient_profiles(name, condition, age, gender, blood_group)`
        )
        .eq("doctor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setPatients(
          data.map((p) => ({
            id: p.patient_id,
            name: p.patient_profiles?.name || "Unknown",
            condition: p.patient_profiles?.condition || "N/A",
            age: p.patient_profiles?.age || "N/A",
            gender: p.patient_profiles?.gender || "N/A",
            bloodGroup: p.patient_profiles?.blood_group || "N/A",
          }))
        );
      }
      setLoading(false);
    };

    fetchPatients();
  }, []);

  return (
    <div className="flex flex-col items-center p-8 min-h-screen bg-gray-50">
      <h2 className="text-4xl font-bold text-blue-600 mb-8">
        Doctor Dashboard
      </h2>

      {error && <p className="text-red-500 font-medium">{error}</p>}
      {loading ? (
        <p className="text-gray-600 text-lg">Loading patients...</p>
      ) : (
        <div className="w-full max-w-5xl bg-white p-8 shadow-xl rounded-xl border border-gray-200">
          <h3 className="text-2xl font-semibold mb-6 text-gray-700">
            Assigned Patients
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 shadow-sm rounded-lg overflow-hidden">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="py-4 px-6 text-left text-lg">Name</th>
                  <th className="py-4 px-6 text-left text-lg">Condition</th>
                  <th className="py-4 px-6 text-left text-lg">Age</th>
                  <th className="py-4 px-6 text-left text-lg">Gender</th>
                  <th className="py-4 px-6 text-left text-lg">Blood Group</th>
                  <th className="py-4 px-6 text-center text-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient, index) => (
                  <tr
                    key={patient.id}
                    className={`border-t transition-all ${
                      index % 2 === 0 ? "bg-gray-100" : "bg-white"
                    } hover:bg-gray-200`}
                  >
                    <td className="py-4 px-6 text-gray-700 font-medium">
                      {patient.name}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {patient.condition}
                    </td>
                    <td className="py-4 px-6 text-gray-600">{patient.age}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {patient.gender}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {patient.bloodGroup}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/doctor/patient/${patient.id}`)
                        }
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all"
                      >
                        View Vitals
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
