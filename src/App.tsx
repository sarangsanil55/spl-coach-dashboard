import { useState } from 'react';
const DEPLOYMENT_URL =
  'https://script.google.com/macros/s/AKfycbz_U6a1deVdAQ3N4yQ-BVVcWMlvQK6ELbsR6v0n4uKZ7hslizg8weGZvjZrJs6X5lg_dQ/exec';
const SPL_TEAL = '#1D9E75';
const SPL_TEAL_LIGHT = '#E1F5EE';
const SPL_AMBER = '#BA7517';
const SPL_AMBER_LIGHT = '#FAEEDA';
const SPL_CORAL = '#D85A30';
const SPL_CORAL_LIGHT = '#FAECE7';
const SPL_BLUE = '#378ADD';
const SPL_BLUE_LIGHT = '#E6F1FB';

const CLIENTS = [
  {
    id: 'SPL-001',
    name: 'Arjun Mehta',
    age: 34,
    goal: 'Recomposition',
    weeks: 6,
    stateScore: 7.2,
    complianceScore: 8.5,
    stress: 6,
    sleep: 7,
    energy: 8,
    fatigue: 5,
    nutrition: 9,
    training: 8,
    steps: 8,
    weight: [84.2, 83.8, 83.5, 83.1, 82.9, 82.4],
    waist: [91, 90.5, 90, 89.5, 89, 88.2],
    tag: 'on-track',
    lastCheckin: '2025-04-12',
    notes:
      'Trending well. Stress elevated mid-week due to work. Monitor energy next week.',
    flag: null,
  },
  {
    id: 'SPL-002',
    name: 'Priya Sharma',
    age: 29,
    goal: 'Fat loss',
    weeks: 4,
    stateScore: 5.8,
    complianceScore: 6.1,
    stress: 8,
    sleep: 5,
    energy: 5,
    fatigue: 8,
    nutrition: 6,
    training: 6,
    steps: 6,
    weight: [67.1, 67.0, 66.9, 67.0],
    waist: [78, 78, 77.5, 77.5],
    tag: 'needs-attention',
    lastCheckin: '2025-04-11',
    notes:
      'Plateau in weight. High stress, poor sleep. Consider reducing training load.',
    flag: 'High stress + poor sleep — review programming',
  },
  {
    id: 'SPL-003',
    name: 'Rahul Nair',
    age: 42,
    goal: 'Muscle gain',
    weeks: 10,
    stateScore: 8.1,
    complianceScore: 9.0,
    stress: 3,
    sleep: 8,
    energy: 9,
    fatigue: 3,
    nutrition: 9,
    training: 9,
    steps: 9,
    weight: [76.0, 76.4, 76.9, 77.2, 77.5, 77.8, 78.1, 78.3, 78.6, 78.9],
    waist: [84, 84, 84.2, 84.1, 84, 83.9, 83.8, 83.7, 83.6, 83.5],
    tag: 'excellent',
    lastCheckin: '2025-04-12',
    notes:
      'Consistent progression. Strength up across all lifts. Keep current programming.',
    flag: null,
  },
  {
    id: 'SPL-004',
    name: 'Divya Krishnan',
    age: 38,
    goal: 'Health & longevity',
    weeks: 3,
    stateScore: 6.9,
    complianceScore: 7.5,
    stress: 5,
    sleep: 7,
    energy: 7,
    fatigue: 5,
    nutrition: 8,
    training: 7,
    steps: 7,
    weight: [72.5, 72.2, 71.9],
    waist: [82, 81.5, 81],
    tag: 'on-track',
    lastCheckin: '2025-04-10',
    notes:
      'Good start. Building habits. Gut health concerns flagged at intake — check in.',
    flag: null,
  },
  {
    id: 'SPL-005',
    name: 'Vikram Iyer',
    age: 31,
    goal: 'Athletic performance',
    weeks: 8,
    stateScore: 4.8,
    complianceScore: 5.5,
    stress: 9,
    sleep: 4,
    energy: 4,
    fatigue: 9,
    nutrition: 5,
    training: 6,
    steps: 5,
    weight: [82.0, 82.1, 81.9, 81.8, 82.0, 82.1, 82.0, 81.9],
    waist: [86, 86, 85.8, 85.5, 85.6, 85.5, 85.4, 85.3],
    tag: 'at-risk',
    lastCheckin: '2025-04-09',
    notes: 'Signs of burnout. Consider deload week. Address sleep immediately.',
    flag: 'Burnout indicators — schedule check-in call',
  },
];

