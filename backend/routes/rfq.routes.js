import express from "express";
import { createRFQ, getRFQs, getRFQById, getActivityLogs } from "../controllers/rfq.controller.js";

const router = express.Router();

router.post("/", createRFQ);
router.get("/", getRFQs);
router.get("/:id", getRFQById);
router.get("/:id/logs", getActivityLogs);

export default router;
