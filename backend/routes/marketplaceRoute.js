import express from 'express';
import { addEquipment, getEquipments, addProduct, getProducts, createOrder, verifyPayment, getRazorpayKey } from '../controllers/marketplaceController.js';
import { verifyToken } from '../middleware/jwt.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Equipment Rental
router.post('/equipments/add', verifyToken, upload.single('image'), addEquipment);
router.get('/equipments/all', verifyToken, getEquipments);

// Marketplace
router.post('/products/add', verifyToken, upload.single('image'), addProduct);
router.get('/products/all', verifyToken, getProducts);

// Razorpay Payments
router.get('/payments/get-key', verifyToken, getRazorpayKey);
router.post('/payments/order', verifyToken, createOrder);
router.post('/payments/verify', verifyToken, verifyPayment);

export default router;
