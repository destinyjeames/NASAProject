import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import asteroidRoutes from "./routes/asteroidRoutes.js";
import apodRoutes from "./routes/apodRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(compression());
app.use(cors());
app.use(express.json());

app.use("/api/asteroids", asteroidRoutes);
app.use("/api/apod", apodRoutes);

app.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Droid Stats API is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
