import { Auction, Logistics, Warehouse, SoilRequest } from '../models/advancedFeaturesModel.js';

// --- AUCTION CONTROLLERS ---
export const startAuction = async (req, res) => {
    try {
        const { cropName, quantity, basePrice, durationHours } = req.body;
        // Set exact end time based on duration
        const endTime = new Date(Date.now() + parseFloat(durationHours) * 3600000);
        const auction = await Auction.create({ 
            sellerId: req.userId, 
            cropName, 
            quantity, 
            basePrice, 
            highestBid: basePrice, // Initial highest bid is base price
            endTime,
            status: 'Active'
        });
        res.status(201).json(auction);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getAllAuctions = async (req, res) => {
    try {
        const auctions = await Auction.find({ status: 'Active' })
            .populate('sellerId', 'name')
            .populate('highestBidder', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json(auctions);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const placeBid = async (req, res) => {
    try {
        const { auctionId, bidAmount } = req.body;
        const auction = await Auction.findById(auctionId);

        if (!auction || auction.status === 'Closed' || new Date() > new Date(auction.endTime)) {
            return res.status(400).json({ error: "This auction has ended or is no longer active." });
        }

        // IPL Style: Must be at least 5% higher than previous bid
        const minIncrement = auction.highestBid * 1.05; 
        if (bidAmount < minIncrement) {
            return res.status(400).json({ 
                error: `Bid too low! Minimum next bid must be ₹${Math.ceil(minIncrement)}` 
            });
        }

        auction.highestBid = bidAmount;
        auction.highestBidder = req.userId;
        await auction.save();

        res.status(200).json({ message: "🔨 Bid placed! You are now the highest bidder.", auction });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- LOGISTICS CONTROLLERS ---
export const bookTransport = async (req, res) => {
    try {
        const { transportType, fromLocation, toLocation, weight, scheduledDate } = req.body;
        const logistics = await Logistics.create({ userId: req.userId, transportType, fromLocation, toLocation, weight, scheduledDate });
        res.status(201).json({ message: "Transport scheduled successfully!", logistics });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- WAREHOUSE CONTROLLERS ---
export const getWarehouses = async (req, res) => {
    try {
        // Sample Govt Warehouses for now
        const warehouses = await Warehouse.find();
        if (warehouses.length === 0) {
            return res.status(200).json([
                { name: "Central Govt Warehouse 01", location: "Kolkata", capacity: "5000 Tons", schemes: ["Govt Subsidy", "Smart Storage"], pricePerMonth: 200, contact: "1800-123-456" },
                { name: "State Warehouse A", location: "Mumbai", capacity: "2000 Tons", schemes: ["Farmer Benefit", "Zero Interest"], pricePerMonth: 150, contact: "1800-999-000" }
            ]);
        }
        res.status(200).json(warehouses);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- SOIL AGENT CONTROLLERS ---
export const requestSoilAgent = async (req, res) => {
    try {
        const { landSize, location } = req.body;
        const request = await SoilRequest.create({ userId: req.userId, landSize, location });
        res.status(201).json({ message: "Request sent. Agent will be assigned within 24 hours.", request });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- BID HISTORY CONTROLLERS ---
export const getMyBidHistory = async (req, res) => {
    try {
        const userId = req.userId;
        // Find all auctions where this user has placed a bid
        const auctions = await Auction.find({ highestBidder: userId })
            .populate('sellerId', 'name')
            .sort({ endTime: -1 });

        const history = auctions.map(auction => {
            const isExpired = new Date() > new Date(auction.endTime);
            let result = "Active";
            if (isExpired) {
                result = auction.highestBidder.toString() === userId.toString() ? "Won" : "Lost";
            }

            return {
                _id: auction._id,
                cropName: auction.cropName,
                quantity: auction.quantity,
                highestBid: auction.highestBid,
                endTime: auction.endTime,
                seller: auction.sellerId?.name,
                result: result,
                paymentStatus: auction.status === 'Closed' ? 'Paid' : 'Pending'
            };
        });

        res.status(200).json(history);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
