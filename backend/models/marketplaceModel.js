import mongoose from 'mongoose';

// --- EQUIPMENT RENTAL MODEL ---
const equipmentSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, required: true }, // e.g., Tractor, Harvester
    description: String,
    rentPerDay: { type: Number, required: true },
    availability: { type: Boolean, default: true },
    imageUrl: String,
    location: String
}, { timestamps: true });

// --- MARKETPLACE MODEL (Products) ---
const productSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String, required: true }, // e.g., Seeds, Fertilizers, Tools
    price: { type: Number, required: true },
    quantity: { type: Number, default: 0 }, // Available stock quantity
    description: String,
    imageUrl: String
}, { timestamps: true });

// --- PAYMENT/ORDER MODEL ---
const orderSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
    amount: { type: Number, required: true },
    quantity: { type: Number, default: 1 }, // Quantity purchased
    razorpayOrderId: { type: String, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Success', 'Failed'], default: 'Pending' },
    type: { type: String, enum: ['Purchase', 'Rental'] }
}, { timestamps: true });

export const Equipment = mongoose.model('Equipment', equipmentSchema);
export const Product = mongoose.model('Product', productSchema);
export const Order = mongoose.model('Order', orderSchema);
