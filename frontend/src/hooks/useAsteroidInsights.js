import { useMemo } from "react";

const minBy = (arr, key) => arr.reduce((a, b) => (a[key] < b[key] ? a : b));
const maxBy = (arr, key) => arr.reduce((a, b) => (a[key] > b[key] ? a : b));

export default function useAsteroidInsights(asteroids) {
  return useMemo(() => {
    if (!asteroids.length) return null;

    const hazardous     = asteroids.filter((a) => a.hazardous);
    const closest       = minBy(asteroids, "distance_km");
    const mostDangerous = hazardous.length ? minBy(hazardous, "distance_km") : null;
    const largest       = maxBy(asteroids, "diameter");
    const fastest       = maxBy(asteroids, "speed_kph");
    const slowest       = minBy(asteroids, "speed_kph");
    const avgDistance   = asteroids.reduce((s, a) => s + a.distance_km, 0) / asteroids.length;
    const avgSpeed      = asteroids.reduce((s, a) => s + a.speed_kph, 0) / asteroids.length;
    const hazardPercent = (hazardous.length / asteroids.length) * 100;

    const closeCount  = asteroids.filter((a) => a.distance_km < 10_000_000).length;
    const mediumCount = asteroids.filter((a) => a.distance_km >= 10_000_000 && a.distance_km < 50_000_000).length;
    const farCount    = asteroids.filter((a) => a.distance_km >= 50_000_000).length;

    return {
      closest,
      mostDangerous,
      largest,
      fastest,
      slowest,
      avgDistance,
      avgSpeed,
      hazardousCount:   hazardous.length,
      hazardPercentage: hazardPercent,
      closeCount,
      mediumCount,
      farCount,
    };
  }, [asteroids]);
}
