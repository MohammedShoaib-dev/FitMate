import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background">
      <div className="text-center space-y-6 px-4">
        <div className="inline-block p-4 bg-gradient-to-br from-primary to-secondary rounded-full mb-4">
          <Dumbbell className="w-16 h-16 text-white" />
        </div>
        <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          FitLife Gym
        </h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Transform your fitness journey with AI-powered workouts and smart class booking
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button onClick={() => navigate("/auth")} variant="gradient" size="lg">
            Get Started
          </Button>
          <Button onClick={() => navigate("/auth")} variant="outline" size="lg">
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
