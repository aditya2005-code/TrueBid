import { placeBidService } from "../services/bid.service.js";
import { getLeaderboard } from "../services/leaderboard.service.js";

export const placeBid = async (req, res) => {
    try {
        const result = await placeBidService(req.body);
        return res.status(201).json({ message: "Bid placed successfully", data: result });
    } catch (error) {
        console.error("Error placing bid:", error);
        return res.status(400).json({ error: error.message || "Internal Server Error" });
    }
};


export const getBidsForRFQ = async (req, res) => {
    try {
        const { rfqId } = req.params;
        const bids = await getLeaderboard(rfqId);
        return res.status(200).json({ data: bids });
    } catch (error) {
        console.error("Error fetching bids:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


