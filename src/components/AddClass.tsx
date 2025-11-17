import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AddClass() {
  const [name, setName] = useState("");
  const [instructor, setInstructor] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [capacity, setCapacity] = useState(20);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("gym_classes").insert({
        name,
        instructor,
        description,
        start_time: startTime,
        end_time: endTime,
        capacity,
        category,
      });
      if (error) throw error;
      // reset
      setName("");
      setInstructor("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setCapacity(20);
      setCategory("");
      alert("Class added");
    } catch (err: any) {
      alert(err.message || "Failed to add class");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded">
      <div>
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label>Instructor</Label>
        <Input value={instructor} onChange={(e) => setInstructor(e.target.value)} />
      </div>
      <div>
        <Label>Category</Label>
        <Input value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div>
        <Label>Start time (ISO)</Label>
        <Input value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="2025-11-17T09:00:00Z" />
      </div>
      <div>
        <Label>End time (ISO)</Label>
        <Input value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="2025-11-17T10:00:00Z" />
      </div>
      <div>
        <Label>Capacity</Label>
        <Input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Class'}</Button>
    </form>
  );
}
