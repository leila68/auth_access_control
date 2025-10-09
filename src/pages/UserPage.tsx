import React, { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Tables } from "../integrations/supabase/types";

type Registration = Tables<"user_event_registrations"> & {
  event: Tables<"events">;
};

const UserPage = () => {
  const [events, setEvents] = useState<Tables<"events">[]>([]);
  const [myEvents, setMyEvents] = useState<Registration[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get current user
  const getUser = async () => {
    const { data: userData, error } = await supabase.auth.getUser();
    if (error || !userData?.user) {
      navigate("/auth");
      return null;
    }
    return userData.user;
  };

  // Fetch all events
  const fetchEvents = async () => {
    const { data, error } = await supabase.from("events").select("*");
    if (error) console.error("Error fetching events:", error.message);
    else setEvents(data);
  };

  // Fetch user's selected events
  const fetchMyEvents = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_event_registrations")
      .select("*, event:events(*)")
      .eq("user_id", userId);

    if (error) console.error("Error fetching user events:", error.message);
    else setMyEvents(data || []);
  };

  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (user) {
        await fetchEvents();
        await fetchMyEvents(user.id);
      }
    })();
  }, []);

  // Select event → save in database
  const handleSelectEvent = async (event: Tables<"events">) => {
    const user = await getUser();
    if (!user) return;

    // Check if already selected
    const already = myEvents.find((e) => e.event_id === event.id);
    if (already) {
      alert("You have already selected this event.");
      return;
    }

    const { error } = await supabase.from("user_event_registrations").insert({
      user_id: user.id,
      event_id: event.id,
      status: "selected",
    });

    if (error) console.error("Error adding event:", error.message);
    else fetchMyEvents(user.id);
  };

  // Remove event from user list
  const handleRemoveEvent = async (registrationId: string) => {
    const user = await getUser();
    if (!user) return;

    const { error } = await supabase
      .from("user_event_registrations")
      .delete()
      .eq("id", registrationId)
      .eq("user_id", user.id);

    if (error) console.error("Error removing event:", error.message);
    else fetchMyEvents(user.id);
  };

  // Handle file upload for payment receipt
  const handleUploadReceipt = async (registration: Registration, file: File) => {
    const user = await getUser();
    if (!user) return;
    setUploading(registration.id);

    const filePath = `${user.id}/${registration.event_id}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("receipts") // Make sure this bucket exists
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      setUploading(null);
      return;
    }

    const { error: updateError } = await supabase
      .from("user_event_registrations")
      .update({ receipt_url: filePath, status: "payment_pending" })
      .eq("id", registration.id);

    if (updateError) console.error("Error updating receipt:", updateError.message);

    await fetchMyEvents(user.id);
    setUploading(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 space-y-6 p-4">
      <h1 className="text-4xl font-bold text-center text-green-600">User Page</h1>

      {/* All Events */}
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-2">Available Events</h2>
        <ul>
          {events.map((event) => (
            <li
              key={event.id}
              className="border p-3 mb-2 rounded flex justify-between items-center bg-white shadow-sm hover:shadow-md transition w-full whitespace-nowrap overflow-x-auto gap-3"
            >
              <div className="flex-1 min-w-0">
                <strong>{event.event_name}</strong> | {event.location} |{" "}
                {event.start_date} - {event.end_date} |{" "}
                <span className="text-blue-600 font-semibold">
                  ${event.price ?? "N/A"}
                </span>
              </div>
              <Button size="sm" className="shrink-0" onClick={() => handleSelectEvent(event)}>
                Select
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {/* My Events */}
      <div className="w-full max-w-4xl mt-6">
        <h2 className="text-2xl font-bold mb-2">My Events</h2>
        {myEvents.length === 0 ? (
          <p>No events selected yet.</p>
        ) : (
          <ul>
            {myEvents.map((registration) => (
              <li
                key={registration.id}
                className="border p-3 mb-2 rounded bg-white shadow-sm hover:shadow-md transition w-full whitespace-nowrap overflow-x-auto flex flex-col gap-2"
              >
                <div className="flex justify-between items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <strong>{registration.event.event_name}</strong> |{" "}
                    {registration.event.location} |{" "}
                    {registration.event.start_date} -{" "}
                    {registration.event.end_date} |{" "}
                    <span className="text-blue-600 font-semibold">
                      ${registration.event.price ?? "N/A"}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="shrink-0"
                    onClick={() => handleRemoveEvent(registration.id)}
                  >
                    Remove
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  {registration.status === "selected" && (
                    <>
                      <label className="text-sm">Upload Receipt:</label>
                      <Input
                        type="file"
                        accept="image/*,application/pdf"
                        className="w-auto"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadReceipt(registration, file);
                        }}
                      />
                    </>
                  )}
                  {registration.status === "payment_pending" && (
                    <span className="text-yellow-600 font-semibold">
                      Pending Approval
                    </span>
                  )}
                  {registration.status === "approved" && (
                    <span className="text-green-600 font-semibold">
                      Approved ✅
                    </span>
                  )}
                  {registration.status === "rejected" && (
                    <span className="text-red-600 font-semibold">
                      Rejected ❌
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="fixed bottom-6 left-6">
        <Button onClick={() => navigate("/auth")}>Back to Login</Button>
      </div>
    </div>
  );
};

export default UserPage;
