import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function Topics() {
  const { unitId }   = useParams();
  const navigate     = useNavigate();
  const [topics, setTopics]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => { fetchTopics(); }, [unitId]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/topics/${unitId}`);
      setTopics(res.data);
    } catch {
      setError("Failed to load topics.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--ink-3)", fontSize: 13, display: "flex",
            alignItems: "center", gap: 6, padding: 0, marginBottom: 16,
          }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: "var(--ink)", margin: 0 }}>Topics</h1>
        <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
          Topics in this unit
        </p>
      </div>

      {loading && (
        <div style={{ padding: 40, textAlign: "center" }}>
          <div className="loader" />
        </div>
      )}

      {error && (
        <div style={{
          padding: "12px 16px", borderRadius: "var(--radius)", background: "var(--coral-dim)",
          color: "var(--coral)", fontSize: 13,
        }}>{error}</div>
      )}

      {!loading && !error && topics.length === 0 && (
        <div style={{
          padding: "40px 24px", textAlign: "center", color: "var(--ink-3)",
          background: "var(--bg-2)", borderRadius: "var(--radius)", border: "0.5px solid var(--border)",
        }}>
          No topics found for this unit.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {topics.map((topic) => (
          <div
            key={topic.id}
            style={{
              background: "var(--bg-card)", border: "0.5px solid var(--border)",
              borderRadius: "var(--radius)", padding: "16px 20px",
              display: "flex", alignItems: "center", gap: 12,
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: "var(--teal-dim)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, flexShrink: 0,
            }}>🏷️</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{topic.name}</div>
              {topic.unit_name && (
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{topic.unit_name}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Topics;
