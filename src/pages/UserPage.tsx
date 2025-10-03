import React, { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Tables } from "../integrations/supabase/types";

const UserPage = () => {
  const [events, setEvents] = useState<Tables<"events">[]>([]);
  const [myEvents, setMyEvents] = useState<Tables<"events">[]>([]);
  const navigate = useNavigate();

  // Fetch all events
  const fetchEvents = async () => {
    const { data, error } = await supabase.from("events").select("*");
    if (error) {
      console.error("Error fetching events:", error.message);
    } else {
      setEvents(data);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Add event to My Events
  const handleSelectEvent = (event: Tables<"events">) => {
    if (!myEvents.find((e) => e.id === event.id)) {
      setMyEvents((prev) => [...prev, event]);
    }
  };

  // Remove event from My Events
  const handleRemoveEvent = (eventId: string) => {
    setMyEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 space-y-6 p-4">
      <h1 className="text-4xl font-bold text-center text-green-600">User Page</h1>

      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-2">Events</h2>
        <ul>
          {events.map((event) => (
            <li key={event.id} className="border p-2 mb-2 rounded flex justify-between items-center">
              <div>
                <strong>{event.event_name}</strong> | {event.location} | {event.start_date} - {event.end_date}
              </div>
              <Button size="sm" onClick={() => handleSelectEvent(event)}>Select Event</Button>
            </li>
          ))}
        </ul>
      </div>

      {/* My Events Section */}
      <div className="w-full max-w-2xl mt-6">
        <h2 className="text-2xl font-bold mb-2">My Events</h2>
        {myEvents.length === 0 ? (
          <p>No events selected yet.</p>
        ) : (
          <ul>
            {myEvents.map((event) => (
              <li key={event.id} className="border p-2 mb-2 rounded flex justify-between items-center">
                <div>
                  <strong>{event.event_name}</strong> | {event.location} | {event.start_date} - {event.end_date}
                </div>
                <Button size="sm" variant="destructive" onClick={() => handleRemoveEvent(event.id)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
       <div className="fixed bottom-6 left-6">
              <Button onClick={() => navigate("/auth")}>
                Back to Login
              </Button>
            </div>
    </div>
  );
};

export default UserPage;
