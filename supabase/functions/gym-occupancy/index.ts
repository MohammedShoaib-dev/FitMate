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
    // Attempt to compute occupancy from recent profile activity (proxy for logins)
    // Config: capacity from env or default 100
    const CAPACITY = Number(Deno.env.get('CAPACITY') || '100');
    const WINDOW_MINUTES = Number(Deno.env.get('WINDOW_MINUTES') || '60');

    try {
      // Query Postgres via REST endpoint for profiles created/updated in the last WINDOW_MINUTES
      const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
      const encodedSince = encodeURIComponent(since);
      // request only ids but ask PostgREST to return an exact count in headers
      const url = `${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?created_at=gte.${encodedSince}&select=id`;
      const resp = await fetch(url, {
        headers: {
          apikey: Deno.env.get('SUPABASE_ANON_KEY') || '',
          Authorization: `Bearer ${Deno.env.get('SUPABASE_ANON_KEY') || ''}`,
          Prefer: 'count=exact'
        },
      });

      if (resp.ok) {
        // Try to parse total from Content-Range header (format: 0-9/123)
        const contentRange = resp.headers.get('content-range');
        let activeCount = 0;
        if (contentRange) {
          const parts = contentRange.split('/');
          if (parts.length === 2) {
            const total = Number(parts[1]);
            if (!Number.isNaN(total)) activeCount = total;
          }
        }
        // fallback to JSON length if header missing
        if (activeCount === 0) {
          const items = await resp.json();
          activeCount = Array.isArray(items) ? items.length : 0;
        }
        const percent = Math.min(100, Math.round((activeCount / CAPACITY) * 100));
        let status = 'Quiet';
        let color = 'green';
        if (percent >= 80) {
          status = 'Very Busy';
          color = 'red';
        } else if (percent >= 40) {
          status = 'Moderately Busy';
          color = 'yellow';
        }

        console.log('Gym occupancy:', { status, percent, color, activeCount, capacity: CAPACITY });

        return new Response(
          JSON.stringify({ status, percent, color, activeCount, capacity: CAPACITY }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // fallthrough to time-based mock if fetch fails
    } catch (err) {
      console.warn('Activity-based occupancy failed, falling back to time-based mock', err);
    }

    // --- fallback: Mock crowd tracking with time-based logic ---
    const hour = new Date().getHours();
    let status: string;
    let percent: number;
    let color: string;
    if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20)) {
      percent = Math.floor(Math.random() * 20) + 70; // 70-90%
      status = 'Very Busy';
      color = 'red';
    } else if (hour >= 10 && hour <= 16) {
      percent = Math.floor(Math.random() * 30) + 40; // 40-70%
      status = 'Moderately Busy';
      color = 'yellow';
    } else {
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