const TAG_CONFIG = {
  excellent: { label: 'Excellent', bg: SPL_TEAL_LIGHT, color: SPL_TEAL },
  'on-track': { label: 'On track', bg: SPL_BLUE_LIGHT, color: SPL_BLUE },
  'needs-attention': {
    label: 'Needs attention',
    bg: SPL_AMBER_LIGHT,
    color: SPL_AMBER,
  },
  'at-risk': { label: 'At risk', bg: SPL_CORAL_LIGHT, color: SPL_CORAL },
};

function ScoreBadge({ value }) {
  const color = value >= 7.5 ? SPL_TEAL : value >= 6 ? SPL_AMBER : SPL_CORAL;
  const bg =
    value >= 7.5
      ? SPL_TEAL_LIGHT
      : value >= 6
      ? SPL_AMBER_LIGHT
      : SPL_CORAL_LIGHT;
  return (
    <span
      style={{
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 500,
        padding: '2px 8px',
        borderRadius: 12,
      }}
    >
      {value.toFixed(1)}
    </span>
  );
}

function TagBadge({ tag }) {
  const cfg = TAG_CONFIG[tag] || TAG_CONFIG['on-track'];
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        fontSize: 11,
        fontWeight: 500,
        padding: '2px 8px',
        borderRadius: 12,
      }}
    >
      {cfg.label}
    </span>
  );
}

function MiniSparkLine({ data, color }) {
  if (!data || data.length < 2)
    return (
      <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
        —
      </span>
    );
  const min = Math.min(...data),
    max = Math.max(...data);
  const range = max - min || 0.5;
  const w = 60,
    h = 24;
  const pts = data.map(
    (v, i) =>
      `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`
  );
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClientDetail({ client, onClose }) {
  const weightDelta =
    client.weight[client.weight.length - 1] - client.weight[0];
  return (
    <div
      style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '20px',
        marginTop: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}
      >
        <div>
          <p style={{ fontSize: 16, fontWeight: 500, margin: '0 0 2px' }}>
            {client.name}
          </p>
          <p
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            {client.id} · {client.goal} · Week {client.weeks}
          </p>
        </div>
        <button onClick={onClose} style={{ fontSize: 13, padding: '4px 10px' }}>
          ✕ Close
        </button>
      </div>

      {client.flag && (
        <div
          style={{
            background: SPL_CORAL_LIGHT,
            color: SPL_CORAL,
            border: `0.5px solid ${SPL_CORAL}`,
            borderRadius: 'var(--border-radius-md)',
            padding: '8px 12px',
            fontSize: 13,
            marginBottom: 14,
            fontWeight: 500,
          }}
        >
          ⚑ {client.flag}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          marginBottom: 16,
        }}
      >
        {[
          { l: 'State score', v: <ScoreBadge value={client.stateScore} /> },
          { l: 'Compliance', v: <ScoreBadge value={client.complianceScore} /> },
          {
            l: 'Weight Δ',
            v: (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color:
                    weightDelta < 0
                      ? SPL_TEAL
                      : weightDelta > 0
                      ? SPL_CORAL
                      : 'var(--color-text-secondary)',
                }}
              >
                {weightDelta > 0 ? '+' : ''}
                {weightDelta.toFixed(1)} kg
              </span>
            ),
          },
        ].map((item) => (
          <div
            key={item.l}
            style={{
              background: 'var(--color-background-secondary)',
              borderRadius: 'var(--border-radius-md)',
              padding: '10px 12px',
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: 'var(--color-text-secondary)',
                margin: '0 0 4px',
              }}
            >
              {item.l}
            </p>
            {item.v}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px 20px',
          marginBottom: 14,
        }}
      >
        {[
          { l: 'Stress', v: client.stress, inv: true },
          { l: 'Sleep', v: client.sleep },
          { l: 'Energy', v: client.energy },
          { l: 'Fatigue', v: client.fatigue, inv: true },
          { l: 'Nutrition', v: client.nutrition },
          { l: 'Training', v: client.training },
          { l: 'Steps', v: client.steps },
        ].map((item) => {
          const pct = (item.v / 10) * 100;
          const color = item.inv
            ? item.v > 6
              ? SPL_CORAL
              : SPL_TEAL
            : pct >= 70
            ? SPL_TEAL
            : pct >= 50
            ? SPL_AMBER
            : SPL_CORAL;
          return (
            <div
              key={item.l}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--color-text-secondary)',
                  width: 70,
                  flexShrink: 0,
                }}
              >
                {item.l}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 5,
                  background: 'var(--color-background-secondary)',
                  borderRadius: 3,
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: color,
                    borderRadius: 3,
                  }}
                />
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, width: 16 }}>
                {item.v}
              </span>
            </div>
          );
        })}
      </div>

      {client.notes && (
        <div
          style={{
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            padding: '10px 12px',
            background: 'var(--color-background-secondary)',
            borderRadius: 'var(--border-radius-md)',
            lineHeight: 1.5,
            borderLeft: `3px solid ${SPL_TEAL}`,
          }}
        >
          <strong
            style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
          >
            Coach note:
          </strong>{' '}
          {client.notes}
        </div>
      )}
    </div>
  );
}

