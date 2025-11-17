import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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

  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await fetch(`${window.location.origin}/admin/create-class`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          instructor,
          description,
          start_time: startTime,
          end_time: endTime,
          capacity,
          category,
        }),
      });
      const body = await resp.json();
      if (!resp.ok) throw body;
      // reset
      setName("");
      setInstructor("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setCapacity(20);
      setCategory("");
      toast({ title: 'Class added' });
      // notify other windows/components
      window.dispatchEvent(new CustomEvent('gym:class:created', { detail: body }));
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || JSON.stringify(err), variant: 'destructive' });
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
