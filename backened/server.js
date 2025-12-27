require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 1. Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { 
        require: true,
        rejectUnauthorized: false 
     }
});

// 2. Gemini Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    systemInstruction: `You are a customer support agent for 'SpurShop'.
    Tone: Helpful, concise, professional.
    KNOWLEDGE BASE:
    - Shipping: We ship to USA, UK, and India. Free shipping over $50.
    - Returns: 30-day return policy. Customer pays return shipping.
    - Support Hours: Mon-Fri, 9 AM - 5 PM EST.
    If you do not know the answer, say "I'm not sure, let me connect you to a human."`
});

// --- ROUTES ---

// GET /api/health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  try {
    // 1. Ensure Session Exists
    const sessionCheck = await pool.query('SELECT id FROM sessions WHERE id = $1', [sessionId]);
    
    if (sessionCheck.rows.length === 0) {
      await pool.query('INSERT INTO sessions (id) VALUES ($1)', [sessionId]);
    }

    // 2. Save User Message
    await pool.query(
      'INSERT INTO messages (session_id, sender, content) VALUES ($1, $2, $3)',
      [sessionId, 'user', message]
    );

    // 3. GENERATE AI RESPONSE (The missing piece)
    // We send the user message to Gemini
    const result = await model.generateContent(message);
    const aiReply = result.response.text();

    // 4. Save AI Message
    await pool.query(
      'INSERT INTO messages (session_id, sender, content) VALUES ($1, $2, $3)',
      [sessionId, 'ai', aiReply]
    );
    
    // 5. Return the actual AI text
    res.json({ reply: aiReply, sessionId });

  } catch (err) {
    console.error("Backend Error:", err.message); 
    res.status(500).json({ error: "Brain malfunction" });
  }
});

// GET /api/history/:sessionId
app.get('/api/history/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const result = await pool.query(
            'SELECT sender, content, created_at FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
            [sessionId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));