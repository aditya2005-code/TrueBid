import sql from "../configs/db.js";

export const getLeaderboard = async (rfqId) => {
    const bids = await sql`
        SELECT * FROM bid 
        WHERE rfq_id = ${rfqId} 
        ORDER BY total_amount ASC
    `;
    return bids.map((bid, index) => ({
        ...bid,
        rank: index + 1
    }));
};
