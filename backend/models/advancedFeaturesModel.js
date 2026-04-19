import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cropName: { type: String, required: true },
    quantity: { type: String, required: true }, // e.g., "500 kg"
    basePrice: { type: Number, required: true },
    highestBid: { type: Number, default: 0 },
    highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Closed'], default: 'Active' }
}, { timestamps: true });

const logisticsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transportType: { type: String, enum: ['Kisan Rail', 'Private Truck'], required: true },
    fromLocation: String,
    toLocation: String,
    weight: String,
    scheduledDate: Date,
    status: { type: String, default: 'Scheduled' }
}, { timestamps: true });

const warehouseSchema = new mongoose.Schema({
    name: String,
    location: String,
    capacity: String,
    schemes: [String], // e.g., ["Govt Subsidized", "Private Storage"]
    pricePerMonth: Number,
    contact: String
});

const soilRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    landSize: String,
    location: String,
    status: { type: String, enum: ['Pending', 'Agent Assigned', 'Completed'], default: 'Pending' },
    agentName: { type: String, default: 'Assigning soon...' }
}, { timestamps: true });

export const Auction = mongoose.model('Auction', auctionSchema);
export const Logistics = mongoose.model('Logistics', logisticsSchema);
export const Warehouse = mongoose.model('Warehouse', warehouseSchema);
export const SoilRequest = mongoose.model('SoilRequest', soilRequestSchema);
