import React, { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { Tables } from "../integrations/supabase/types";

type Registration = Tables<"user_event_registrations"> & {
  event?: Tables<"events">;
  profile?: Tables<"profiles">;
};

const Users = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_event_registrations")
        .select(`
          *,
          event:events(*),
          profile:profiles(*)
        `)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error: any) {
      console.error("Error fetching registrations:", error.message);
      alert("Failed to fetch registrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">All User Registrations</h1>
      {loading ? (
        <p>Loading...</p>
      ) : registrations.length === 0 ? (
        <p>No registrations found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">User Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Event</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Receipt URL</th>
              <th className="border p-2">Notes</th>
              <th className="border p-2">Created At</th>
              <th className="border p-2">Updated At</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg) => (
              <tr key={reg.id}>
                <td className="border p-2">{reg.profile?.full_name ?? "N/A"}</td>
                <td className="border p-2">{reg.profile?.email ?? "N/A"}</td>
                <td className="border p-2">{reg.profile?.phone ?? "N/A"}</td>
                <td className="border p-2">{reg.event?.event_name ?? "N/A"}</td>
                <td className="border p-2">{reg.status}</td>
                <td className="border p-2">
                  {reg.receipt_url ? (
                    <a href={reg.receipt_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="border p-2">{reg.notes ?? "-"}</td>
                <td className="border p-2">{new Date(reg.created_at).toLocaleString()}</td>
                <td className="border p-2">{new Date(reg.updated_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-4">
        <Button onClick={fetchRegistrations} disabled={loading}>
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default Users;