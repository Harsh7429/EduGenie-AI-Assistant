import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import api from "../services/api";
import { toast } from "../components/Toast";
import PageHeader from "../components/PageHeader";

const SUBJECTS=["General MCA","Data Structures","DBMS","Operating Systems","Computer Networks","Software Engineering","Web Technologies","AI & ML","Theory of Computation","Compiler Design","Advanced Java","Python"];
const STARTERS=["Explain binary search trees","What is normalization in DBMS?","How does TCP/IP work?","Explain the OSI model"];
const Send=()=><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 8L2 2l2.5 6L2 14L14 8z" fill="currentColor"/></svg>;

export default function ChatTutor() {
  const [messages,setMessages]=useState([{role:"assistant",content:"Hello! I'm EduGenie, your personal MCA tutor. What topic would you like to explore today?"}]);
  const [input,setInput]=useState(""); const [loading,setLoading]=useState(false); const [subject,setSubject]=useState("General MCA");
  const endRef=useRef(null); const inputRef=useRef(null);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,loading]);

  const handleSend=async(text)=>{
    const msg=(text||input).trim(); if(!msg||loading) return;
    setMessages(p=>[...p,{role:"user",content:msg}]); setInput(""); setLoading(true);
    try{
      const history=messages.slice(-6).map(m=>({role:m.role,content:m.content}));
      const r=await api.post("/ai/chat",{message:msg,subject,history});
      setMessages(p=>[...p,{role:"assistant",content:r.data.reply}]);
    } catch{ setMessages(p=>[...p,{role:"assistant",content:"Sorry, I couldn't connect. Please try again."}]); }
    finally{ setLoading(false); inputRef.current?.focus(); }
  };

  const handleKey=e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); handleSend(); } };
  const clearChat=()=>{ setMessages([{role:"assistant",content:"Chat cleared! Ask me anything about MCA topics."}]); toast.info("Chat cleared."); };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 110px)", minHeight:480 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14, flexWrap:"wrap", gap:10 }}>
        <PageHeader title="AI" accent="Tutor" accentColor="var(--sapphire)" sub="Your 24/7 MCA exam companion"/>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <select className="glow-input" value={subject} onChange={e=>setSubject(e.target.value)} style={{ width:170 }}>
            {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={clearChat} style={{ padding:"8px 14px", borderRadius:8, border:"1px solid var(--border-med)", background:"transparent", color:"var(--ink-3)", fontFamily:"var(--font-body)", fontSize:".78rem", cursor:"pointer", transition:"all .15s", whiteSpace:"nowrap" }}
            onMouseEnter={e=>{e.currentTarget.style.color="var(--ruby)";e.currentTarget.style.borderColor="var(--ruby-border)";}}
            onMouseLeave={e=>{e.currentTarget.style.color="var(--ink-3)";e.currentTarget.style.borderColor="var(--border-med)";}}>Clear</button>
        </div>
      </div>

      <div className="glass" style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:12, marginBottom:12 }}>
        {messages.length===1 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:4 }}>
            {STARTERS.map(s=>(
              <button key={s} onClick={()=>handleSend(s)} style={{ padding:"6px 12px", borderRadius:99, fontSize:".77rem", border:"1px solid var(--border-med)", background:"var(--bg-elevated)", color:"var(--ink-3)", cursor:"pointer", fontFamily:"var(--font-body)", transition:"all .15s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--sapphire-border)";e.currentTarget.style.color="var(--sapphire)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-med)";e.currentTarget.style.color="var(--ink-3)";}}>
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((msg,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:msg.role==="user"?"flex-end":"flex-start" }}>
            <div style={{ maxWidth:"78%", padding:"11px 15px", borderRadius:12, background:msg.role==="user"?"var(--sapphire)":"var(--bg-3)", color:msg.role==="user"?"#fff":"var(--ink-2)", border:msg.role==="user"?"none":"1px solid var(--border)", fontSize:".875rem", lineHeight:1.65, borderBottomRightRadius:msg.role==="user"?4:12, borderBottomLeftRadius:msg.role==="user"?12:4 }}>
              {msg.role==="assistant"?<div className="chat-md"><ReactMarkdown>{msg.content}</ReactMarkdown></div>:msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", justifyContent:"flex-start" }}>
            <div style={{ padding:"12px 16px", borderRadius:12, borderBottomLeftRadius:4, background:"var(--bg-3)", border:"1px solid var(--border)", display:"flex", gap:4, alignItems:"center" }}>
              {[0,1,2].map(i=><div key={i} style={{ width:6,height:6,borderRadius:"50%",background:"var(--ink-4)",animation:`bounce .8s ${i*.15}s ease-in-out infinite` }}/>)}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
        <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
          placeholder={`Ask about ${subject}… (Enter to send)`} rows={1}
          style={{ flex:1, background:"var(--bg-3)", border:"1px solid var(--border-med)", borderRadius:11, padding:"11px 14px", color:"var(--ink)", fontFamily:"var(--font-body)", fontSize:".9rem", outline:"none", resize:"none", lineHeight:1.5, maxHeight:120, overflowY:"auto", transition:"border-color .18s", WebkitAppearance:"none" }}
          onFocus={e=>e.target.style.borderColor="var(--sapphire)"}
          onBlur={e=>e.target.style.borderColor="var(--border-med)"}
          onInput={e=>{ e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,120)+"px"; }}
        />
        <button onClick={()=>handleSend()} disabled={loading||!input.trim()}
          style={{ width:42,height:42,borderRadius:10,border:"none",flexShrink:0, background:input.trim()?"var(--sapphire)":"var(--bg-elevated)", color:input.trim()?"#fff":"var(--ink-4)", cursor:input.trim()?"pointer":"not-allowed", display:"flex",alignItems:"center",justifyContent:"center", transition:"all .18s", WebkitTapHighlightColor:"transparent" }}>
          <Send/>
        </button>
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}`}</style>
    </div>
  );
}