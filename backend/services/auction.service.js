export const validateAuctionTime = (rfq, now) => {
    const bidStartTime = new Date(rfq.bid_start_time);
    const bidCloseTime = new Date(rfq.bid_close_time);
    const forcedCloseTime = new Date(rfq.forced_close_time);

    if (now > forcedCloseTime) {
        throw new Error("Auction has reached forced close time and is strictly closed");
    }

    if (now > bidCloseTime) {
        throw new Error("Auction is already closed");
    }

    if (now < bidStartTime) {
        throw new Error("Auction has not started yet");
    }
};

export const detectRankingChange = (previousBids, updatedBids) => {
    const previousOrder = previousBids.map(b => b.supplier_id);
    const newOrder = updatedBids.map(b => b.supplier_id);

    const previousL1 = previousOrder[0] || null;
    const newL1 = newOrder[0] || null;

    const l1Changed = previousL1 !== newL1;
    const rankChanged =
        previousOrder.length !== newOrder.length ||
        previousOrder.some((id, i) => id !== newOrder[i]);

    return { l1Changed, rankChanged };
};

export const shouldExtendAuction = ({ inTriggerWindow, l1Changed, rankChanged }) => {
    if (inTriggerWindow || l1Changed || rankChanged) {
        if (l1Changed) return { shouldExtend: true, extensionReason: "L1_CHANGE" };
        if (rankChanged) return { shouldExtend: true, extensionReason: "RANK_CHANGE" };
        return { shouldExtend: true, extensionReason: "TRIGGER_WINDOW" };
    }
    return { shouldExtend: false, extensionReason: null };
};

export const calculateNewCloseTime = (rfq, currentCloseTime) => {
    let newCloseTime = new Date(
        currentCloseTime.getTime() + rfq.extension_duration_minutes * 60000
    );

    const forcedCloseTime = new Date(rfq.forced_close_time);

    if (newCloseTime > forcedCloseTime) {
        newCloseTime = forcedCloseTime;
    }

    return newCloseTime;
};

export const getAuctionStatus = (rfq, now) => {
    const forcedCloseTime = new Date(rfq.forced_close_time);
    const bidCloseTime = new Date(rfq.bid_close_time);

    if (now > forcedCloseTime) return "FORCE_CLOSED";
    if (now > bidCloseTime) return "CLOSED";
    return "ACTIVE";
};
