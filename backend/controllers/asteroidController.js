import { fetchNearEarthObjects } from "../services/nasaService.js";
import { toNumber, averageDiameter } from "../utils/formatters.js";

const transformAsteroid = (asteroid) => ({
  id: asteroid.id,
  name: asteroid.name ?? "Unknown",
  hazardous: asteroid.is_potentially_hazardous_asteroid ?? false,
  diameter: averageDiameter(asteroid.estimated_diameter),
  distance_km: Number(
    toNumber(
      asteroid.close_approach_data?.[0]?.miss_distance?.kilometers
    ).toFixed(2)
  ),
  speed_kph: Number(
    toNumber(
      asteroid.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour
    ).toFixed(2)
  ),
});

const flattenAsteroids = (nearEarthObjects) =>
  Object.values(nearEarthObjects ?? {}).flat().map(transformAsteroid);

export const getAsteroids = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const nearEarthObjects = await fetchNearEarthObjects({
      startDate: start_date,
      endDate: end_date,
    });

    const asteroids = flattenAsteroids(nearEarthObjects);

    res.status(200).json({ count: asteroids.length, asteroids });
  } catch (error) {
    console.error("Failed to fetch asteroids:", error.message);
    res.status(500).json({ message: error.message || "Unable to fetch asteroid data" });
  }
};
