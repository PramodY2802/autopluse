import express from "express";
import {
  getVehiclesByUserId,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleById
} from "../controllers/vehicleController.js";

const router = express.Router();

// Get all vehicles for a specific user (userId is integer)
router.get("/:userId", getVehiclesByUserId);

// Create a vehicle
router.post("/", createVehicle);

// Update a vehicle by vehicle ID
router.put("/:id", updateVehicle);

// Delete a vehicle by vehicle ID
router.delete("/:id", deleteVehicle);

router.get("/single/:id", getVehicleById);

export default router;
