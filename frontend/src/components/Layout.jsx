import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Floating background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div className="orb1" style={{
          position: "absolute", top: "10%", left: "5%",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }} />
        <div className="orb2" style={{
          position: "absolute", bottom: "5%", right: "8%",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 70%)",
        }} />
      </div>

      <Navbar />

      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "40px 24px",
        position: "relative",
        zIndex: 1,
      }}>
        {children}
      </div>
    </div>
  );
}

export default Layout;