export default function SPLCoachDashboard() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('state');

  const flags = CLIENTS.filter((c) => c.flag);
  const filtered = CLIENTS.filter(
    (c) => filter === 'all' || c.tag === filter
  ).sort((a, b) =>
    sortBy === 'state'
      ? b.stateScore - a.stateScore
      : sortBy === 'compliance'
      ? b.complianceScore - a.complianceScore
      : b.weeks - a.weeks
  );

  const avgState = (
    CLIENTS.reduce((s, c) => s + c.stateScore, 0) / CLIENTS.length
  ).toFixed(1);
  const avgCompliance = (
    CLIENTS.reduce((s, c) => s + c.complianceScore, 0) / CLIENTS.length
  ).toFixed(1);

  return (
    <div
      style={{
        fontFamily: 'var(--font-sans)',
        maxWidth: 680,
        margin: '0 auto',
        padding: '1.5rem 0',
      }}
    >
      <h2 className="sr-only">SPL Internal Coach Dashboard</h2>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 18, fontWeight: 500, margin: '0 0 2px' }}>
          Coach dashboard
        </p>
        <p
          style={{
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            margin: 0,
          }}
        >
          Sathyan Performance Lab · Internal view · {CLIENTS.length} active
          clients
        </p>
      </div>

      {/* Summary metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          marginBottom: 20,
        }}
      >
        {[
          { l: 'Active clients', v: CLIENTS.length, unit: '' },
          { l: 'Avg state score', v: avgState, unit: '/10' },
          { l: 'Avg compliance', v: avgCompliance, unit: '/10' },
          { l: 'Flags', v: flags.length, unit: '' },
        ].map((item) => (
          <div
            key={item.l}
            style={{
              background: 'var(--color-background-secondary)',
              borderRadius: 'var(--border-radius-md)',
              padding: '12px 14px',
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: 'var(--color-text-secondary)',
                margin: '0 0 4px',
              }}
            >
              {item.l}
            </p>
            <p style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>
              {item.v}
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 400,
                  color: 'var(--color-text-secondary)',
                }}
              >
                {item.unit}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Flags panel */}
      {flags.length > 0 && (
        <div
          style={{
            background: SPL_CORAL_LIGHT,
            border: `0.5px solid ${SPL_CORAL}`,
            borderRadius: 'var(--border-radius-md)',
            padding: '12px 14px',
            marginBottom: 18,
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: SPL_CORAL,
              margin: '0 0 8px',
            }}
          >
            ⚑ Requires attention
          </p>
          {flags.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 13,
                padding: '4px 0',
              }}
            >
              <span style={{ color: SPL_CORAL, fontWeight: 500 }}>
                {c.name}
              </span>
              <span style={{ color: '#993C1D', fontSize: 12 }}>{c.flag}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div
        style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}
      >
        {['all', 'excellent', 'on-track', 'needs-attention', 'at-risk'].map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontSize: 12,
                padding: '5px 12px',
                fontWeight: filter === f ? 500 : 400,
                background:
                  filter === f ? 'var(--color-background-secondary)' : 'none',
                borderColor:
                  filter === f
                    ? 'var(--color-border-primary)'
                    : 'var(--color-border-tertiary)',
                textTransform: 'capitalize',
              }}
            >
              {f === 'all' ? 'All clients' : TAG_CONFIG[f]?.label}
            </button>
          )
        )}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ marginLeft: 'auto', fontSize: 12 }}
        >
          <option value="state">Sort: state score</option>
          <option value="compliance">Sort: compliance</option>
          <option value="weeks">Sort: weeks</option>
        </select>
      </div>

      {/* Client list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 60px 60px 80px',
            gap: 8,
            padding: '6px 14px',
            fontSize: 11,
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
          }}
        >
          <span>Client</span>
          <span>State</span>
          <span>Compliance</span>
          <span>Status</span>
          <span>Wt trend</span>
          <span>Wk</span>
          <span>Last check-in</span>
        </div>

        {filtered.map((client, i) => {
          const isOpen = selectedClient === client.id;
          const wtDelta =
            client.weight[client.weight.length - 1] - client.weight[0];
          return (
            <div key={client.id}>
              <div
                onClick={() => setSelectedClient(isOpen ? null : client.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 60px 60px 80px',
                  gap: 8,
                  padding: '10px 14px',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderTop: '0.5px solid var(--color-border-tertiary)',
                  background: isOpen
                    ? 'var(--color-background-secondary)'
                    : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div>
                  <p
                    style={{ fontSize: 13, fontWeight: 500, margin: '0 0 1px' }}
                  >
                    {client.name}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: 'var(--color-text-secondary)',
                      margin: 0,
                    }}
                  >
                    {client.id} · {client.goal}
                  </p>
                </div>
                <ScoreBadge value={client.stateScore} />
                <ScoreBadge value={client.complianceScore} />
                <TagBadge tag={client.tag} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MiniSparkLine
                    data={client.weight}
                    color={wtDelta < 0 ? SPL_TEAL : SPL_CORAL}
                  />
                </div>
                <span
                  style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}
                >
                  {client.weeks}
                </span>
                <span
                  style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}
                >
                  {client.lastCheckin?.slice(5)}
                </span>
              </div>
              {isOpen && (
                <ClientDetail
                  client={client}
                  onClose={() => setSelectedClient(null)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Score distribution */}
      <div
        style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '16px 18px',
          marginTop: 20,
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 14px' }}>
          Client score distribution
        </p>
        {CLIENTS.sort((a, b) => b.stateScore - a.stateScore).map((c) => (
          <div
            key={c.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: 'var(--color-text-secondary)',
                width: 100,
                flexShrink: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {c.name.split(' ')[0]}
            </span>
            <div style={{ flex: 1, display: 'flex', gap: 3 }}>
              <div
                style={{
                  flex: c.stateScore,
                  height: 12,
                  background: SPL_TEAL,
                  borderRadius: '2px 0 0 2px',
                  opacity: 0.8,
                }}
              />
              <div
                style={{
                  flex: 10 - c.stateScore,
                  height: 12,
                  background: 'var(--color-background-secondary)',
                  borderRadius: '0 2px 2px 0',
                }}
              />
            </div>
            <span style={{ fontSize: 11, color: SPL_TEAL, width: 28 }}>
              {c.stateScore.toFixed(1)}
            </span>
            <div style={{ flex: 1, display: 'flex', gap: 3 }}>
              <div
                style={{
                  flex: c.complianceScore,
                  height: 12,
                  background: SPL_BLUE,
                  borderRadius: '2px 0 0 2px',
                  opacity: 0.8,
                }}
              />
              <div
                style={{
                  flex: 10 - c.complianceScore,
                  height: 12,
                  background: 'var(--color-background-secondary)',
                  borderRadius: '0 2px 2px 0',
                }}
              />
            </div>
            <span style={{ fontSize: 11, color: SPL_BLUE, width: 28 }}>
              {c.complianceScore.toFixed(1)}
            </span>
          </div>
        ))}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 10,
            fontSize: 11,
            color: 'var(--color-text-secondary)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: SPL_TEAL,
                display: 'inline-block',
              }}
            />
            State score
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: SPL_BLUE,
                display: 'inline-block',
              }}
            />
            Compliance score
          </span>
        </div>
      </div>

      <p
        style={{
          fontSize: 11,
          color: 'var(--color-text-tertiary)',
          textAlign: 'center',
          marginTop: 24,
        }}
      >
        SPL Internal · Confidential · Not for external distribution
      </p>
    </div>
  );
}
