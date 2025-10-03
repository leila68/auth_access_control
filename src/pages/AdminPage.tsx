import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import type { Database } from "../integrations/supabase/types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";


// Define event types from Database
type EventRow = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

const AdminPage = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventRow[]>([]);
  const navigate = useNavigate();  
  const [newEvent, setNewEvent] = useState({
    event_name: "",
    location: "",
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch events from Supabase
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) throw error;
      if (data) setEvents(data);
    } catch (error: any) {
      toast({
        title: "Error fetching events",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Add new event
  const handleAddEvent = async () => {
    // Validate required fields
    if (!newEvent.event_name || !newEvent.location || !newEvent.start_date || !newEvent.end_date) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const eventToInsert: EventInsert = {
        event_name: newEvent.event_name,
        location: newEvent.location,
        start_date: newEvent.start_date,
        end_date: newEvent.end_date,
      };

      const { data, error } = await supabase
        .from("events")
        .insert(eventToInsert)
        .select();

      if (error) throw error;
      toast({ title: "Event added!" });
      setNewEvent({ event_name: "", location: "", start_date: "", end_date: "" });
      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error adding event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Delete event
  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast({ title: "Event deleted!" });
      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error deleting event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Update event
  const handleUpdateEvent = async (id: string, updates: Partial<EventUpdate>) => {
    try {
      const updateData: EventUpdate = {
        ...(updates.event_name !== undefined && { event_name: updates.event_name }),
        ...(updates.location !== undefined && { location: updates.location }),
        ...(updates.start_date !== undefined && { start_date: updates.start_date }),
        ...(updates.end_date !== undefined && { end_date: updates.end_date }),
      };

      const { error } = await supabase
        .from("events")
        .update(updateData)
        .eq("id", id);
      
      if (error) throw error;
      toast({ title: "Event updated!" });
      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error updating event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">Admin Page - Events CRUD</h1>

      <div className="mb-6 space-y-2">
        <Input
          placeholder="Event Name"
          value={newEvent.event_name}
          onChange={(e) => setNewEvent({ ...newEvent, event_name: e.target.value })}
        />
        <Input
          placeholder="Location"
          value={newEvent.location}
          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
        />
        <Input
          type="date"
          placeholder="Start Date"
          value={newEvent.start_date}
          onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
        />
        <Input
          type="date"
          placeholder="End Date"
          value={newEvent.end_date}
          onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
        />
        <Button onClick={handleAddEvent} disabled={loading}>
          {loading ? "Adding..." : "Add Event"}
        </Button>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="p-4 bg-white shadow rounded flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{event.event_name}</p>
              <p>{event.location}</p>
              <p>
                {event.start_date} - {event.end_date}
              </p>
            </div>
            <div className="space-x-2">
              <Button
                onClick={() =>
                  handleUpdateEvent(event.id, { event_name: event.event_name + " (Updated)" })
                }
              >
                Update
              </Button>
              <Button onClick={() => handleDeleteEvent(event.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-6 left-6">
        <Button onClick={() => navigate("/auth")}>
          Back to Login
        </Button>
      </div>

    </div>
  );
};

export default AdminPage;