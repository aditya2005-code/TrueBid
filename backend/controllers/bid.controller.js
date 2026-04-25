import { placeBidService, getBidsForRFQService } from "../services/bid.service.js";

export const placeBid = async (req, res) => {
    try {
        const result = await placeBidService(req.body);
        return res.status(201).json({ message: "Bid placed successfully", data: result });
    } catch (error) {
        console.error("Error placing bid:", error);
        return res.status(400).json({ error: error.message || "Internal Server Error" });
    }
};

