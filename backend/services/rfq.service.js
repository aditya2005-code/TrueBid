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
            ${bid_start_time}, ${bid_close_time}, ${forced_close_time},
            ${trigger_window_minutes}, ${extension_duration_minutes}, ${status || 'ACTIVE'}
        ) RETURNING *;
    `;
    return newRFQ[0];
};
