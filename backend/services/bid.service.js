import sql from "../configs/db.js";
import { validateAuctionTime, detectRankingChange, shouldExtendAuction, calculateNewCloseTime } from "./auction.service.js";
import { logBidPlaced, logExtension } from "./activity.service.js";
import { getLeaderboard } from "./leaderboard.service.js";

// Place a bid and apply extension logic
export const placeBidService = async (data) => {
    const {
        rfq_id, supplier_id, freight_charges, origin_charges, destination_charges,
        total_amount, transit_time, quote_validity
    } = data;

    // 1. Fetch RFQ
    const rfq = await sql`
        SELECT * FROM rfq 
        WHERE id = ${rfq_id} AND status = 'ACTIVE'
    `;
    if (rfq.length === 0) throw new Error("RFQ not active or does not exist");

    const r = rfq[0];
    const timeResult = await sql`SELECT NOW() as now`;
    const now = new Date(timeResult[0].now);

    // 2. Validate Time (Throws error if invalid)
    validateAuctionTime(r, now);

    const bidCloseTime = new Date(r.bid_close_time);

    // 3. Get previous ranking
    const previousBids = await getLeaderboard(rfq_id);

    // 3b. Better Bid Only Check
    const currentLowest = previousBids.length > 0 ? previousBids[0].total_amount : null;
    if (currentLowest !== null && parseFloat(total_amount) >= parseFloat(currentLowest)) {
        throw new Error("Bid must be lower than current lowest bid");
    }

    // 4. Insert Bid
    const newBid = await sql`
        INSERT INTO bid (
            rfq_id, supplier_id, freight_charges, origin_charges, destination_charges,
            total_amount, transit_time, quote_validity
        ) VALUES (
            ${rfq_id}, ${supplier_id}, ${freight_charges}, ${origin_charges}, ${destination_charges},
            ${total_amount}, ${transit_time}, ${quote_validity}
        ) RETURNING *;
    `;

    // 5. Get updated ranking
    const updatedBids = await getLeaderboard(rfq_id);
    const { l1Changed, rankChanged } = detectRankingChange(previousBids, updatedBids);

    // 6. Trigger window logic & extensions
    const diffMs = bidCloseTime.getTime() - now.getTime();
    const diffMins = diffMs / (1000 * 60);
    const inTriggerWindow = diffMins <= r.trigger_window_minutes;

    const { shouldExtend, extensionReason } = shouldExtendAuction({ inTriggerWindow, l1Changed, rankChanged });

    let extended = false;
    let newCloseTime = bidCloseTime;

    if (shouldExtend) {
        newCloseTime = calculateNewCloseTime(r, bidCloseTime);

        // Only extend if time actually increases
        if (newCloseTime.getTime() > bidCloseTime.getTime()) {
            extended = true;

            // Update RFQ if extended
            await sql`
                UPDATE rfq 
                SET bid_close_time = ${newCloseTime}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ${rfq_id}
            `;

            // Log extension
            await logExtension(
                rfq_id, 
                extensionReason, 
                bidCloseTime, 
                newCloseTime, 
                supplier_id, 
                r.extension_duration_minutes
            );
        }
    }

    // 7. Log bid placement
    await logBidPlaced(rfq_id, supplier_id, total_amount);

    return {
        bid: newBid[0],
        extended,
        extensionReason: extended ? extensionReason : null,
        previousCloseTime: bidCloseTime,
        newCloseTime
    };
};

export const getBidsForRFQService = async (rfqId) => {
    return await getLeaderboard(rfqId);
};