import { fetchApod } from "../services/nasaService.js";

export const getApod = async (req, res) => {
  try {
    const date = req.query.date || null;
    const data = await fetchApod(date);
    res.set("Cache-Control", "public, max-age=3600");
    res.status(200).json({
      title:       data.title,
      url:         data.url,
      explanation: data.explanation,
      media_type:  data.media_type,
      date:        data.date,
      copyright:   data.copyright ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch APOD:", error.message);
    res.status(500).json({ message: error.message || "Unable to fetch APOD" });
  }
};
