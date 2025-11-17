import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dumbbell } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back!" });
        try {
          // record activity for occupancy calculations by updating profiles.last_active
          const user = data?.session?.user;
          if (user) {
            await supabase.from('profiles').upsert({ id: user.id, created_at: new Date().toISOString() }, { onConflict: 'id' });
            await supabase.from('profiles').update({ created_at: new Date().toISOString() }).eq('id', user.id);
          }
        } catch (err) {
          console.warn('Failed to log user activity', err);
        }
        navigate("/dashboard");
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (error) throw error;
        toast({ title: "Account created! Please check your email." });
        try {
          const user = data?.user;
          if (user) {
            await supabase.from('profiles').upsert({ id: user.id, created_at: new Date().toISOString() }, { onConflict: 'id' });
          }
        } catch (err) {
          console.warn('Failed to log signup activity', err);
        }
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent p-4">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            FitLife Gym
          </CardTitle>
          <CardDescription>
            {isLogin ? "Welcome back! Sign in to continue" : "Create an account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" variant="gradient" disabled={loading}>
              {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
