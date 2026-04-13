const SORT_OPTIONS = [
  { label: "Distance", value: "distance", color: "var(--accent)" },
  { label: "Speed",    value: "speed",    color: "#a855f7" },
  { label: "Diameter", value: "diameter", color: "#06b6d4" },
];

export default function FilterBar({ filters, onChange, count, total }) {
  const countLabel =
    count === total
      ? `${total} asteroid${total !== 1 ? "s" : ""}`
      : `${count} of ${total}`;

  return (
    <div className="filter-bar">
      <div className="filter-row">

        <div className="filter-group">
          <span className="filter-label">Filter</span>
          <button
            className={`filter-btn${filters.hazardous ? " filter-btn--hazard" : ""}`}
            onClick={() => onChange({ ...filters, hazardous: !filters.hazardous })}
          >
            ⚠ Hazardous only
          </button>
        </div>

        <div className="filter-divider" />

        <div className="filter-group">
          <span className="filter-label">Sort by</span>
          <div className="btn-group">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className="filter-btn"
                style={
                  filters.sort === opt.value
                    ? { borderColor: opt.color, color: opt.color, background: `${opt.color}18` }
                    : {}
                }
                onClick={() => onChange({ ...filters, sort: filters.sort === opt.value ? "" : opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {filters.sort && (
            <button
              className="filter-btn filter-btn--dir"
              title={filters.sortDir === "desc" ? "Descending — click to sort ascending" : "Ascending — click to sort descending"}
              onClick={() => onChange({ ...filters, sortDir: filters.sortDir === "desc" ? "asc" : "desc" })}
            >
              {filters.sortDir === "desc" ? "↓" : "↑"}
            </button>
          )}
        </div>

        <span className="results-count">{countLabel}</span>
      </div>
    </div>
  );
}
