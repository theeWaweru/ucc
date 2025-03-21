"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Adminboard from "./dashboard/page";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login page if not authenticated
    if (status === "unauthenticated") {
      router.push("/auth/sign-in");
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);

  if (loading || status !== "authenticated") {
    return null; // Layout handles loading state
  }

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>

      <div className="bg-white shadow overflow-hidden rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Welcome back, {session?.user?.name || session?.user?.email}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              This is the admin dashboard for Uhai Centre Church. Use the
              navigation menu to manage various aspects of the website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
