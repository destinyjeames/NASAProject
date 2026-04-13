const fmt = (n) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(1)}K`
    : n.toLocaleString();

const distCategory = (km) =>
  km < 10_000_000 ? "close" : km < 50_000_000 ? "medium" : "far";

export default function AsteroidCard({ asteroid, isHighlighted, insights, onClick }) {
  const { name, hazardous, diameter, distance_km, speed_kph } = asteroid;

  const isClosest = insights?.closest?.name === name;
  const isFastest = insights?.fastest?.name === name;
  const isLargest = insights?.largest?.name === name;
  const distCat   = distCategory(distance_km);

  return (
    <div
      className={`ali ali--clickable ${hazardous ? "ali--hazard" : "ali--safe"} ${isHighlighted ? "ali--highlighted" : ""}`}
      onClick={onClick}
    >
      {/* Status dot */}
      <span className={`ali-dot ${hazardous ? "ali-dot--hazard" : "ali-dot--safe"}`} />

      {/* Name */}
      <span className="ali-name" title={name}>{name}</span>

      {/* Special tags */}
      <div className="ali-tags">
        {isClosest && <span className="ali-tag ali-tag--yellow">● Closest</span>}
        {isFastest && <span className="ali-tag ali-tag--blue">⚡ Fastest</span>}
        {isLargest && <span className="ali-tag ali-tag--purple">◉ Largest</span>}
      </div>

      {/* Status badge */}
      <span className={`ali-status ${hazardous ? "ali-status--hazard" : "ali-status--safe"}`}>
        {hazardous ? "⚠ Hazardous" : "✓ Safe"}
      </span>

      {/* Stats */}
      <div className="ali-stats">
        <span className="ali-stat">
          <span className={`ali-stat-val ali-dist--${distCat}`}>{fmt(distance_km)} km</span>
        </span>
        <span className="ali-stat">
          <span className="ali-stat-val">{fmt(speed_kph)} km/h</span>
        </span>
        <span className="ali-stat">
          <span className="ali-stat-val">{diameter.toFixed(1)} m</span>
        </span>
      </div>
    </div>
  );
}
