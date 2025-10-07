import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import type { Database } from "../integrations/supabase/types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

const Events = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [newEvent, setNewEvent] = useState({
    event_name: "",
    location: "",
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(false);

  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      toast({ title: "Error fetching events", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    if (!newEvent.event_name || !newEvent.location || !newEvent.start_date || !newEvent.end_date) {
      toast({ title: "Validation Error", description: "All fields are required", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("events").insert(newEvent as EventInsert);
      if (error) throw error;
      toast({ title: "Event added!" });
      setNewEvent({ event_name: "", location: "", start_date: "", end_date: "" });
      fetchEvents();
    } catch (error: any) {
      toast({ title: "Error adding event", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Event deleted!" });
      fetchEvents();
    } catch (error: any) {
      toast({ title: "Error deleting event", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateEvent = async (id: string, updates: Partial<EventUpdate>) => {
    try {
      const updateData: EventUpdate = {
        ...(updates.event_name !== undefined && { event_name: updates.event_name }),
        ...(updates.location !== undefined && { location: updates.location }),
        ...(updates.start_date !== undefined && { start_date: updates.start_date }),
        ...(updates.end_date !== undefined && { end_date: updates.end_date }),
      };
      const { error } = await supabase.from("events").update(updateData).eq("id", id);
      if (error) throw error;
      toast({ title: "Event updated!" });
      fetchEvents();
    } catch (error: any) {
      toast({ title: "Error updating event", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div>
      {/* Add new event */}
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

      {/* Event list */}
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="p-4 bg-white shadow rounded flex justify-between items-center">
            <div>
              <p className="font-bold">{event.event_name}</p>
              <p>{event.location}</p>
              <p>{event.start_date} - {event.end_date}</p>
            </div>
            <div className="space-x-2">
              <Button onClick={() => {setEditingEvent(event); setIsModalOpen(true);}}>Update</Button>
              <Button onClick={() => handleDeleteEvent(event.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <div className="space-y-2 mt-4">
              <Input
                placeholder="Event Name"
                value={editingEvent.event_name}
                onChange={(e) => setEditingEvent({ ...editingEvent, event_name: e.target.value })}
              />
              <Input
                placeholder="Location"
                value={editingEvent.location}
                onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
              />
              <Input
                type="date"
                placeholder="Start Date"
                value={editingEvent.start_date}
                onChange={(e) => setEditingEvent({ ...editingEvent, start_date: e.target.value })}
              />
              <Input
                type="date"
                placeholder="End Date"
                value={editingEvent.end_date}
                onChange={(e) => setEditingEvent({ ...editingEvent, end_date: e.target.value })}
              />
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (editingEvent) {
                  await handleUpdateEvent(editingEvent.id, {
                    event_name: editingEvent.event_name,
                    location: editingEvent.location,
                    start_date: editingEvent.start_date,
                    end_date: editingEvent.end_date,
                  });
                  setIsModalOpen(false);
                  setEditingEvent(null);
                }
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Events;
