import React, { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { Tables } from "../integrations/supabase/types";

type Registration = Tables<"user_event_registrations"> & {
  event?: Tables<"events">;
  profile?: Tables<"profiles">;
  signedReceiptUrl?: string; // Added to include signed URL
};

const Users = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      // Optional debug: check current logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      console.log("✅ Logged in user ID:", user?.id);

      if (user) {
        const { data: roleCheck } = await supabase
          .from("user_roles")
          .select("*")
          .eq("id", user.id)
          .single();
        console.log("✅ User role:", roleCheck);
      }

      // Fetch registrations with related event and profile
      const { data, error } = await supabase
        .from("user_event_registrations")
        .select(`
          *,
          event:events(*),
          profile:profiles(*)
        `)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Generate signed URLs for receipts
      const registrationsWithSignedUrls = await Promise.all(
        (data || []).map(async (reg) => {
          if (reg.receipt_url) {
            // Extract file path after 'receipts/'
            const match = reg.receipt_url.match(/receipts\/(.+)$/);
            const filePath = match ? match[1] : reg.receipt_url;

            const { data: signedData, error: signedError } = await supabase.storage
              .from("receipts")
              .createSignedUrl(filePath, 3600); // valid for 1 hour

            if (signedError) {
              console.error("❌ Signed URL error:", signedError);
              return reg;
            }

            if (signedData?.signedUrl) {
              return { ...reg, signedReceiptUrl: signedData.signedUrl };
            }
          }
          return reg;
        })
      );

      setRegistrations(registrationsWithSignedUrls);
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
              <th className="border p-2">Receipt</th>
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
                <td className="border p-2">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      reg.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : reg.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : reg.status === "payment_pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {reg.status}
                  </span>
                </td>

                {/* ✅ Fixed Receipt Cell */}
                <td className="border p-2">
                  {reg.receipt_url ? (
                    <div className="flex flex-col gap-2 items-start">
                      <img
                        src={reg.signedReceiptUrl || reg.receipt_url}
                        alt="Receipt"
                        className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 border"
                        onClick={() =>
                          window.open(
                            reg.signedReceiptUrl || reg.receipt_url,
                            "_blank"
                          )
                        }
                      />
                      <div className="flex gap-2">
                        <a
                          href={reg.signedReceiptUrl || reg.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View
                        </a>
                        <a
                          href={reg.signedReceiptUrl || reg.receipt_url}
                          download
                          className="text-green-600 hover:underline text-sm"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">No receipt</span>
                  )}
                </td>

                <td className="border p-2">{reg.notes ?? "-"}</td>
                <td className="border p-2 text-sm">
                  {new Date(reg.created_at).toLocaleString()}
                </td>
                <td className="border p-2 text-sm">
                  {new Date(reg.updated_at).toLocaleString()}
                </td>
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
