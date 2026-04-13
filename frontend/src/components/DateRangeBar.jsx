import { useState } from "react";

const PRESETS = [
  { label: "Today",  value: "1" },
  { label: "3 days", value: "3" },
  { label: "7 days", value: "7" },
];

export default function DateRangeBar({
  dateRange, onDateRange,
  onCustomRange,
  onClearAll,
  refetching,
  hasActiveFilters,
}) {
  const [localStart, setLocalStart] = useState("");
  const [localEnd,   setLocalEnd]   = useState("");
  const [useCustom,  setUseCustom]  = useState(false);
  const [dateError,  setDateError]  = useState("");

  const handlePreset = (val) => {
    setUseCustom(false);
    setDateError("");
    onDateRange(val);
  };

  const handleApplyCustom = () => {
    if (!localStart || !localEnd) return;
    const diffDays = (new Date(localEnd) - new Date(localStart)) / (1000 * 60 * 60 * 24);
    if (diffDays < 0) {
      setDateError("End date must be after start date.");
      return;
    }
    if (diffDays > 7) {
      setDateError("NASA API limit: max 7-day window.");
      return;
    }
    setDateError("");
    setUseCustom(true);
    onCustomRange(localStart, localEnd);
  };

  const handleClear = () => {
    setUseCustom(false);
    setLocalStart("");
    setLocalEnd("");
    setDateError("");
    onClearAll();
  };

  const showClear = hasActiveFilters || useCustom;

  return (
    <div className="filter-bar">
      <div className="filter-row" style={{ flexWrap: "wrap" }}>

        <div className="filter-group">
          <span className="filter-label">Range</span>
          <div className="btn-group">
            {PRESETS.map((opt) => (
              <button
                key={opt.value}
                className={`filter-btn${!useCustom && dateRange === opt.value ? " filter-btn--accent" : ""}`}
                onClick={() => handlePreset(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-divider" />

        <div className="filter-group" style={{ gap: "0.4rem" }}>
          <span className="filter-label">Custom</span>
          <input
            type="date"
            className="filter-date-input"
            value={localStart}
            onChange={(e) => setLocalStart(e.target.value)}
          />
          <span style={{ color: "var(--text)", opacity: 0.4, fontSize: "0.75rem" }}>—</span>
          <input
            type="date"
            className="filter-date-input"
            value={localEnd}
            onChange={(e) => setLocalEnd(e.target.value)}
          />
          <button
            className={`filter-btn${useCustom ? " filter-btn--accent" : ""}`}
            onClick={handleApplyCustom}
            disabled={!localStart || !localEnd}
          >
            Apply
          </button>
          {dateError && (
            <p style={{ color: "#f97316", fontSize: "0.72rem", margin: 0, whiteSpace: "nowrap" }}>
              {dateError}
            </p>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {refetching && <span className="filter-refreshing">↻ Refreshing…</span>}
          {showClear && (
            <button className="filter-btn filter-btn--clear" onClick={handleClear}>
              ✕ Clear
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
