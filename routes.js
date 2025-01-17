import express from "express";
import { dashboardController } from "./controllers/dashboard-controller.js";
import { aboutController } from "./controllers/about-controller.js";

export const router = express.Router();

router.get("/", dashboardController.index);
router.get("/dashboard", dashboardController.index);
router.post("/dashboard/addstation", dashboardController.addStation);
router.post("/dashboard/addreading", dashboardController.addReading);
router.get("/dashboard/addreading/:stationId", dashboardController.addReadingForm);
router.get("/about", aboutController.index);
