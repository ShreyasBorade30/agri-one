import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Equipment, Product, Order } from '../models/marketplaceModel.js';

dotenv.config();

// --- EQUIPMENT RENTAL ---
export const addEquipment = async (req, res) => {
    try {
        const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : '';
        const equipment = await Equipment.create({ ...req.body, ownerId: req.userId, imageUrl });
        res.status(201).json(equipment);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getEquipments = async (req, res) => {
    try {
        // Filter out equipments owned by the current user
        const equipments = await Equipment.find({ 
            availability: true,
            ownerId: { $ne: req.userId } 
        });
        res.status(200).json(equipments);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- MARKETPLACE ---
export const addProduct = async (req, res) => {
    try {
        const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : '';
        const product = await Product.create({ ...req.body, sellerId: req.userId, imageUrl });
        res.status(201).json(product);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getProducts = async (req, res) => {
    try {
        // Filter out products sold by the current user
        const products = await Product.find({
            sellerId: { $ne: req.userId }
        });
        res.status(200).json(products);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- RAZORPAY PAYMENT GATEWAY ---
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const getRazorpayKey = async (req, res) => {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
};

export const createOrder = async (req, res) => {
    try {
        const { amount, itemId, type, quantity = 1 } = req.body; 
        
        console.log("Creating Order for:", { amount, itemId, type, quantity });

        if (!amount || isNaN(amount) || amount <= 0) {
            console.error("Invalid amount received:", amount);
            return res.status(400).json({ error: "Invalid amount" });
        }

        const options = {
            amount: Math.round(amount * 100), // Convert to paise and ensure it's an integer
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const razorpayOrder = await razorpay.orders.create(options);
        console.log("Razorpay Order Created:", razorpayOrder.id);

        // Create pending order in DB
        const newOrder = await Order.create({
            buyerId: req.userId,
            productId: type === 'Purchase' ? itemId : null,
            equipmentId: type === 'Rental' ? itemId : null,
            amount,
            quantity,
            razorpayOrderId: razorpayOrder.id,
            type
        });
        console.log("Order saved in DB:", newOrder._id);

        res.status(200).json(razorpayOrder);
    } catch (err) { 
        console.error("CRITICAL ERROR IN CREATE_ORDER:", err);
        res.status(500).json({ error: err.message || "Failed to create order" }); 
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'your_secret')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            const order = await Order.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { paymentStatus: 'Success' },
                { new: true }
            );

            // Reduce product stock if it's a purchase
            if (order && order.productId && order.type === 'Purchase') {
                const product = await Product.findById(order.productId);
                if (product) {
                    product.quantity = Math.max(0, product.quantity - order.quantity);
                    await product.save();
                }
            }

            res.status(200).json({ message: "Payment verified successfully" });
        } else {
            res.status(400).json({ error: "Invalid signature" });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
};
