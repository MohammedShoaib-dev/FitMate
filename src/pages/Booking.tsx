import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface GymClass {
  id: string;
  name: string;
  instructor: string;
  description: string;
  start_time: string;
  end_time: string;
  capacity: number;
  category: string;
}

const Booking = () => {
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [bookedClasses, setBookedClasses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
        loadClasses(session.user.id);
      }
    });
    const onCreated = () => {
      if (userId) loadClasses(userId);
    };
    window.addEventListener('gym:class:created', onCreated as EventListener);
    return () => window.removeEventListener('gym:class:created', onCreated as EventListener);
  }, [navigate]);

  const loadClasses = async (uid: string) => {
    const { data: classesData } = await supabase
      .from("gym_classes")
      .select("*")
      .order("start_time", { ascending: true });

    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("class_id")
      .eq("user_id", uid);

    setClasses(classesData || []);
    setBookedClasses(new Set(bookingsData?.map((b) => b.class_id) || []));
    setLoading(false);
  };

  const handleBook = async (classId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .insert({ class_id: classId, user_id: userId });

      if (error) throw error;

      setBookedClasses(new Set([...bookedClasses, classId]));
      toast({ title: "Class booked successfully!" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancel = async (classId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("class_id", classId)
        .eq("user_id", userId);

      if (error) throw error;

      const newBooked = new Set(bookedClasses);
      newBooked.delete(classId);
      setBookedClasses(newBooked);
      toast({ title: "Booking cancelled" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Yoga: "from-purple-500 to-pink-500",
      HIIT: "from-red-500 to-orange-500",
      Strength: "from-blue-500 to-cyan-500",
      Cardio: "from-green-500 to-teal-500",
      Dance: "from-pink-500 to-rose-500",
    };
    return colors[category] || "from-primary to-secondary";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading classes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button onClick={() => navigate("/dashboard")} variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Book a Class</h1>
          <p className="text-muted-foreground">Reserve your spot in upcoming fitness classes</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((gymClass) => {
            const isBooked = bookedClasses.has(gymClass.id);
            return (
              <Card key={gymClass.id} className="overflow-hidden hover:shadow-lg transition-all">
                <div className={`h-3 bg-gradient-to-r ${getCategoryColor(gymClass.category)}`} />
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {gymClass.name}
                    <span className="text-xs font-normal px-2 py-1 bg-accent rounded-full">
                      {gymClass.category}
                    </span>
                  </CardTitle>
                  <CardDescription>{gymClass.instructor}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{gymClass.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{format(new Date(gymClass.start_time), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>
                        {format(new Date(gymClass.start_time), "h:mm a")} -{" "}
                        {format(new Date(gymClass.end_time), "h:mm a")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>Capacity: {gymClass.capacity}</span>
                    </div>
                  </div>
                  {isBooked ? (
                    <Button
                      onClick={() => handleCancel(gymClass.id)}
                      variant="destructive"
                      className="w-full"
                    >
                      Cancel Booking
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleBook(gymClass.id)}
                      variant="gradient"
                      className="w-full"
                    >
                      Book Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {classes.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No classes available at the moment</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Booking;
