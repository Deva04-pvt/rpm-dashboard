"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Patient");
  const [doctorId, setDoctorId] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name")
        .eq("role", "Doctor");
      if (error) {
        console.error(error);
      } else {
        setDoctors(data);
      }
    };
    fetchDoctors();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Step 1: Sign up user
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (user) {
      // Step 2: Insert into 'profiles'
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: user.id,
          name,
          role,
        },
      ]);

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      // Step 3: If user is a patient, insert into 'patient_profiles' with only name
      if (role === "Patient") {
        const { error: patientProfileError } = await supabase
          .from("patient_profiles")
          .insert([
            {
              id: user.id, // Ensure patient exists before mapping
              name: name, // ✅ Fix: use lowercase 'name' instead of 'Name'
            },
          ]);

        if (patientProfileError) {
          setError(patientProfileError.message);
          setLoading(false);
          return;
        }

        // Step 4: Insert doctor-patient mapping
        if (doctorId) {
          const { error: mappingError } = await supabase
            .from("doctor_patient_mapping")
            .insert([
              {
                doctor_id: doctorId,
                patient_id: user.id,
              },
            ]);

          if (mappingError) {
            setError(mappingError.message);
            setLoading(false);
            return;
          }
        }
      }
    }

    setLoading(false);
    router.push("/login");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="bg-white p-6 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        >
          <option value="Doctor">Doctor</option>
          <option value="Patient">Patient</option>
          <option value="Nurse">Nurse</option>
        </select>
        {role === "Patient" && (
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            required
          >
            <option value="">Select Doctor</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
        )}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
