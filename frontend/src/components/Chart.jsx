import EChartsPie from './EChartsPie';
import EChartsBar from './EChartsBar';
import EChartsScatter from './EChartsScatter';
import OrbitalMap from './OrbitalMap';

export default function Chart({ asteroids, onPieClick, onBarClick, onScatterClick, activeRisk, activeDistance, selectedAsteroid }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Row 1: donut + bar side by side */}
      <div className="charts-grid">
        <EChartsPie
          asteroids={asteroids}
          onClick={onPieClick}
          activeRisk={activeRisk}
        />
        <EChartsBar
          asteroids={asteroids}
          onClick={onBarClick}
          activeDistance={activeDistance}
        />
      </div>
      {/* Row 2: scatter full width */}
      <EChartsScatter
        asteroids={asteroids}
        onClick={onScatterClick}
        selectedAsteroid={selectedAsteroid}
      />
      {/* Row 3: orbital proximity map full width */}
      <OrbitalMap
        asteroids={asteroids}
        selectedAsteroid={selectedAsteroid}
        onClick={onScatterClick}
      />
    </div>
  );
}
