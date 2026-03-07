import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import api from "../services/api";

const SUBJECTS = [
  "General MCA", "Problem Solving Using C", "Computer Organization",
  "Discrete Mathematics", "Data Structures", "Object Oriented Programming Using C++",
  "Operating Systems", "Database Management Systems", "Software Engineering",
  "Computer Networks", "Java Programming", "Web Technologies",
  "Algorithm Design and Analysis", "Information Security",
  "Mobile Application Development", "Cloud Computing", "Machine Learning",
];

const SUGGESTIONS = [
  "Explain the difference between process and thread",
  "What is normalization in DBMS?",
  "How does TCP/IP work?",
  "Explain binary search tree with example",
  "What is polymorphism in OOP?",
  "Difference between stack and queue",
];

const mdStyles = `
  .chat-md p { margin: 0 0 8px 0; }
  .chat-md p:last-child { margin-bottom: 0; }
  .chat-md ul, .chat-md ol { margin: 6px 0 8px 0; padding-left: 20px; }
  .chat-md li { margin-bottom: 4px; }
  .chat-md strong { color: #c7d2fe; font-weight: 700; }
  .chat-md code {
    background: rgba(99,102,241,0.2); border-radius: 4px;
    padding: 1px 6px; font-size: 0.83em; font-family: monospace;
    color: #a5f3fc;
  }
  .chat-md pre {
    background: rgba(0,0,0,0.35); border-radius: 8px;
    padding: 12px 14px; overflow-x: auto; margin: 8px 0;
    border: 1px solid rgba(99,102,241,0.2);
  }
  .chat-md pre code {
    background: transparent; padding: 0; color: #e2e8f0;
    font-size: 0.82em;
  }
  .chat-md h1, .chat-md h2, .chat-md h3 {
    color: #818cf8; margin: 10px 0 6px 0; font-weight: 700;
  }
  .chat-md h1 { font-size: 1rem; }
  .chat-md h2 { font-size: 0.95rem; }
  .chat-md h3 { font-size: 0.9rem; }
  .chat-md blockquote {
    border-left: 3px solid #6366f1; margin: 8px 0;
    padding: 4px 12px; color: #94a3b8;
  }
`;

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 16, gap: 10, alignItems: "flex-end",
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #6366f1, #06b6d4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.85rem", boxShadow: "0 0 12px rgba(99,102,241,0.4)",
        }}>✦</div>
      )}
      <div style={{
        maxWidth: "75%", padding: "12px 16px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser
          ? "linear-gradient(135deg, #6366f1, #4f46e5)"
          : "rgba(255,255,255,0.06)",
        border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
        color: "#f1f5f9", fontSize: "0.88rem", lineHeight: 1.6,
        boxShadow: isUser ? "0 4px 16px rgba(99,102,241,0.3)" : "none",
        wordBreak: "break-word",
      }}>
        {isUser
          ? <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
          : <div className="chat-md"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
        }
      </div>
      {isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem",
        }}>👤</div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 16 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, #6366f1, #06b6d4)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem",
      }}>✦</div>
      <div style={{
        padding: "12px 18px", borderRadius: "18px 18px 18px 4px",
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
        display: "flex", gap: 5, alignItems: "center",
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: "50%", background: "#6366f1",
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}/>
        ))}
      </div>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function ChatTutor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [subject, setSubject]   = useState("General MCA");
  const bottomRef               = useRef(null);
  const inputRef                = useRef(null);

  useEffect(() => {
    setMessages([{
      role: "assistant",
      content: "👋 Hi! I'm EduGenie, your AI study tutor. I can help you understand any MCA topic — from Data Structures to Cloud Computing.\n\nWhat would you like to learn today?",
    }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg = { role: "user", content: msg };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", {
        message: msg,
        subject,
        history: messages.filter(m => m.role !== "system"),
      });
      setMessages([...newHistory, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages([...newHistory, {
        role: "assistant",
        content: "Sorry, I couldn't connect right now. Please try again in a moment.",
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Chat cleared! What would you like to study next?",
    }]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)", maxWidth: 800, margin: "0 auto" }}>
      <style>{mdStyles}</style>

      {/* Header */}
      <div style={{ padding: "20px 0 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="title-font" style={{ fontSize: "clamp(1.4rem,3vw,1.9rem)", marginBottom: 4 }}>
              🤖 AI Chat <span style={{ color: "#6366f1" }}>Tutor</span>
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.82rem" }}>Ask anything about your MCA syllabus</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <select value={subject} onChange={e => setSubject(e.target.value)} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 9, padding: "7px 12px", color: "#e2e8f0",
              fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.8rem", cursor: "pointer",
              maxWidth: 200,
            }}>
              {SUBJECTS.map(s => <option key={s} value={s} style={{ background: "#0a0f1e" }}>{s}</option>)}
            </select>
            <button onClick={clearChat} style={{
              padding: "7px 14px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent", color: "#64748b", cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem",
            }}>Clear</button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 0", scrollbarWidth: "thin" }}>
        {messages.length === 1 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: "#475569", fontSize: "0.75rem", textTransform: "uppercase",
              letterSpacing: "0.06em", marginBottom: 10 }}>Try asking:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => sendMessage(s)} style={{
                  padding: "7px 14px", borderRadius: 99, fontSize: "0.78rem",
                  background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
                  color: "#818cf8", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.18)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.08)"}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "14px 0 20px", flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question... (Enter to send, Shift+Enter for new line)"
            rows={1}
            style={{
              flex: 1, padding: "12px 16px", borderRadius: 14,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(99,102,241,0.25)",
              color: "#f1f5f9", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.88rem",
              resize: "none", outline: "none", lineHeight: 1.5,
              maxHeight: 120, overflowY: "auto",
            }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{
            width: 46, height: 46, borderRadius: 13, border: "none", cursor: "pointer",
            background: input.trim() && !loading
              ? "linear-gradient(135deg, #6366f1, #4f46e5)"
              : "rgba(99,102,241,0.2)",
            color: "#fff", fontSize: "1.1rem", flexShrink: 0,
            transition: "all 0.2s", boxShadow: input.trim() && !loading ? "0 4px 16px rgba(99,102,241,0.4)" : "none",
          }}>
            {loading ? "⏳" : "↑"}
          </button>
        </div>
        <p style={{ color: "#334155", fontSize: "0.7rem", marginTop: 8, textAlign: "center" }}>
          EduGenie AI · Focused on MCA syllabus · Not a substitute for your textbooks
        </p>
      </div>
    </div>
  );
}
