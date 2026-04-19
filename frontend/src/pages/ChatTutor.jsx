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

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 14, gap: 10, alignItems: "flex-end",
    }}>
      {!isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #f59e0b, #2dd4bf)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.8rem", color: "#000", fontWeight: 900,
        }}>E</div>
      )}
      <div style={{
        maxWidth: "75%", padding: "11px 15px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isUser
          ? "var(--amber)"
          : "var(--bg-elevated)",
        border: isUser ? "none" : "1px solid var(--border-med)",
        color: isUser ? "#000" : "var(--ink)",
        fontSize: "0.875rem", lineHeight: 1.65,
        boxShadow: isUser ? "0 4px 16px var(--amber-glow)" : "none",
        wordBreak: "break-word",
        fontWeight: isUser ? 500 : 400,
      }}>
        {isUser
          ? <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
          : <div className="chat-md"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
        }
      </div>
      {isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
          background: "var(--bg-elevated)", border: "1px solid var(--border-med)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem",
        }}>👤</div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, #f59e0b, #2dd4bf)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.8rem", color: "#000", fontWeight: 900,
      }}>E</div>
      <div style={{
        padding: "12px 16px", borderRadius: "16px 16px 16px 4px",
        background: "var(--bg-elevated)", border: "1px solid var(--border-med)",
        display: "flex", gap: 5, alignItems: "center",
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: "var(--amber)",
            animation: `bounce 1.2s ease-in-out ${i * 0.18}s infinite`,
          }}/>
        ))}
      </div>
      <style>{`
        @keyframes bounce {
          0%,60%,100% { transform:translateY(0); opacity:0.35; }
          30% { transform:translateY(-7px); opacity:1; }
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
      content: "Hi! I'm EduGenie, your AI study tutor. I can help you understand any MCA topic — from Data Structures to Cloud Computing.\n\nWhat would you like to learn today?",
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
    setMessages([{ role: "assistant", content: "Chat cleared! What would you like to study next?" }]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)", maxWidth: 820, margin: "0 auto" }}>

      {/* Header */}
      <div style={{
        padding: "18px 0 14px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{
              fontFamily: "var(--font-display)", fontStyle: "italic",
              fontSize: "clamp(1.4rem,3vw,1.8rem)", color: "var(--ink)", marginBottom: 3,
            }}>
              AI Chat <span style={{ color: "var(--amber)" }}>Tutor</span>
            </h1>
            <p style={{ color: "var(--ink-3)", fontSize: "0.8rem" }}>Ask anything about your MCA syllabus</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select value={subject} onChange={e => setSubject(e.target.value)} className="glow-input"
              style={{ width: "auto", padding: "7px 12px", fontSize: "0.8rem" }}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={clearChat} style={{
              padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border-med)",
              background: "transparent", color: "var(--ink-3)", cursor: "pointer",
              fontFamily: "var(--font-body)", fontSize: "0.78rem", transition: "all 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--ink)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--ink-3)"}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 0", scrollbarWidth: "thin" }}>
        {messages.length === 1 && (
          <div style={{ marginBottom: 22 }}>
            <p style={{
              color: "var(--ink-4)", fontSize: "0.72rem", textTransform: "uppercase",
              letterSpacing: "0.07em", marginBottom: 10, fontWeight: 600,
            }}>Try asking:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => sendMessage(s)} style={{
                  padding: "6px 13px", borderRadius: 99, fontSize: "0.78rem",
                  background: "var(--bg-elevated)", border: "1px solid var(--border-med)",
                  color: "var(--ink-2)", cursor: "pointer", fontFamily: "var(--font-body)",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(245,158,11,0.35)"; e.currentTarget.style.color = "var(--amber)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-med)"; e.currentTarget.style.color = "var(--ink-2)"; }}>
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
      <div style={{ padding: "12px 0 18px", flexShrink: 0, borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
            rows={1}
            style={{
              flex: 1, padding: "11px 14px", borderRadius: 12,
              background: "var(--bg-elevated)", border: "1px solid var(--border-med)",
              color: "var(--ink)", fontFamily: "var(--font-body)", fontSize: "0.88rem",
              resize: "none", outline: "none", lineHeight: 1.5,
              maxHeight: 120, overflowY: "auto", transition: "border-color 0.18s",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.45)"}
            onBlur={e => e.target.style.borderColor = "var(--border-med)"}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{
            width: 44, height: 44, borderRadius: 11, border: "none", cursor: "pointer", flexShrink: 0,
            background: input.trim() && !loading ? "var(--amber)" : "var(--bg-elevated)",
            color: input.trim() && !loading ? "#000" : "var(--ink-3)",
            fontSize: "1rem", fontWeight: 700,
            transition: "all 0.18s",
            boxShadow: input.trim() && !loading ? "0 4px 16px var(--amber-glow)" : "none",
          }}>
            {loading ? "…" : "↑"}
          </button>
        </div>
        <p style={{ color: "var(--ink-4)", fontSize: "0.7rem", marginTop: 8, textAlign: "center" }}>
          EduGenie AI · Focused on MCA syllabus · Not a substitute for your textbooks
        </p>
      </div>
    </div>
  );
}
