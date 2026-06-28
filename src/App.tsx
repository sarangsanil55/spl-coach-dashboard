import { useState, useEffect } from "react";

const DEPLOYMENT_URL = "https://script.google.com/macros/s/AKfycbyKH2bSwGNk1FpopoeR2apF90S8uXj97fuAWcbBMEQOPAxVxrqpDZG3L-8td3aBXhcHNg/exec";

const SPL_TEAL = "#1D9E75";
const SPL_TEAL_LIGHT = "#E1F5EE";
const SPL_AMBER = "#BA7517";
const SPL_AMBER_LIGHT = "#FAEEDA";
const SPL_CORAL = "#D85A30";
const SPL_CORAL_LIGHT = "#FAECE7";
const SPL_BLUE = "#378ADD";
const SPL_BLUE_LIGHT = "#E6F1FB";

const TAG_CONFIG = {
  "excellent":       { label: "Excellent",      bg: SPL_TEAL_LIGHT,  color: SPL_TEAL },
  "on-track":        { label: "On track",        bg: SPL_BLUE_LIGHT,  color: SPL_BLUE },
  "needs-attention": { label: "Needs attention", bg: SPL_AMBER_LIGHT, color: SPL_AMBER },
  "at-risk":         { label: "At risk",         bg: SPL_CORAL_LIGHT, color: SPL_CORAL },
};

// Map raw sheet row to the shape the dashboard expects
function mapSheetClient(raw) {
  const state      = parseFloat(raw.LATEST_STATE_SCORE)      || 0;
  const compliance = parseFloat(raw.LATEST_COMPLIANCE_SCORE) || 0;
  const burnout    = raw.BURNOUT_INDICATOR || "";
  const plateau    = raw.PLATEAU_FLAG      || "";

  let tag = "on-track";
  if (burnout.includes("HIGH") || plateau) tag = "at-risk";
  else if (burnout.includes("WARNING"))    tag = "needs-attention";
  else if (state >= 8 && compliance >= 8)  tag = "excellent";

  const flag = burnout ? burnout + (plateau ? " | " + plateau : "") :
               plateau ? plateau : null;

  return {
    id:              raw.CLIENT_ID      || "",
    name:            raw.FULL_NAME      || "",
    age:             raw.AGE            || "",
    goal:            raw.PRIMARY_GOAL   || "",
    weeks:           Number(raw.TOTAL_WEEKS) || 0,
    stateScore:      state,
    complianceScore: compliance,
    stress:    0, sleep: 0, energy: 0, fatigue: 0,
    nutrition: 0, training: 0, steps: 0,
    weight:      Array.isArray(raw.WEIGHT_HISTORY) ? raw.WEIGHT_HISTORY : [],
    waist:       [],
    tag,
    flag,
    lastCheckin: raw.LAST_CHECKIN || raw.LATEST_CHECKIN_DATE || "",
    notes:       raw.LATEST_CLIENT_NOTES || "",
  };
}

function ScoreBadge({ value }) {
  const color = value >= 7.5 ? SPL_TEAL : value >= 6 ? SPL_AMBER : SPL_CORAL;
  const bg    = value >= 7.5 ? SPL_TEAL_LIGHT : value >= 6 ? SPL_AMBER_LIGHT : SPL_CORAL_LIGHT;
  return (
    <span style={{ background: bg, color, fontSize: 12, fontWeight: 500, padding: "2px 8px", borderRadius: 12 }}>
      {value.toFixed(1)}
    </span>
  );
}

function TagBadge({ tag }) {
  const cfg = TAG_CONFIG[tag] || TAG_CONFIG["on-track"];
  return (
    <span style={{ background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 12 }}>
      {cfg.label}
    </span>
  );
}

