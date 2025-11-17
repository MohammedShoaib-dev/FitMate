const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const SUPA_URL = process.env.SUPA_URL;
const SUPA_SERVICE_ROLE = process.env.SUPA_SERVICE_ROLE;

if (!SUPA_URL || !SUPA_SERVICE_ROLE) {
  console.error('Set SUPA_URL and SUPA_SERVICE_ROLE env vars');
  process.exit(1);
}

const supabase = createClient(SUPA_URL, SUPA_SERVICE_ROLE);

app.post('/admin/create-user', async (req, res) => {
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

app.listen(3001, () => console.log('Server running on http://localhost:3001'));
