import { useEffect, useCallback, useState } from "react";
import { getApod } from "../services/api";
import APODControls    from "../components/APODControls";
import APODViewer      from "../components/APODViewer";
import APODMeta        from "../components/APODMeta";
import APODDescription from "../components/APODDescription";

const todayStr = () => new Date().toISOString().split("T")[0];

// ── Skeleton ───────────────────────────────────────────────────────────────
function APODSkeleton() {
  return (
    <div className="apod-skeleton">
      <div className="apod-skeleton-media skel" />
      <div className="apod-skeleton-body">
        <div className="skel skel--title" />
        <div className="apod-skeleton-chips">
          <div className="skel skel--chip" />
          <div className="skel skel--chip" />
          <div className="skel skel--chip" />
        </div>
        <div className="skel skel--line" />
        <div className="skel skel--line" />
        <div className="skel skel--line skel--short" />
      </div>
    </div>
  );
}

// ── Error state ────────────────────────────────────────────────────────────
function APODError({ message, onRetry }) {
  return (
    <div className="apod-error">
      <div className="apod-error-icon">⚠</div>
      <p className="apod-error-msg">{message}</p>
      <button className="apod-ctrl-btn apod-ctrl-btn--accent" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [date,      setDate]      = useState(todayStr);
  const [apod,      setApod]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [visible,   setVisible]   = useState(false);
  const fetchData = useCallback(async (d) => {
    setLoading(true);
    setVisible(false);
    setError(null);
    setApod(null);
    let lastErr;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const data = await getApod(d);
        setApod(data);
        setLoading(false);
        return;
      } catch (err) {
        lastErr = err;
        if (attempt < 1) await new Promise((r) => setTimeout(r, 1000));
      }
    }
    setError(lastErr.message);
    setLoading(false);
  }, []);

  // Fetch on mount + every date change
  useEffect(() => { fetchData(date); }, [date, fetchData]);

  // Fade in after data lands (double rAF ensures the browser has painted opacity:0 first)
  useEffect(() => {
    if (!apod) return;
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setVisible(true))
    );
    return () => cancelAnimationFrame(id);
  }, [apod]);

  return (
    <div className="apod-page">
      <div className="apod-page-inner">

        {/* Page header */}
        <div className="apod-page-header">
          <h2 className="apod-page-title">Astronomy Picture of the Day</h2>
          <p className="apod-page-sub">NASA&apos;s daily window into the cosmos</p>
        </div>

        {/* Date navigation */}
        <APODControls date={date} onChange={setDate} loading={loading} />

        {/* States */}
        {loading && <APODSkeleton />}
        {error && !loading && <APODError message={error} onRetry={() => fetchData(date)} />}

        {/* Content */}
        {apod && !loading && !error && (
          <div className={`apod-card ${visible ? "apod-card--visible" : ""}`}>

            <APODViewer apod={apod} />

            <div className="apod-card-body">
              <APODMeta apod={apod} />

              <APODDescription text={apod.explanation} />
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
