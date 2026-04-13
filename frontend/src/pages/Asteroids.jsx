import { useState, useEffect, useMemo, useRef } from "react";
import { getAsteroids } from "../services/api";
import AsteroidCard from "../components/AsteroidCard";
import DateRangeBar from "../components/DateRangeBar";
import FilterBar from "../components/FilterBar";
import Chart from "../components/Chart";
import Sidebar from "../components/Sidebar";
import useAsteroidInsights from "../hooks/useAsteroidInsights";

const getDateRange = (days) => {
  const today = new Date();
  const start = today.toISOString().split("T")[0];
  const end = new Date(today);
  end.setDate(today.getDate() + days - 1);
  return { start_date: start, end_date: end.toISOString().split("T")[0] };
};

const fmtDist = (km) =>
  km >= 1_000_000
    ? `${(km / 1_000_000).toFixed(2)}M km`
    : `${Math.round(km).toLocaleString()} km`;

const EMPTY_FILTERS = { hazardous: false, sort: "", sortDir: "asc", search: "" };

export default function Asteroids() {
  const [asteroids, setAsteroids]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refetching, setRefetching]   = useState(false);
  const [error, setError]             = useState(null);
  const [dateRange, setDateRange]     = useState("7");
  const [customDates, setCustomDates] = useState(null); // { start_date, end_date }
  const [filters, setFilters]         = useState(EMPTY_FILTERS);
  const [chartFilters, setChartFilters] = useState({ risk: null, distance: null, selectedAsteroid: null });
  const hasLoaded = useRef(false);

  // Fetch whenever date selection changes
  useEffect(() => {
    const params = customDates ?? getDateRange(parseInt(dateRange, 10));

    if (!hasLoaded.current) {
      setLoading(true);
    } else {
      setRefetching(true);
    }
    setError(null);

    getAsteroids(params)
      .then((data) => {
        setAsteroids(data.asteroids);
        hasLoaded.current = true;
      })
      .catch((err) => setError(err.message))
      .finally(() => { setLoading(false); setRefetching(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, customDates]);

  const insights = useAsteroidInsights(asteroids);

  const displayed = useMemo(() => {
    let result = [...asteroids];

    if (chartFilters.risk === "hazardous") result = result.filter((a) => a.hazardous);
    if (chartFilters.risk === "safe")      result = result.filter((a) => !a.hazardous);
    if (chartFilters.distance) {
      const { lo, hi } = chartFilters.distance;
      result = result.filter((a) => a.distance_km >= lo && a.distance_km < hi);
    }

    if (filters.hazardous) result = result.filter((a) => a.hazardous);
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter((a) => a.name.toLowerCase().includes(q));
    }
    const dir = filters.sortDir === "desc" ? -1 : 1;
    if (filters.sort === "distance") result.sort((a, b) => dir * (a.distance_km - b.distance_km));
    if (filters.sort === "speed")    result.sort((a, b) => dir * (a.speed_kph    - b.speed_kph));
    if (filters.sort === "diameter") result.sort((a, b) => dir * (a.diameter     - b.diameter));

    return result;
  }, [asteroids, filters, chartFilters]);

  const stats = useMemo(() => {
    const total     = asteroids.length;
    const hazardous = asteroids.filter((a) => a.hazardous).length;
    return { total, hazardous, safe: total - hazardous };
  }, [asteroids]);

  const handlePieClick     = (risk)     => setChartFilters((p) => ({ ...p, risk: p.risk === risk ? null : risk }));
  const handleBarClick     = (dist) => setChartFilters((p) => ({ ...p, distance: p.distance?.lo === dist?.lo ? null : dist }));
  const handleScatterClick = (name)     => setChartFilters((p) => ({ ...p, selectedAsteroid: p.selectedAsteroid === name ? null : name }));

  const handleCustomRange = (start, end) => {
    setCustomDates({ start_date: start, end_date: end });
  };

  const handleClearAll = () => {
    setFilters(EMPTY_FILTERS);
    setCustomDates(null);
    setDateRange("7");
    setChartFilters({ risk: null, distance: null, selectedAsteroid: null });
  };

  const handleDateRange = (val) => {
    setCustomDates(null);
    setDateRange(val);
  };

  if (loading) {
    return <div className="loading-state"><div className="spinner" /><span>Scanning near-Earth objects…</span></div>;
  }

  if (error) {
    return (
      <div className="error-state">
        <strong>Failed to load asteroid data</strong>
        <p>{error}</p>
      </div>
    );
  }

  const hazardPct = stats.total ? ((stats.hazardous / stats.total) * 100).toFixed(1) : "0";
  const safePct   = stats.total ? ((stats.safe   / stats.total) * 100).toFixed(1) : "0";

  return (
    <div className="dashboard-layout">

      {/* ── Sidebar ── */}
      <aside className="dashboard-sidebar">
        <Sidebar insights={insights} stats={stats} />
      </aside>

      {/* ── Main content ── */}
      <main className="dashboard-main">

        {/* Header */}
        <div className="page-header" style={{ paddingTop: "1.25rem" }}>
          <h1>Near-Earth Asteroids</h1>
          <p>Real-time tracking data from NASA&apos;s Near-Earth Object Web Service</p>
        </div>

        {/* KPI cards */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-card-label">Total tracked</div>
            <div className="stat-card-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Hazardous</div>
            <div className="stat-card-value hazard-value">{hazardPct}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Safe</div>
            <div className="stat-card-value safe-value">{safePct}%</div>
          </div>
        </div>

        {/* Closest approach banner */}
        {insights?.closest && (
          <div className="highlight-banner">
            <span className="highlight-banner-label">Closest approach</span>
            <span className="highlight-banner-value">{fmtDist(insights.closest.distance_km)}</span>
            <span className="highlight-banner-name">{insights.closest.name}</span>
          </div>
        )}

        {/* Date range — above charts */}
        <DateRangeBar
          dateRange={dateRange}
          onDateRange={handleDateRange}
          onCustomRange={handleCustomRange}
          onClearAll={handleClearAll}
          refetching={refetching}
          hasActiveFilters={filters.hazardous || !!filters.sort || !!filters.search}
        />

        {/* Charts */}
        <div className="charts-section">
          <Chart
            asteroids={asteroids}
            onPieClick={handlePieClick}
            onBarClick={handleBarClick}
            onScatterClick={handleScatterClick}
            activeRisk={chartFilters.risk}
            activeDistance={chartFilters.distance}
            selectedAsteroid={chartFilters.selectedAsteroid}
          />
        </div>

        {/* Filter + sort — below charts */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          count={displayed.length}
          total={asteroids.length}
        />

        {/* Search — below filter, above list */}
        <div className="search-row">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name…"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        {/* Asteroid list */}
        {displayed.length > 0 ? (
          <div className="asteroid-list">
            {/* Column header — shown once */}
            <div className="ali ali-header">
              <span className="ali-dot" style={{ visibility: 'hidden' }} />
              <span className="ali-name" />
              <div className="ali-tags" />
              <span className="ali-status" style={{ visibility: 'hidden' }}>placeholder</span>
              <div className="ali-stats">
                <span className="ali-stat ali-stat--header">Dist</span>
                <span className="ali-stat ali-stat--header">Speed</span>
                <span className="ali-stat ali-stat--header">Ø Dia</span>
              </div>
            </div>
            {displayed.map((asteroid) => (
              <AsteroidCard
                key={asteroid.id ?? asteroid.name}
                asteroid={asteroid}
                isHighlighted={chartFilters.selectedAsteroid === asteroid.name}
                insights={insights}
                onClick={() => handleScatterClick(asteroid.name)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No asteroids match your current filters.</p>
          </div>
        )}

      </main>
    </div>
  );
}
