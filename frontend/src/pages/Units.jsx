import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function Units() {
  const { subjectId }  = useParams();
  const navigate       = useNavigate();
  const [units, setUnits]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => { fetchUnits(); }, [subjectId]);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/units/${subjectId}`);
      setUnits(res.data);
    } catch {
      setError("Failed to load units.");
    } finally {
      setLoading(false);
    }
  };

  // Bug-fix #10: was navigating to /units/:unitId (no such route).
  // Correct destination is /topics/:unitId.
  const handleUnitClick = (unitId) => navigate(`/topics/${unitId}`);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={() => navigate("/subjects")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--ink-3)", fontSize: 13, display: "flex",
            alignItems: "center", gap: 6, padding: 0, marginBottom: 16,
          }}
        >
          ← Back to Subjects
        </button>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: "var(--ink)", margin: 0 }}>Units</h1>
        <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
          Select a unit to view its topics
        </p>
      </div>

      {loading && (
        <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)" }}>
          <div className="loader" />
        </div>
      )}

      {error && (
        <div style={{
          padding: "12px 16px", borderRadius: "var(--radius)", background: "var(--coral-dim)",
          color: "var(--coral)", fontSize: 13,
        }}>{error}</div>
      )}

      {!loading && !error && units.length === 0 && (
        <div style={{
          padding: "40px 24px", textAlign: "center", color: "var(--ink-3)",
          background: "var(--bg-2)", borderRadius: "var(--radius)", border: "0.5px solid var(--border)",
        }}>
          No units found for this subject.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {units.map((unit) => (
          <div
            key={unit.id}
            onClick={() => handleUnitClick(unit.id)}
            style={{
              background: "var(--bg-card)", border: "0.5px solid var(--border)",
              borderRadius: "var(--radius)", padding: "20px 22px",
              cursor: "pointer", transition: "border-color .15s, box-shadow .15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--amber)";
              e.currentTarget.style.boxShadow   = "0 2px 12px rgba(0,0,0,.08)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow   = "none";
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 9, background: "var(--amber-dim)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, marginBottom: 12,
            }}>📚</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>{unit.name}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>View topics →</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Units;
