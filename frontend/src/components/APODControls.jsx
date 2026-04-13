const TODAY      = new Date().toISOString().split("T")[0];
const APOD_START = "1995-06-16";

export default function APODControls({ date, onChange, loading }) {
  const isToday = date >= TODAY;
  const isFirst = date <= APOD_START;

  const shift = (days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    const next = d.toISOString().split("T")[0];
    if (next >= APOD_START && next <= TODAY) onChange(next);
  };

  return (
    <div className="apod-controls">
      <button
        className="apod-ctrl-btn"
        onClick={() => shift(-1)}
        disabled={loading || isFirst}
        title="Previous day"
      >
        ← Prev
      </button>

      <input
        type="date"
        className="apod-ctrl-date"
        value={date}
        min={APOD_START}
        max={TODAY}
        onChange={(e) => e.target.value && onChange(e.target.value)}
      />

      <button
        className="apod-ctrl-btn"
        onClick={() => shift(1)}
        disabled={loading || isToday}
        title="Next day"
      >
        Next →
      </button>
    </div>
  );
}
