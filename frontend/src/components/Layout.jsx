import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Background depth orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div className="orb1" style={{
          position: "absolute", top: "8%", left: "3%",
          width: "480px", height: "480px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 65%)",
        }} />
        <div className="orb2" style={{
          position: "absolute", bottom: "8%", right: "5%",
          width: "560px", height: "560px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(45,212,191,0.035) 0%, transparent 65%)",
        }} />
      </div>

      <Navbar />

      <div className="page-container" style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "40px 24px 60px",
        position: "relative",
        zIndex: 1,
      }}>
        {children}
      </div>
    </div>
  );
}

export default Layout;
