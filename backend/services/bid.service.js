import sql from "../configs/db.js";

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
    const now = new Date();
    const bidCloseTime = new Date(r.bid_close_time);
    const forcedCloseTime = new Date(r.forced_close_time);

    if (now >= forcedCloseTime) {
        throw new Error("Auction has reached forced close time and is strictly closed");
    }

    if (now > bidCloseTime) {
        throw new Error("Auction is already closed");
    }

    // 2. Get previous ranking
    const previousBids = await sql`
        SELECT supplier_id FROM bid 
        WHERE rfq_id = ${rfq_id} 
        ORDER BY total_amount ASC
    `;
    const previousOrder = previousBids.map(b => b.supplier_id);
    const previousL1 = previousOrder[0] || null;

    // 3. Insert Bid
    const newBid = await sql`
        INSERT INTO bid (
            rfq_id, supplier_id, freight_charges, origin_charges, destination_charges,
            total_amount, transit_time, quote_validity
        ) VALUES (
            ${rfq_id}, ${supplier_id}, ${freight_charges}, ${origin_charges}, ${destination_charges},
            ${total_amount}, ${transit_time}, ${quote_validity}
        ) RETURNING *;
    `;

    // 4. Get updated ranking
    const updatedBids = await sql`
        SELECT supplier_id FROM bid 
        WHERE rfq_id = ${rfq_id} 
        ORDER BY total_amount ASC
    `;
    const newOrder = updatedBids.map(b => b.supplier_id);
    const newL1 = newOrder[0] || null;

    const l1Changed = previousL1 !== newL1;
    const rankChanged = JSON.stringify(previousOrder) !== JSON.stringify(newOrder);

    // 5. Trigger window logic
    const diffMs = bidCloseTime.getTime() - now.getTime();
    const diffMins = diffMs / (1000 * 60);
    const inTriggerWindow = diffMins <= r.trigger_window_minutes;

    let extended = false;
    let extensionReason = null;
    let newCloseTime = bidCloseTime;

    if (inTriggerWindow || l1Changed || rankChanged) {
        newCloseTime = new Date(
            bidCloseTime.getTime() + r.extension_duration_minutes * 60000
        );

        // Clamp to forced close
        if (newCloseTime > forcedCloseTime) {
            newCloseTime = forcedCloseTime;
        }

        // Only extend if time actually increases
        if (newCloseTime.getTime() > bidCloseTime.getTime()) {
            extended = true;

            // ✅ FIX 3: Proper reason priority
            if (l1Changed) {
                extensionReason = "L1_CHANGE";
            } else if (rankChanged) {
                extensionReason = "RANK_CHANGE";
            } else {
                extensionReason = "TRIGGER_WINDOW";
            }
        }
    }

    // 6. Log bid placement
    await sql`
        INSERT INTO activity_log (rfq_id, event_type, message)
        VALUES (
            ${rfq_id},
            'BID_PLACED',
            ${`Supplier ${supplier_id} placed bid: ${total_amount}`}
        )
    `;

    // 7. Update RFQ if extended
    if (extended) {
        await sql`
            UPDATE rfq 
            SET bid_close_time = ${newCloseTime}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${rfq_id}
        `;

        await sql`
            INSERT INTO activity_log (
                rfq_id, event_type, message, previous_end_time, new_end_time
            )
            VALUES (
                ${rfq_id},
                'EXTENSION',
                ${`Auction extended due to ${extensionReason}`},
                ${bidCloseTime},
                ${newCloseTime}
            )
        `;
    }

    return {
        bid: newBid[0],
        extended,
        extensionReason,
        previousCloseTime: bidCloseTime,
        newCloseTime
    };
};

export const getBidsForRFQService = async (rfqId) => {
    const bids = await sql`
        SELECT * FROM bid 
        WHERE rfq_id = ${rfqId} 
        ORDER BY total_amount ASC
    `;
    return bids;
};