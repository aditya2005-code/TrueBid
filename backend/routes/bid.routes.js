import express from "express";
import { placeBid, getBidsForRFQ } from "../controllers/bid.controller.js";

const router = express.Router();

router.post("/", placeBid);
router.get("/rfq/:rfqId", getBidsForRFQ);

export default router;
