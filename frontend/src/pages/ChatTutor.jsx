import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import api from "../services/api";
import { toast } from "../components/Toast";
import PageHeader from "../components/PageHeader";

const SUBJECTS=["General MCA","Data Structures","DBMS","Operating Systems","Computer Networks","Software Engineering","Web Technologies","AI & ML","Theory of Computation","Compiler Design","Advanced Java","Python"];
const STARTERS=["Explain binary search trees","What is normalization in DBMS?","How does TCP/IP work?","Explain the OSI model","What is a process vs thread?"];
const Send=()=><svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 7.5L2 2l2 5.5L2 13L13 7.5z" fill="currentColor"/></svg>;

export default function ChatTutor() {
  const [messages,  setMessages]  = useState([{role:"assistant",content:"Hello! I'm EduGenie, your personal MCA tutor. What topic would you like to explore today?"}]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [subject,   setSubject]   = useState("General MCA");
  const endRef=useRef(null); const inputRef=useRef(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,loading]);

  const handleSend=async(text)=>{
    const msg=(text||input).trim(); if(!msg||loading) return;
    setMessages(p=>[...p,{role:"user",content:msg}]); setInput(""); setLoading(true);
    try{
      const history=messages.slice(-6).map(m=>({role:m.role,content:m.content}));
      const r=await api.post("/ai/chat",{message:msg,subject,history});
      setMessages(p=>[...p,{role:"assistant",content:r.data.reply}]);
    }catch{ setMessages(p=>[...p,{role:"assistant",content:"Sorry, I couldn't connect. Please try again."}]); }
    finally{ setLoading(false); inputRef.current?.focus(); }
  };

  const handleKey=e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); handleSend(); } };
  const clearChat=()=>{ setMessages([{role:"assistant",content:"Chat cleared! Ask me anything about MCA topics."}]); toast.info("Chat cleared."); };

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"calc(100vh - 108px)",minHeight:460 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:9 }}>
        <PageHeader title="AI" accent="Tutor" accentColor="var(--blue)" sub="Your 24/7 MCA exam companion"/>
        <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
          <select className="glow-input" value={subject} onChange={e=>setSubject(e.target.value)} style={{ width:165 }}>
            {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={clearChat} style={{ padding:"7px 13px",borderRadius:"var(--r-md)",border:"0.5px solid var(--border-med)",background:"transparent",color:"var(--ink-3)",fontFamily:"var(--font-body)",fontSize:12,cursor:"pointer",transition:"all .13s",whiteSpace:"nowrap" }}
            onMouseEnter={e=>{e.currentTarget.style.color="var(--coral)";e.currentTarget.style.borderColor="var(--coral-border)";}}
            onMouseLeave={e=>{e.currentTarget.style.color="var(--ink-3)";e.currentTarget.style.borderColor="var(--border-med)";}}>Clear</button>
        </div>
      </div>

      <div className="glass" style={{ flex:1,overflowY:"auto",padding:"14px",display:"flex",flexDirection:"column",gap:10,marginBottom:10 }}>
        {messages.length===1&&(
          <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:4 }}>
            {STARTERS.map(s=>(
              <button key={s} onClick={()=>handleSend(s)} style={{ padding:"5px 11px",borderRadius:99,fontSize:12,border:"0.5px solid var(--border-med)",background:"var(--bg-elevated)",color:"var(--ink-3)",cursor:"pointer",fontFamily:"var(--font-body)",transition:"all .13s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--blue-border)";e.currentTarget.style.color="var(--blue)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-med)";e.currentTarget.style.color="var(--ink-3)";}}>
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((msg,i)=>(
          <div key={i} style={{ display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start" }}>
            <div style={{ maxWidth:"78%",padding:"10px 14px",borderRadius:11,background:msg.role==="user"?"var(--blue)":"var(--bg-3)",color:msg.role==="user"?"#fff":"var(--ink-2)",border:msg.role==="user"?"none":"0.5px solid var(--border)",fontSize:13,lineHeight:1.65,borderBottomRightRadius:msg.role==="user"?3:11,borderBottomLeftRadius:msg.role==="user"?11:3 }}>
              {msg.role==="assistant"?<div className="chat-md"><ReactMarkdown>{msg.content}</ReactMarkdown></div>:msg.content}
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{ display:"flex",justifyContent:"flex-start" }}>
            <div style={{ padding:"11px 14px",borderRadius:11,borderBottomLeftRadius:3,background:"var(--bg-3)",border:"0.5px solid var(--border)",display:"flex",gap:4,alignItems:"center" }}>
              {[0,1,2].map(i=><div key={i} style={{ width:5,height:5,borderRadius:"50%",background:"var(--ink-4)",animation:`bounce .8s ${i*.15}s ease-in-out infinite` }}/>)}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      <div style={{ display:"flex",gap:8,alignItems:"flex-end" }}>
        <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
          placeholder={`Ask about ${subject}… (Enter to send)`} rows={1}
          style={{ flex:1,background:"var(--bg-3)",border:"0.5px solid var(--border-med)",borderRadius:10,padding:"10px 13px",color:"var(--ink)",fontFamily:"var(--font-body)",fontSize:13,outline:"none",resize:"none",lineHeight:1.5,maxHeight:110,overflowY:"auto",transition:"border-color .15s",WebkitAppearance:"none" }}
          onFocus={e=>e.target.style.borderColor="var(--blue)"}
          onBlur={e=>e.target.style.borderColor="var(--border-med)"}
          onInput={e=>{ e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,110)+"px"; }}
        />
        <button onClick={()=>handleSend()} disabled={loading||!input.trim()}
          style={{ width:38,height:38,borderRadius:9,border:"none",flexShrink:0,background:input.trim()?"var(--blue)":"var(--bg-elevated)",color:input.trim()?"#fff":"var(--ink-4)",cursor:input.trim()?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",WebkitTapHighlightColor:"transparent" }}>
          <Send/>
        </button>
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);}}`}</style>
    </div>
  );
}