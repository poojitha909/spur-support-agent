🤖 Spur Support Agent (AI Customer Service Bot)
A full-stack AI Customer Support Agent capable of handling natural language queries, maintaining conversation context (memory), and persisting chat history using a relational database.
Tech Stack:
Frontend: React (Vite), Tailwind CSS, Lucide React
Backend: Node.js, Express.js
Database: PostgreSQL (Supabase)
AI Engine: Google Gemini 2.5 Flash
🚀 How to Run Locally
Prerequisites
Node.js (v18+)
PostgreSQL (Local or Cloud URL)
Google Gemini API Key
Step 1: Clone the Repository
code
Bash
git clone https://github.com/poojitha909/spur-support-agent.git
cd spur-support-agent
Step 2: Backend Setup
Navigate to the backend folder:
Bash
cd backend
Install dependencies:
Bash
npm install
Configure Environment Variables:
Create a .env file in the backend folder.
Add the following:
Env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/spur_db
GEMINI_API_KEY=your_gemini_api_key_here
Start the Server:
Bash
node server.js
Output should say: Server running on port 3000
Step 3: Frontend Setup
Open a new terminal and navigate to the client folder:
Bash
cd client
Install dependencies:
Bash
npm install
Start the UI:
Bash
npm run dev
Open your browser at http://localhost:5173 (or the port shown in terminal).
🗄️ Database Setup (Migrations)
This project requires a PostgreSQL database with two tables: sessions and messages.
Run the following SQL commands in your database query tool (pgAdmin or terminal):
code
SQL
-- 1. Create Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'ai')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Index for Performance
CREATE INDEX idx_session_id ON messages(session_id);
🏗️ Architecture Overview
The application follows a Client-Server Architecture with a decoupled AI service layer.
1. The Frontend (Client)
State Management: Uses React useState for immediate UI updates and useEffect for syncing session history.
Session Logic: Generates a UUID on the client side (uuidv4) and stores it in localStorage. This ensures the user sees their chat history even after refreshing the page.
Styling: Utility-first CSS using Tailwind for a responsive, chat-app aesthetic.
2. The Backend (Server)
API Layer: Express.js handles REST endpoints (POST /chat, GET /history).
Logic Layer:
Checks if a session exists; if not, creates one (preventing Foreign Key crashes).
Orchestrates the AI call.
Saves both User and AI messages transactionally.
Data Layer: pg (node-postgres) for direct, raw SQL queries to ensure maximum control over data interactions.
🤖 LLM Implementation Notes
Provider: Google Gemini (via @google/generative-ai SDK).
Model: gemini-2.5-flash (Optimized for speed and cost-efficiency).
Prompt Engineering Strategy
I implemented a System Instruction pattern to ground the AI. Instead of a generic chatbot, the model is initialized with a specific persona and knowledge base:
"You are a customer support agent for 'SpurShop'. Tone: Helpful, concise. Knowledge Base: Shipping to USA/India/UK, 30-day returns."
This prevents hallucinations and keeps the bot focused on e-commerce support tasks.
⚖️ Trade-offs & "If I had more time..."
Polling vs. WebSockets:
Current: The frontend uses HTTP POST requests. This introduces slight latency.
Future: I would implement Socket.io for real-time, bi-directional streaming of the AI response (typing effect).
Vector Search (RAG):
Current: The knowledge base is hardcoded in the system prompt.
Future: For a larger catalog, I would implement RAG (Retrieval Augmented Generation) using pgvector. The bot would query the database for relevant product info before answering.
Authentication:
Current: Session ID based (Anonymous).
Future: Implement JWT Authentication so users can access history across devices.

