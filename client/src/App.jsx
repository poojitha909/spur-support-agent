import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';


// Ensure your backend is running on this port
const API_URL = 'http://localhost:3000/api';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(localStorage.getItem('spur_session_id'));
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!sessionId) {
      const newId = uuidv4();
      setSessionId(newId);
      localStorage.setItem('spur_session_id', newId);
    } else {
      fetchHistory(sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const fetchHistory = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/history/${id}`);
      setMessages(res.data);
    } catch (err) {
      console.log("History empty or server down");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { sender: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, {
        message: userMsg.content,
        sessionId: sessionId
      });

      const aiMsg = { sender: 'ai', content: res.data.reply };
      setMessages(prev => [...prev, aiMsg]);
      
      if (res.data.sessionId !== sessionId) {
        setSessionId(res.data.sessionId);
        localStorage.setItem('spur_session_id', res.data.sessionId);
      }

    } catch (error) {
      setMessages(prev => [...prev, { sender: 'error', content: "Unable to connect to the server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 1. MAIN BACKGROUND: Subtle Gradient
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 font-sans p-4">
      
      <div className="w-full max-w-[420px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-white/50 ring-1 ring-black/5">
        
        {/* 2. HEADER: Clean & Professional */}
        <div className="bg-white/80 backdrop-blur-md p-5 border-b border-gray-100 flex items-center gap-4 sticky top-0 z-10">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg text-white">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">Spur Agent</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-xs text-gray-500 font-medium">Online</p>
            </div>
          </div>
        </div>

        {/* 3. CHAT AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#FAFAFA]">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60 mt-10">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-500 text-sm font-medium">How can I help you today?</p>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Bot Icon for AI messages */}
              {msg.sender !== 'user' && (
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] ${msg.sender === 'error' ? 'bg-red-500' : 'bg-blue-600'}`}>
                  {msg.sender === 'error' ? '!' : <Bot size={14} />}
                </div>
              )}

              <div
                className={`max-w-[80%] p-3.5 shadow-sm text-[15px] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
                    : msg.sender === 'error'
                    ? 'bg-red-50 border border-red-100 text-red-600 rounded-2xl'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm'
                }`}
              >
                {msg.sender === 'error' && <AlertCircle className="inline w-4 h-4 mr-1 -mt-1" />}
                {msg.content}
              </div>

              {/* User Icon for User messages */}
              {msg.sender === 'user' && (
                <div className="w-6 h-6 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-gray-500">
                  <User size={14} />
                </div>
              )}
            </div>
          ))}
          
          {/* 4. TYPING INDICATOR */}
          {isLoading && (
            <div className="flex justify-start items-end gap-2">
               <div className="w-6 h-6 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white">
                  <Bot size={14} />
               </div>
              <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 5. INPUT AREA */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form 
            onSubmit={sendMessage} 
            className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-gray-700 placeholder-gray-400 text-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-300 font-medium">Powered by Gemini AI</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
