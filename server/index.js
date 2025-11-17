require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const SUPA_URL = process.env.SUPA_URL;
const SUPA_SERVICE_ROLE = process.env.SUPA_SERVICE_ROLE;

let supabase = null;
if (SUPA_URL && SUPA_SERVICE_ROLE) {
  supabase = createClient(SUPA_URL, SUPA_SERVICE_ROLE);
} else {
  console.warn('SUPA_URL or SUPA_SERVICE_ROLE not set — admin routes will be disabled');
}

app.post('/admin/create-user', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured on server' });
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.admin.createUser({ email, password });
    if (error) return res.status(400).json({ error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/admin/create-class', async (req, res) => {
  const { name, instructor, description, start_time, end_time, capacity, category } = req.body;
  try {
    const { data, error } = await supabase.from('gym_classes').insert({
      name,
      instructor,
      description,
      start_time,
      end_time,
      capacity,
      category,
    });
    if (error) return res.status(400).json({ error });
    res.json(data?.[0] || data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI proxy endpoints (Gemini / Generative Language)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta2';

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY not set — AI endpoints will return 503');
}

async function callGemini(prompt) {
  const url = `${GEMINI_BASE}/models/text-bison-001:generate?key=${GEMINI_API_KEY}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: { text: prompt },
      temperature: 0.2,
      // safetySettings etc could be added here
    }),
  });
  const body = await resp.json();

  // Try a few common response shapes
  const text =
    body?.candidates?.[0]?.output ||
    body?.candidates?.[0]?.content ||
    body?.output ||
    body?.results?.[0]?.candidates?.[0]?.output ||
    JSON.stringify(body);

  return String(text);
}

app.post('/ai/diet', async (req, res) => {
  if (!GEMINI_API_KEY) return res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
  const { age, weight, height, goal, allergies, preferences } = req.body;
  const prompt = `Create a 7-day balanced meal plan for a ${age}-year-old, weight ${weight}kg, height ${height}cm, goal: ${goal}. Allergies: ${allergies || 'none'}. Preferences: ${preferences || 'none'}. Provide calories per day and simple recipes.`;
  try {
    const planText = await callGemini(prompt);
    res.json({ plan: planText });
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.post('/ai/workout', async (req, res) => {
  if (!GEMINI_API_KEY) return res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
  const { goal, level, daysPerWeek } = req.body;
  const prompt = `Create a ${daysPerWeek}-day per week workout plan for ${level} level with goal: ${goal}. Include exercises, sets, reps, and progressions.`;
  try {
    const planText = await callGemini(prompt);
    res.json({ plan: planText });
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));
