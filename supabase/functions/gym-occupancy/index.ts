import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Mock crowd tracking with time-based logic
    const hour = new Date().getHours();
    
    let status: string;
    let percent: number;
    let color: string;
    
    // Peak hours: 6-9 AM and 5-8 PM
    if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20)) {
      percent = Math.floor(Math.random() * 20) + 70; // 70-90%
      status = 'Very Busy';
      color = 'red';
    } 
    // Moderate hours: 10 AM - 4 PM
    else if (hour >= 10 && hour <= 16) {
      percent = Math.floor(Math.random() * 30) + 40; // 40-70%
      status = 'Moderately Busy';
      color = 'yellow';
    } 
    // Off-peak hours
    else {
      percent = Math.floor(Math.random() * 30) + 10; // 10-40%
      status = 'Quiet';
      color = 'green';
    }

    console.log('Gym occupancy:', { status, percent, color });

    return new Response(
      JSON.stringify({ status, percent, color }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in gym-occupancy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
