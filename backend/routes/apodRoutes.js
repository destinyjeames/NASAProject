import { Router } from "express";
import { getApod } from "../controllers/apodController.js";

const router = Router();

router.get("/", getApod);

export default router;
