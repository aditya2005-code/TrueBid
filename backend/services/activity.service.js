import sql from "../configs/db.js";

export const logBidPlaced = async (rfq_id, supplier_id, amount) => {
    await sql`
        INSERT INTO activity_log (rfq_id, event_type, message)
        VALUES (
            ${rfq_id},
            'BID_PLACED',
            ${`Supplier ${supplier_id} placed bid: ${amount}`}
        )
    `;
};

export const logExtension = async (rfq_id, reason, previousTime, newTime, supplier_id = null, extension_minutes = null) => {
    let message = `Auction extended due to ${reason}`;

    if (reason === "L1_CHANGE" && supplier_id && extension_minutes) {
        message = `Supplier ${supplier_id} became lowest bidder. Auction extended by ${extension_minutes} minutes`;
    }

    await sql`
        INSERT INTO activity_log (
            rfq_id, event_type, message, previous_end_time, new_end_time
        )
        VALUES (
            ${rfq_id},
            'EXTENSION',
            ${message},
            ${previousTime},
            ${newTime}
        )
    `;
};