function MiniSparkLine({ data, color }) {
  if (!data || data.length < 2) return <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>—</span>;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 0.5;
  const w = 60, h = 24;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`);
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function ClientDetail({ client, onClose }) {
  const weightDelta = client.weight.length > 1
    ? client.weight[client.weight.length - 1] - client.weight[0] : 0;
  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "20px", marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 16, fontWeight: 500, margin: "0 0 2px" }}>{client.name}</p>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0 }}>{client.id} · {client.goal} · Week {client.weeks}</p>
        </div>
        <button onClick={onClose} style={{ fontSize: 13, padding: "4px 10px" }}>✕ Close</button>
      </div>

      {client.flag && (
        <div style={{ background: SPL_CORAL_LIGHT, color: SPL_CORAL, border: `0.5px solid ${SPL_CORAL}`, borderRadius: "var(--border-radius-md)", padding: "8px 12px", fontSize: 13, marginBottom: 14, fontWeight: 500 }}>
          ⚑ {client.flag}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { l: "State score",  v: <ScoreBadge value={client.stateScore} /> },
          { l: "Compliance",   v: <ScoreBadge value={client.complianceScore} /> },
          { l: "Weight Δ",     v: <span style={{ fontSize: 13, fontWeight: 500, color: weightDelta < 0 ? SPL_TEAL : weightDelta > 0 ? SPL_CORAL : "var(--color-text-secondary)" }}>{weightDelta > 0 ? "+" : ""}{weightDelta.toFixed(1)} kg</span> },
        ].map(item => (
          <div key={item.l} style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "10px 12px" }}>
            <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>{item.l}</p>
            {item.v}
          </div>
        ))}
      </div>

      {client.notes && (
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", padding: "10px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", lineHeight: 1.5, borderLeft: `3px solid ${SPL_TEAL}` }}>
          <strong style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>Coach note:</strong> {client.notes}
        </div>
      )}
    </div>
  );
}

export default function SPLCoachDashboard() {
  const [clients, setClients]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [filter, setFilter]             = useState("all");
  const [sortBy, setSortBy]             = useState("state");

  useEffect(() => {
    fetch(`${DEPLOYMENT_URL}?action=getAllClients`)
      .then(r => r.json())
      .then(data => {
        const mapped = (Array.isArray(data) ? data : []).map(mapSheetClient);
        setClients(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, fontFamily: "var(--font-sans)", color: "var(--color-text-secondary)", fontSize: 14 }}>
      Loading clients...
    </div>
  );

  const flags    = clients.filter(c => c.flag);
  const filtered = clients
    .filter(c => filter === "all" || c.tag === filter)
    .sort((a, b) => sortBy === "state" ? b.stateScore - a.stateScore
                  : sortBy === "compliance" ? b.complianceScore - a.complianceScore
                  : b.weeks - a.weeks);

  const avgState      = clients.length ? (clients.reduce((s, c) => s + c.stateScore, 0) / clients.length).toFixed(1) : "0.0";
  const avgCompliance = clients.length ? (clients.reduce((s, c) => s + c.complianceScore, 0) / clients.length).toFixed(1) : "0.0";

  return (
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: 680, margin: "0 auto", padding: "1.5rem 0" }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 18, fontWeight: 500, margin: "0 0 2px" }}>Coach dashboard</p>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
          Sathyan Performance Lab · Internal view · {clients.length} active clients
        </p>
      </div>

      {/* Summary metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { l: "Active clients",  v: clients.length, unit: "" },
          { l: "Avg state score", v: avgState,        unit: "/10" },
          { l: "Avg compliance",  v: avgCompliance,   unit: "/10" },
          { l: "Flags",           v: flags.length,    unit: "" },
        ].map(item => (
          <div key={item.l} style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px" }}>
            <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: "0 0 4px" }}>{item.l}</p>
            <p style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>
              {item.v}<span style={{ fontSize: 12, fontWeight: 400, color: "var(--color-text-secondary)" }}>{item.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Flags panel */}
      {flags.length > 0 && (
        <div style={{ background: SPL_CORAL_LIGHT, border: `0.5px solid ${SPL_CORAL}`, borderRadius: "var(--border-radius-md)", padding: "12px 14px", marginBottom: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: SPL_CORAL, margin: "0 0 8px" }}>⚑ Requires attention</p>
          {flags.map(c => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "4px 0" }}>
              <span style={{ color: SPL_CORAL, fontWeight: 500 }}>{c.name}</span>
              <span style={{ color: "#993C1D", fontSize: 12 }}>{c.flag}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "excellent", "on-track", "needs-attention", "at-risk"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontSize: 12, padding: "5px 12px", fontWeight: filter === f ? 500 : 400,
            background: filter === f ? "var(--color-background-secondary)" : "none",
            borderColor: filter === f ? "var(--color-border-primary)" : "var(--color-border-tertiary)",
            textTransform: "capitalize", cursor: "pointer",
          }}>
            {f === "all" ? "All clients" : TAG_CONFIG[f]?.label}
          </button>
        ))}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ marginLeft: "auto", fontSize: 12 }}>
          <option value="state">Sort: state score</option>
          <option value="compliance">Sort: compliance</option>
          <option value="weeks">Sort: weeks</option>
        </select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-text-secondary)", fontSize: 14 }}>
          {clients.length === 0
            ? "No clients yet. Once a client submits the intake form, they will appear here."
            : "No clients match this filter."}
        </div>
      )}

      {/* Client list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 60px 60px 80px", gap: 8, padding: "6px 14px", fontSize: 11, color: "var(--color-text-secondary)", fontWeight: 500 }}>
            <span>Client</span><span>State</span><span>Compliance</span>
            <span>Status</span><span>Wt trend</span><span>Wk</span><span>Last check-in</span>
          </div>
        )}

        {filtered.map(client => {
          const isOpen   = selectedClient === client.id;
          const wtDelta  = client.weight.length > 1
            ? client.weight[client.weight.length - 1] - client.weight[0] : 0;
          return (
            <div key={client.id}>
              <div
                onClick={() => setSelectedClient(isOpen ? null : client.id)}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 60px 60px 80px", gap: 8,
                  padding: "10px 14px", alignItems: "center", cursor: "pointer",
                  borderTop: "0.5px solid var(--color-border-tertiary)",
                  background: isOpen ? "var(--color-background-secondary)" : "transparent",
                }}
              >
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 1px" }}>{client.name}</p>
                  <p style={{ fontSize: 11, color: "var(--color-text-secondary)", margin: 0 }}>{client.id} · {client.goal || "—"}</p>
                </div>
                <ScoreBadge value={client.stateScore} />
                <ScoreBadge value={client.complianceScore} />
                <TagBadge tag={client.tag} />
                <MiniSparkLine data={client.weight} color={wtDelta <= 0 ? SPL_TEAL : SPL_CORAL} />
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{client.weeks}</span>
                <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
                  {client.lastCheckin ? String(client.lastCheckin).slice(5) : "—"}
                </span>
              </div>
              {isOpen && <ClientDetail client={client} onClose={() => setSelectedClient(null)} />}
            </div>
          );
        })}
      </div>

      {/* Score distribution */}
      {clients.length > 0 && (
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "16px 18px", marginTop: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 14px" }}>Client score distribution</p>
          {[...clients].sort((a, b) => b.stateScore - a.stateScore).map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)", width: 100, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.name.split(" ")[0]}
              </span>
              <div style={{ flex: 1, display: "flex", gap: 3 }}>
                <div style={{ flex: c.stateScore || 0.1, height: 12, background: SPL_TEAL, borderRadius: "2px 0 0 2px", opacity: 0.8 }} />
                <div style={{ flex: 10 - (c.stateScore || 0), height: 12, background: "var(--color-background-secondary)", borderRadius: "0 2px 2px 0" }} />
              </div>
              <span style={{ fontSize: 11, color: SPL_TEAL, width: 28 }}>{c.stateScore.toFixed(1)}</span>
              <div style={{ flex: 1, display: "flex", gap: 3 }}>
                <div style={{ flex: c.complianceScore || 0.1, height: 12, background: SPL_BLUE, borderRadius: "2px 0 0 2px", opacity: 0.8 }} />
                <div style={{ flex: 10 - (c.complianceScore || 0), height: 12, background: "var(--color-background-secondary)", borderRadius: "0 2px 2px 0" }} />
              </div>
              <span style={{ fontSize: 11, color: SPL_BLUE, width: 28 }}>{c.complianceScore.toFixed(1)}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11, color: "var(--color-text-secondary)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: SPL_TEAL, display: "inline-block" }} />State score
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: SPL_BLUE, display: "inline-block" }} />Compliance score
            </span>
          </div>
        </div>
      )}

      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", textAlign: "center", marginTop: 24 }}>
        SPL Internal · Confidential · Not for external distribution
      </p>
    </div>
  );
}
