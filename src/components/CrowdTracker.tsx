import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface OccupancyData {
  status: string;
  percent: number;
  color: string;
  activeCount?: number;
  capacity?: number;
}

const CrowdTracker = () => {
  const [data, setData] = useState<OccupancyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOccupancy();
    const interval = setInterval(fetchOccupancy, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchOccupancy = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gym-occupancy`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching occupancy:", error);
    } finally {
      setLoading(false);
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case "green":
        return "text-green-600 dark:text-green-400";
      case "yellow":
        return "text-yellow-600 dark:text-yellow-400";
      case "red":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getBgClass = (color: string) => {
    switch (color) {
      case "green":
        return "bg-green-100 dark:bg-green-900/20";
      case "yellow":
        return "bg-yellow-100 dark:bg-yellow-900/20";
      case "red":
        return "bg-red-100 dark:bg-red-900/20";
      default:
        return "bg-muted";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gym Occupancy</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Gym Occupancy
        </CardTitle>
        <CardDescription>Real-time crowd status</CardDescription>
      </CardHeader>
      <CardContent>
        {data && (
          <div className="space-y-4">
            <div className={`text-4xl font-bold ${getColorClass(data.color)}`}>
              {data.percent}%
            </div>
            {typeof data.activeCount === 'number' && typeof data.capacity === 'number' && (
              <div className="text-sm text-muted-foreground">
                {data.activeCount} of {data.capacity} currently active
              </div>
            )}
            <div className={`inline-block px-4 py-2 rounded-full ${getBgClass(data.color)}`}>
              <span className={`font-medium ${getColorClass(data.color)}`}>
                {data.status}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CrowdTracker;
