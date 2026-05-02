import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
export default function Signup() {
  const navigate=useNavigate();
  const [form,setForm]=useState({name:"",email:"",password:"",confirmPassword:""});
  const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  const handleChange=e=>setForm({...form,[e.target.name]:e.target.value});
  const handleSubmit=async e=>{ e.preventDefault(); setError(""); if(!form.name||!form.email||!form.password){setError("All fields are required.");return;} if(form.password.length<6){setError("Password must be at least 6 characters.");return;} if(form.password!==form.confirmPassword){setError("Passwords do not match.");return;} try{setLoading(true);await api.post("/signup",{name:form.name,email:form.email,password:form.password});navigate("/login");}catch(err){setError(err.response?.data?.error||"Signup failed.");}finally{setLoading(false);} };
  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"44px 20px" }}>
      <div style={{ width:"100%",maxWidth:390 }}>
        <div className="fade-up" style={{ textAlign:"center",marginBottom:28 }}>
          <Link to="/login" style={{ display:"inline-flex",alignItems:"center",gap:8,textDecoration:"none",marginBottom:20 }}>
            <div style={{ width:28,height:28,borderRadius:7,background:"var(--amber)",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M2 2h4.5v4.5H2V2z" fill="#0a0806" opacity=".9"/><path d="M6.5 6.5H11V11H6.5V6.5z" fill="#0a0806" opacity=".9"/><circle cx="9" cy="3.5" r="2" stroke="#0a0806" strokeWidth="1.3" opacity=".9"/><circle cx="3.5" cy="9.5" r="2" stroke="#0a0806" strokeWidth="1.3" opacity=".9"/></svg>
            </div>
            <span style={{ fontSize:14,fontWeight:500,color:"var(--ink)",letterSpacing:"-.01em" }}>Edu<span style={{ color:"var(--amber)" }}>Genie</span></span>
          </Link>
          <h1 style={{ fontSize:22,fontWeight:500,color:"var(--ink)",letterSpacing:"-.02em",marginBottom:4 }}>Create your account.</h1>
          <p style={{ color:"var(--ink-3)",fontSize:13 }}>Start studying smarter from day one.</p>
        </div>
        <div className="glass fade-up" style={{ padding:"24px 22px" }}>
          <form onSubmit={handleSubmit}>
            {[{name:"name",type:"text",label:"Full Name",ph:"Your full name"},{name:"email",type:"email",label:"Email",ph:"you@university.edu"},{name:"password",type:"password",label:"Password",ph:"Min. 6 characters"},{name:"confirmPassword",type:"password",label:"Confirm Password",ph:"Repeat your password"}].map((f,i)=>(
              <div key={f.name} style={{ marginBottom:i===3?20:13 }}>
                <label style={{ display:"block",fontSize:11,fontWeight:500,color:"var(--ink-4)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:6 }}>{f.label}</label>
                <input type={f.type} name={f.name} className="glow-input" placeholder={f.ph} value={form[f.name]} onChange={handleChange}/>
              </div>
            ))}
            {error&&<div style={{ padding:"9px 12px",borderRadius:7,marginBottom:16,background:"var(--coral-dim)",border:"0.5px solid var(--coral-border)",color:"var(--coral)",fontSize:13 }}>{error}</div>}
            <button type="submit" className="btn-glow" disabled={loading} style={{ width:"100%",padding:11,fontSize:14 }}>{loading?"Creating account…":"Create Account →"}</button>
          </form>
        </div>
        <p className="fade-up" style={{ textAlign:"center",marginTop:16,color:"var(--ink-3)",fontSize:13 }}>
          Already have an account?{" "}<Link to="/login" style={{ color:"var(--amber)",fontWeight:500,textDecoration:"none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}