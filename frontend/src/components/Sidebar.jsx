import { useState, useEffect } from "react";

const fmtDist = (km) =>
  km >= 1_000_000
    ? `${(km / 1_000_000).toFixed(2)}M km`
    : `${Math.round(km).toLocaleString()} km`;

const fmtSpeed = (kph) =>
  kph >= 1_000 ? `${(kph / 1_000).toFixed(1)}K km/h` : `${Math.round(kph).toLocaleString()} km/h`;

function StatItem({ label, value, colorClass }) {
  return (
    <div className="sidebar-stat">
      <p className="sidebar-stat-label">{label}</p>
      <p className={`sidebar-stat-value ${colorClass}`}>{value}</p>
    </div>
  );
}

function MiniBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="threat-dist-row">
      <span className="threat-dist-label">{label}</span>
      <div className="threat-dist-track">
        <div className="threat-dist-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="threat-dist-count">{count}</span>
    </div>
  );
}

export default function Sidebar({ insights, stats }) {
  const [alertIndex, setAlertIndex] = useState(0);
  const hasHazardous = insights ? insights.hazardousCount > 0 : false;

  useEffect(() => { setAlertIndex(0); }, [insights]);

  useEffect(() => {
    if (!hasHazardous) return;
    const id = setInterval(() => setAlertIndex((i) => (i + 1) % 4), 3000);
    return () => clearInterval(id);
  }, [hasHazardous]);

  if (!insights || !stats) {
    return (
      <div style={{ padding: "1.25rem", color: "var(--text)", opacity: 0.4, fontSize: "0.8rem" }}>
        Loading...
      </div>
    );
  }

  const {
    closest, largest, fastest, slowest, mostDangerous,
    hazardousCount, hazardPercentage, avgSpeed,
    closeCount, mediumCount, farCount,
  } = insights;

  // ── Composite Risk Score (0–100) ──────────────────────────────────────────
  const total = stats.total;
  const hazardScore = Math.min((hazardPercentage / 100) * 50, 50);
  const proximityScore = !closest ? 0
    : closest.distance_km < 500_000   ? 30
    : closest.distance_km < 1_000_000 ? 25
    : closest.distance_km < 5_000_000 ? 18
    : closest.distance_km < 20_000_000 ? 10
    : closest.distance_km < 50_000_000 ? 5
    : 2;
  const densityScore = total ? (closeCount / total) * 20 : 0;
  const riskScore = Math.min(100, Math.round(hazardScore + proximityScore + densityScore));

  const [scoreColor, scoreLabel] =
    riskScore >= 81 ? ["#ef4444", "CRITICAL"]
    : riskScore >= 61 ? ["#ef4444", "HIGH"]
    : riskScore >= 41 ? ["#f97316", "ELEVATED"]
    : riskScore >= 21 ? ["#f59e0b", "MODERATE"]
    : ["#22c55e", "LOW"];

  // ── Velocity spread ───────────────────────────────────────────────────────
  const velRange = fastest && slowest ? fastest.speed_kph - slowest.speed_kph : 0;
  const avgPct = velRange > 0
    ? Math.round(((avgSpeed - slowest.speed_kph) / velRange) * 100)
    : 50;

  const dangerDist = mostDangerous
    ? fmtDist(mostDangerous.distance_km)
    : closest ? fmtDist(closest.distance_km) : "—";

  const alertMessages = [
    { title: `⚠ ${hazardousCount} hazardous ${hazardousCount === 1 ? "asteroid" : "asteroids"} detected`, sub: `Closest hazardous approach: ${dangerDist}` },
    { title: "◉ Close approach alert", sub: `Hazardous object within ${dangerDist} — monitor closely` },
    { title: `⚡ ${hazardousCount} ${hazardousCount === 1 ? "object" : "objects"} under surveillance`, sub: "Tracking active · updated live" },
    { title: "⚠ Risk level elevated", sub: `${hazardPercentage.toFixed(1)}% of tracked objects classified hazardous` },
  ];

  const threatLabel =
    hazardPercentage > 30 ? "HIGH"
    : hazardPercentage > 10 ? "ELEVATED"
    : hazardPercentage > 0  ? "MODERATE"
    : "LOW";

  const threatColor =
    hazardPercentage > 30 ? "#ef4444"
    : hazardPercentage > 10 ? "#f97316"
    : hazardPercentage > 0  ? "#f59e0b"
    : "#22c55e";

  return (
    <>
      {/* Live indicator */}
      <div className="sidebar-header">
        <span className="sidebar-live-dot" />
        <span className="sidebar-section-label">Mission Control</span>
      </div>

      {/* Spatial stats */}
      <div className="sidebar-section">
        <StatItem label="Closest Approach" value={closest ? fmtDist(closest.distance_km) : "—"} colorClass="sidebar-stat-value--yellow" />
        <StatItem label="Largest Object"   value={largest ? `${largest.diameter.toFixed(1)} m` : "—"} colorClass="sidebar-stat-value--dim" />
      </div>

      {/* Alerts */}
      <div className="sidebar-section">
        <p className="sidebar-section-label" style={{ marginBottom: "0.75rem" }}>Alerts</p>
        {hasHazardous ? (
          <div className="sidebar-alert sidebar-alert--hazard">
            <p className="sidebar-alert-title">{alertMessages[alertIndex].title}</p>
            <p className="sidebar-alert-sub">{alertMessages[alertIndex].sub}</p>
          </div>
        ) : (
          <div className="sidebar-alert sidebar-alert--safe">
            <p className="sidebar-alert-title">✓ All systems nominal</p>
            <p className="sidebar-alert-sub">No hazardous objects in current observation window</p>
          </div>
        )}
      </div>

      {/* Threat Overview — replaces text insights */}
      <div className="sidebar-section">
        <p className="sidebar-section-label" style={{ marginBottom: "0.75rem" }}>Threat Overview</p>

        {/* Threat level badge */}
        <div className="threat-level-row">
          <span className="threat-level-dot" style={{ background: threatColor }} />
          <span className="threat-level-label" style={{ color: threatColor }}>{threatLabel}</span>
          <span className="threat-level-pct">{hazardPercentage.toFixed(1)}% hazardous</span>
        </div>

        {/* Distance distribution mini-bars */}
        <div className="threat-dist">
          <MiniBar label="Close"  count={closeCount}  total={total} color="#22c55e" />
          <MiniBar label="Med"    count={mediumCount}  total={total} color="#f59e0b" />
          <MiniBar label="Far"    count={farCount}     total={total} color="#64748b" />
        </div>

        {/* Fastest object */}
        {fastest && (
          <div className="threat-fastest">
            <span className="threat-fastest-icon">⚡</span>
            <div>
              <p className="threat-fastest-label">Fastest object</p>
              <p className="threat-fastest-value">{fmtSpeed(fastest.speed_kph)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Composite Risk Index */}
      <div className="sidebar-section">
        <p className="sidebar-section-label" style={{ marginBottom: "0.75rem" }}>Risk Index</p>
        <div className="risk-index-card">
          <div
            className="risk-gauge"
            style={{
              background: `conic-gradient(${scoreColor} 0% ${riskScore}%, rgba(255,255,255,0.06) ${riskScore}% 100%)`,
            }}
          >
            <div className="risk-gauge-inner">
              <span className="risk-gauge-score">{riskScore}</span>
              <span className="risk-gauge-denom">/100</span>
            </div>
          </div>
          <div className="risk-index-info">
            <p className="risk-index-level" style={{ color: scoreColor }}>{scoreLabel}</p>
            <p className="risk-index-detail">{hazardousCount} hazardous</p>
            <p className="risk-index-detail">{closeCount} within 10M km</p>
          </div>
        </div>
      </div>

      {/* Velocity Spread */}
      {fastest && slowest && (
        <div className="sidebar-section" style={{ flex: 1 }}>
          <p className="sidebar-section-label" style={{ marginBottom: "0.75rem" }}>Velocity Spread</p>
          <div className="vel-spread">
            <div className="vel-track">
              <div className="vel-fill" style={{ width: `${avgPct}%` }} />
              <div className="vel-marker" style={{ left: `${avgPct}%` }} />
            </div>
            <div className="vel-labels">
              <span>{fmtSpeed(slowest.speed_kph)}</span>
              <span className="vel-avg-tag">avg {fmtSpeed(avgSpeed)}</span>
              <span>{fmtSpeed(fastest.speed_kph)}</span>
            </div>
            <p className="vel-caption">Slowest · Average · Fastest</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="sidebar-footer">
        <p className="sidebar-footer-text">NASA NeoWs · Live data</p>
      </div>
    </>
  );
}
