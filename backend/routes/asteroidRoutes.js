import { Router } from "express";
import { getAsteroids } from "../controllers/asteroidController.js";

const router = Router();

router.get("/", getAsteroids);

export default router;
