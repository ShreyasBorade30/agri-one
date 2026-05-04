import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Equipment, Product, Order } from '../models/marketplaceModel.js';
import sendEmail from '../utils/sendEmail.js';

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
        const { amount, itemId, type, quantity = 1, shippingAddress } = req.body; 
        
        console.log("Creating Order for:", { amount, itemId, type, quantity, shippingAddress });

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }

        if (!shippingAddress || !shippingAddress.address) {
            return res.status(400).json({ error: "Shipping address is required" });
        }

        const options = {
            amount: Math.round(amount * 100), 
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Create pending order in DB
        const newOrder = await Order.create({
            buyerId: req.userId,
            productId: type === 'Purchase' ? itemId : null,
            equipmentId: type === 'Rental' ? itemId : null,
            amount,
            quantity,
            razorpayOrderId: razorpayOrder.id,
            type,
            shippingAddress
        });

        res.status(200).json(razorpayOrder);
    } catch (err) { 
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
            ).populate('buyerId').populate('productId').populate('equipmentId');

            // Reduce product stock if it's a purchase
            if (order && order.productId && order.type === 'Purchase') {
                const product = await Product.findById(order.productId).populate('sellerId');
                if (product) {
                    product.quantity = Math.max(0, product.quantity - order.quantity);
                    await product.save();

                    // Send Email to Buyer
                    await sendEmail({
                        email: order.buyerId.email,
                        subject: `Order Confirmation - ${product.name}`,
                        html: `
                            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                                <div style="background-color: #2d6a4f; padding: 30px; text-align: center;">
                                    <h1 style="color: white; margin: 0; font-size: 24px;">Order Confirmed!</h1>
                                </div>
                                <div style="padding: 30px; background-color: #ffffff;">
                                    <p style="font-size: 16px; color: #333;">Hello <strong>${order.buyerId.name}</strong>,</p>
                                    <p style="color: #666; line-height: 1.5;">Your purchase was successful. Here are your order details:</p>
                                    
                                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px 0; color: #666;">Item:</td>
                                                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #2d6a4f;">${product.name}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #666;">Quantity:</td>
                                                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${order.quantity}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #666;">Total Paid:</td>
                                                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #2d6a4f; font-size: 18px;">₹${order.amount}</td>
                                            </tr>
                                        </table>
                                    </div>

                                    <div style="margin: 20px 0; padding: 15px; border: 1px dashed #2d6a4f; border-radius: 8px;">
                                        <h3 style="color: #2d6a4f; margin-top: 0; font-size: 16px;">Shipping Address</h3>
                                        <p style="margin: 5px 0; font-size: 14px; color: #444;">
                                            <strong>${order.shippingAddress.name}</strong><br/>
                                            ${order.shippingAddress.address},<br/>
                                            ${order.shippingAddress.city} - ${order.shippingAddress.pincode}<br/>
                                            Phone: ${order.shippingAddress.phone}
                                        </p>
                                    </div>
                                    
                                    <div style="border-left: 4px solid #2d6a4f; padding: 15px; background: #e9f5ee; margin-top: 20px;">
                                        <p style="margin: 0; font-size: 14px; color: #2d6a4f;"><strong>Seller Contact:</strong><br/>${product.sellerId.name} (${product.sellerId.email})</p>
                                    </div>
                                    
                                    <p style="margin-top: 30px; font-size: 14px; color: #888; text-align: center;">Thank you for shopping on Agri-One Marketplace!</p>
                                </div>
                                <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #888;">
                                    &copy; 2024 Agri-One | Empowering Farmers
                                </div>
                            </div>
                        `
                    });

                    // Send Email to Seller
                    await sendEmail({
                        email: product.sellerId.email,
                        subject: `Congratulations! Item Sold - ${product.name}`,
                        html: `
                            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                                <div style="background-color: #1b4332; padding: 30px; text-align: center;">
                                    <h1 style="color: white; margin: 0; font-size: 24px;">New Sale!</h1>
                                </div>
                                <div style="padding: 30px; background-color: #ffffff;">
                                    <p style="font-size: 16px; color: #333;">Hello <strong>${product.sellerId.name}</strong>,</p>
                                    <p style="color: #666; line-height: 1.5;">Great news! One of your products has been sold.</p>
                                    
                                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px 0; color: #666;">Product:</td>
                                                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #1b4332;">${product.name}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #666;">Buyer:</td>
                                                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${order.buyerId.name}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #666;">Earnings:</td>
                                                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #1b4332; font-size: 18px;">₹${order.amount}</td>
                                            </tr>
                                        </table>
                                    </div>

                                    <div style="margin: 20px 0; padding: 15px; border: 1px dashed #1b4332; border-radius: 8px;">
                                        <h3 style="color: #1b4332; margin-top: 0; font-size: 16px;">Delivery Details</h3>
                                        <p style="margin: 5px 0; font-size: 14px; color: #444;">
                                            <strong>${order.shippingAddress.name}</strong><br/>
                                            ${order.shippingAddress.address},<br/>
                                            ${order.shippingAddress.city} - ${order.shippingAddress.pincode}<br/>
                                            Phone: ${order.shippingAddress.phone}
                                        </p>
                                    </div>
                                    
                                    <p style="font-size: 14px; color: #444;">Please coordinate with the buyer at <strong>${order.buyerId.email}</strong> to complete the delivery.</p>
                                </div>
                                <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #888;">
                                    Visit your dashboard to manage your listings.
                                </div>
                            </div>
                        `
                    });
                }
            } else if (order && order.equipmentId && order.type === 'Rental') {
                const equipment = await Equipment.findById(order.equipmentId).populate('ownerId');
                if (equipment) {
                    // Send Email to Buyer
                    await sendEmail({
                        email: order.buyerId.email,
                        subject: `Rental Confirmation - ${equipment.name}`,
                        html: `
                            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                                <div style="background-color: #2d6a4f; padding: 30px; text-align: center;">
                                    <h1 style="color: white; margin: 0; font-size: 24px;">Rental Confirmed!</h1>
                                </div>
                                <div style="padding: 30px; background-color: #ffffff;">
                                    <p style="font-size: 16px; color: #333;">Hello <strong>${order.buyerId.name}</strong>,</p>
                                    <p style="color: #666; line-height: 1.5;">Your rental request was successful.</p>
                                    
                                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px 0; color: #666;">Equipment:</td>
                                                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #2d6a4f;">${equipment.name}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #666;">Amount Paid:</td>
                                                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #2d6a4f; font-size: 18px;">₹${order.amount}</td>
                                            </tr>
                                        </table>
                                    </div>

                                    <div style="margin: 20px 0; padding: 15px; border: 1px dashed #2d6a4f; border-radius: 8px;">
                                        <h3 style="color: #2d6a4f; margin-top: 0; font-size: 16px;">Pickup/Delivery Address</h3>
                                        <p style="margin: 5px 0; font-size: 14px; color: #444;">
                                            <strong>${order.shippingAddress.name}</strong><br/>
                                            ${order.shippingAddress.address},<br/>
                                            ${order.shippingAddress.city} - ${order.shippingAddress.pincode}<br/>
                                            Phone: ${order.shippingAddress.phone}
                                        </p>
                                    </div>
                                    
                                    <div style="border-left: 4px solid #f08c00; padding: 15px; background: #fff9db; margin-top: 20px;">
                                        <p style="margin: 0; font-size: 14px; color: #856404;"><strong>Owner Details:</strong><br/>${equipment.ownerId.name} (${equipment.ownerId.email})</p>
                                    </div>
                                </div>
                            </div>
                        `
                    });

                    // Send Email to Owner
                    await sendEmail({
                        email: equipment.ownerId.email,
                        subject: `Equipment Rented Out! - ${equipment.name}`,
                        html: `
                            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                                <div style="background-color: #1b4332; padding: 30px; text-align: center;">
                                    <h1 style="color: white; margin: 0; font-size: 24px;">New Rental!</h1>
                                </div>
                                <div style="padding: 30px; background-color: #ffffff;">
                                    <p style="font-size: 16px; color: #333;">Hello <strong>${equipment.ownerId.name}</strong>,</p>
                                    <p style="color: #666;">Your equipment has been rented out.</p>
                                    
                                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px 0; color: #666;">Equipment:</td>
                                                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${equipment.name}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #666;">Renter:</td>
                                                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${order.buyerId.name}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0; color: #666;">Income:</td>
                                                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #1b4332; font-size: 18px;">₹${order.amount}</td>
                                            </tr>
                                        </table>
                                    </div>

                                    <div style="margin: 20px 0; padding: 15px; border: 1px dashed #1b4332; border-radius: 8px;">
                                        <h3 style="color: #1b4332; margin-top: 0; font-size: 16px;">Delivery Details</h3>
                                        <p style="margin: 5px 0; font-size: 14px; color: #444;">
                                            <strong>${order.shippingAddress.name}</strong><br/>
                                            ${order.shippingAddress.address},<br/>
                                            ${order.shippingAddress.city} - ${order.shippingAddress.pincode}<br/>
                                            Phone: ${order.shippingAddress.phone}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        `
                    });
                }
            }

            res.status(200).json({ message: "Payment verified successfully" });
        } else {
            res.status(400).json({ error: "Invalid signature" });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getOrderHistory = async (req, res) => {
    try {
        const orders = await Order.find({ buyerId: req.userId, paymentStatus: 'Success' })
            .populate('productId')
            .populate('equipmentId')
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getMySalesHistory = async (req, res) => {
    try {
        const products = await Product.find({ sellerId: req.userId }).sort({ createdAt: -1 });
        const equipments = await Equipment.find({ ownerId: req.userId }).sort({ createdAt: -1 });
        res.status(200).json({ products, equipments });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, sellerId: req.userId },
            { $set: req.body },
            { new: true }
        );
        if (!product) return res.status(404).json({ error: "Product not found or unauthorized" });
        res.status(200).json(product);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateEquipment = async (req, res) => {
    try {
        const equipment = await Equipment.findOneAndUpdate(
            { _id: req.params.id, ownerId: req.userId },
            { $set: req.body },
            { new: true }
        );
        if (!equipment) return res.status(404).json({ error: "Equipment not found or unauthorized" });
        res.status(200).json(equipment);
    } catch (err) { res.status(500).json({ error: err.message }); }
};
