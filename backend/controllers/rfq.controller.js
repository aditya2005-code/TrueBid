import { createRFQService, getAllRFQService, getRFQByIdService, getRFQLogsService } from "../services/rfq.service.js";

// Create an RFQ
export const createRFQ = async (req, res) => {
    try {
        const {
            client_id,
            rfq_name,
            reference_id,
            description,
            pickup_date,
            bid_start_time,
            bid_close_time,
            forced_close_time,
            trigger_window_minutes,
            extension_duration_minutes,
            status
        } = req.body;

        // Validation Rule: Forced Bid Close Time must always be greater than Bid Close Time
        if (new Date(forced_close_time) <= new Date(bid_close_time)) {
            return res.status(400).json({ error: "forced_close_time must be greater than bid_close_time" });
        }

        // Default constraints for trigger and extension if not provided (e.g. 10 mins window, 5 mins extension)
        const finalTriggerWindow = trigger_window_minutes || 10;
        const finalExtensionDuration = extension_duration_minutes || 5;

        const newRFQ = await createRFQService({
            client_id,
            rfq_name,
            reference_id,
            description,
            pickup_date,
            bid_start_time,
            bid_close_time,
            forced_close_time,
            trigger_window_minutes: finalTriggerWindow,
            extension_duration_minutes: finalExtensionDuration,
            status
        });

        return res.status(201).json({ message: "RFQ Created Successfully", data: newRFQ });
    } catch (error) {
        console.error("Error creating RFQ:", error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// Get all RFQs
export const getRFQs = async (req, res) => {
    try {
        const rfqs = await getAllRFQService();
        return res.status(200).json({ data: rfqs });
    } catch (error) {
        console.error("Error fetching RFQs:", error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// Get specific RFQ by ID
export const getRFQById = async (req, res) => {
    try {
        const { id } = req.params;
        const rfq = await getRFQByIdService(id);

        if (!rfq) {
            return res.status(404).json({ error: "RFQ not found" });
        }

        return res.status(200).json({ data: rfq });
    } catch (error) {
        console.error("Error fetching RFQ:", error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// Get activity logs for an RFQ
export const getActivityLogs = async (req, res) => {
    try {
        const { id } = req.params;
        const logs = await getRFQLogsService(id);
        return res.status(200).json({ data: logs });
    } catch (error) {
        console.error("Error fetching logs:", error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};
