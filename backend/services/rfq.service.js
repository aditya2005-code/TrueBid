import sql from "../configs/db.js";

export const createRFQService = async (data) => {
    const {
        client_id, rfq_name, reference_id, description, pickup_date,
        bid_start_time, bid_close_time, forced_close_time,
        trigger_window_minutes, extension_duration_minutes, status
    } = data;

    const newRFQ = await sql`
        INSERT INTO rfq (
            client_id, rfq_name, reference_id, description, pickup_date,
            bid_start_time, bid_close_time, forced_close_time,
            trigger_window_minutes, extension_duration_minutes, status
        ) VALUES (
            ${client_id}, ${rfq_name}, ${reference_id}, ${description}, ${pickup_date}, 
            ${new Date(bid_start_time)}, 
            ${new Date(bid_close_time)}, 
            ${new Date(forced_close_time)},
            ${trigger_window_minutes}, ${extension_duration_minutes}, ${status || 'ACTIVE'}
        ) RETURNING *;
    `;
    return newRFQ[0];
};

export const getAllRFQService = async () => {
    const rfqs = await sql`
        SELECT r.*, 
        (SELECT MIN(total_amount) FROM bid WHERE rfq_id = r.id) as current_lowest_bid
        FROM rfq r
        ORDER BY r.created_at DESC;
    `;
    return rfqs;
};

export const getRFQByIdService = async (id) => {
    const rfq = await sql`
        SELECT * FROM rfq WHERE id = ${id};
    `;
    return rfq.length > 0 ? rfq[0] : null;
};

export const getRFQLogsService = async (rfqId) => {
    const logs = await sql`
        SELECT * FROM activity_log WHERE rfq_id = ${rfqId} ORDER BY created_at DESC;
    `;
    return logs;
};