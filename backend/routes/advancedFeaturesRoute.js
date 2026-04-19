import express from 'express';
import { startAuction, getAllAuctions, placeBid, bookTransport, getWarehouses, requestSoilAgent, getMyBidHistory } from '../controllers/advancedFeaturesController.js';
import { verifyToken } from '../middleware/jwt.js';

const router = express.Router();

// Auction
router.post('/auctions/start', verifyToken, startAuction);
router.get('/auctions/active', verifyToken, getAllAuctions);
router.post('/auctions/bid', verifyToken, placeBid);

// Logistics
router.post('/logistics/book', verifyToken, bookTransport);

// Warehouses
router.get('/warehouses', verifyToken, getWarehouses);

// Soil Quality Agent
router.post('/soil/request', verifyToken, requestSoilAgent);

// Bid History
router.get('/auctions/history', verifyToken, getMyBidHistory);

export default router;
