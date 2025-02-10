"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function PatientProfilePage() {
  const [profile, setProfile] = useState({
    condition: "",
    age: "",
    blood_group: "",
    gender: "",
    contact_number: "",
    emergency_contact: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: user, error: authError } = await supabase.auth.getUser();
      if (authError || !user?.user) {
        console.error("Error getting user:", authError?.message);
        return;
      }

      const { data, error } = await supabase
        .from("patient_profiles")
        .select(
          "condition, age, blood_group, gender, contact_number, emergency_contact, address"
        )
        .eq("id", user.user.id)
        .maybeSingle(); // Use maybeSingle() to avoid JSON errors

      if (error) {
        console.error("Error fetching profile:", error.message);
      } else {
        setProfile({
          condition: data?.condition || "",
          age: data?.age || "",
          blood_group: data?.blood_group || "",
          gender: data?.gender || "",
          contact_number: data?.contact_number || "",
          emergency_contact: data?.emergency_contact || "",
          address: data?.address || "",
        });
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.user) {
      setError("Authentication error. Please log in again.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("patient_profiles")
      .upsert({ id: user.user.id, ...profile }) // Use upsert to insert if missing
      .eq("id", user.user.id);

    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Update Profile</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="text"
          name="condition"
          placeholder="Condition"
          value={profile.condition}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={profile.age}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          name="blood_group"
          placeholder="Blood Group"
          value={profile.blood_group}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <select
          name="gender"
          value={profile.gender}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          name="contact_number"
          placeholder="Contact Number"
          value={profile.contact_number}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          name="emergency_contact"
          placeholder="Emergency Contact"
          value={profile.emergency_contact}
          onChange={handleChange}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={profile.address}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
