"use client";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";

export default function NurseDashboard() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  if (loading) return <p>Loading...</p>;
  if (!user || role !== "Nurse") {
    router.push("/login");
    return null;
  }

  return <h1>Welcome, Nurse</h1>;
}
