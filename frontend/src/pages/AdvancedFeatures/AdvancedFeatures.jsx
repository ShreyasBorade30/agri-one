import React, { useState, useEffect } from 'react';
import './AdvancedFeatures.scss';
import Sidebar from '../../components/sidebar/Sidebar.jsx';
import Navbar from '../../components/navbar/Navbar';
import newRequest from '../../utils/newRequest.js';
import GavelIcon from '@mui/icons-material/Gavel';
import TrainIcon from '@mui/icons-material/Train';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ScienceIcon from '@mui/icons-material/Science';
import TimerIcon from '@mui/icons-material/Timer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HistoryIcon from '@mui/icons-material/History';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CancelIcon from '@mui/icons-material/Cancel';

// Separate Auction Card Component for individual timers
const AuctionCard = ({ auction, onBid }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [bidAmount, setBidAmount] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(auction.endTime).getTime() - now;

      if (distance < 0) {
        setTimeLeft("EXPIRED");
        clearInterval(timer);
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [auction.endTime]);

  return (
    <div className={`auction-card ${timeLeft === "EXPIRED" ? 'expired' : ''}`}>
      <div className="auction-header">
        <h3>{auction.cropName}</h3>
        <span className="timer"><TimerIcon /> {timeLeft}</span>
      </div>
      <div className="auction-body">
        <p><strong>Quantity:</strong> {auction.quantity}</p>
        <p><strong>Base Price:</strong> ₹{auction.basePrice}</p>
        <div className="highest-bid-box">
          <TrendingUpIcon />
          <div>
            <span className="label">Current Highest Bid</span>
            <span className="value">₹{auction.highestBid}</span>
            <span className="bidder">By: {auction.highestBidder?.name || "No bids yet"}</span>
          </div>
        </div>
      </div>
      {timeLeft !== "EXPIRED" && (
        <div className="bid-actions">
          <input 
            type="number" 
            placeholder={`Min ₹${Math.ceil(auction.highestBid * 1.05)}`} 
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
          />
          <button onClick={() => { onBid(auction._id, bidAmount); setBidAmount(""); }}>Place Bid</button>
        </div>
      )}
    </div>
  );
};

const AdvancedFeatures = ({ setUserRole }) => {
  const [activeTab, setActiveTab] = useState('auction');
  const [auctions, setAuctions] = useState([]);
  const [bidHistory, setBidHistory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showStartAuction, setShowStartAuction] = useState(false);

  // Form States
  const [auctionForm, setAuctionForm] = useState({ cropName: '', quantity: '', basePrice: '', durationHours: 24 });
  const [transportForm, setTransportForm] = useState({ transportType: 'Private Truck', fromLocation: '', toLocation: '', weight: '', scheduledDate: '' });
  const [soilForm, setSoilForm] = useState({ landSize: '', location: '' });

  useEffect(() => {
    if (activeTab === 'auction') fetchAuctions();
    if (activeTab === 'warehouse') fetchWarehouses();
    if (activeTab === 'history') fetchBidHistory();
  }, [activeTab]);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const res = await newRequest.get('/api/advanced/auctions/active');
      setAuctions(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchBidHistory = async () => {
    setLoading(true);
    try {
      const res = await newRequest.get('/api/advanced/auctions/history');
      setBidHistory(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handlePayAuction = async (auction) => {
    try {
      // Get key from backend
      const keyRes = await newRequest.get('/api/market/payments/get-key');
      const RAZORPAY_KEY = keyRes.data.key;

      const res = await newRequest.post('/api/market/payments/order', {
        amount: auction.highestBid,
        itemId: auction._id,
        type: 'Purchase'
      });
      
      const options = {
        key: RAZORPAY_KEY,
        amount: res.data.amount,
        currency: "INR",
        name: "Agri-One Auction",
        description: `Payment for Won Auction: ${auction.cropName}`,
        order_id: res.data.id,
        handler: async (response) => {
          await newRequest.post('/api/market/payments/verify', response);
          alert("✅ Payment Successful! Crop is now yours.");
          fetchBidHistory();
        },
        prefill: { name: "Winner Farmer", email: "farmer@agriconnect.com" },
        theme: { color: "#2d6a4f" }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment failed to initialize.");
    }
  };

  const handlePlaceBid = async (auctionId, amount) => {
    try {
      await newRequest.post('/api/advanced/auctions/bid', { auctionId, bidAmount: amount });
      alert("🔨 Bid placed successfully!");
      fetchAuctions(); // Refresh live
    } catch (err) {
      alert(err.response?.data?.error || "Bid failed");
    }
  };

  const handleAuctionSubmit = async (e) => {
    e.preventDefault();
    try {
      await newRequest.post('/api/advanced/auctions/start', auctionForm);
      alert("Auction started successfully!");
      setShowStartAuction(false);
      fetchAuctions();
    } catch (err) { 
      console.error("Auction start error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to start auction"); 
    }
  };

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await newRequest.get('/api/advanced/warehouses');
      setWarehouses(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleTransportSubmit = async (e) => {
    e.preventDefault();
    try {
      await newRequest.post('/api/advanced/logistics/book', transportForm);
      alert("Transport booked successfully!");
    } catch (err) { alert("Booking failed"); }
  };

  const handleSoilSubmit = async (e) => {
    e.preventDefault();
    try {
      await newRequest.post('/api/advanced/soil/request', soilForm);
      alert("Soil Agent request sent!");
    } catch (err) { alert("Request failed"); }
  };

  return (
    <div className="advanced-page">
      <Sidebar setUserRole={setUserRole} />
      <div className="advanced-container">
        <Navbar />
        <div className="content">
          <div className="tabs">
            <button className={activeTab === 'auction' ? 'active' : ''} onClick={() => setActiveTab('auction')}>
              <GavelIcon /> Live Auction
            </button>
            <button className={activeTab === 'warehouse' ? 'active' : ''} onClick={() => setActiveTab('warehouse')}>
              <WarehouseIcon /> Warehouses
            </button>
            <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
              <HistoryIcon /> My Bids
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'history' && (
              <div className="bid-history">
                <h2>My Bidding History</h2>
                <div className="history-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Crop</th>
                        <th>Seller</th>
                        <th>Your Bid</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bidHistory.map((item) => (
                        <tr key={item._id}>
                          <td>{item.cropName} ({item.quantity})</td>
                          <td>{item.seller}</td>
                          <td>₹{item.highestBid}</td>
                          <td>
                            <span className={`status-badge ${item.result.toLowerCase()}`}>
                              {item.result === 'Won' && <WorkspacePremiumIcon />}
                              {item.result === 'Lost' && <CancelIcon />}
                              {item.result}
                            </span>
                          </td>
                          <td>
                            {item.result === 'Won' && item.paymentStatus === 'Pending' && (
                              <button className="pay-btn" onClick={() => handlePayAuction(item)}>Pay Now</button>
                            )}
                            {item.result === 'Won' && item.paymentStatus === 'Paid' && (
                              <span className="paid-text">Payment Done</span>
                            )}
                            {item.result === 'Active' && <span className="active-text">Waiting...</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!loading && bidHistory.length === 0 && <p className="no-data">You haven't placed any bids yet.</p>}
                </div>
              </div>
            )}

            {activeTab === 'auction' && (
              <div className="auction-section">
                <div className="section-header">
                  <h2>Active Crop Auctions</h2>
                  <button className="start-btn" onClick={() => setShowStartAuction(!showStartAuction)}>
                    {showStartAuction ? "View Auctions" : "Start New Auction"}
                  </button>
                </div>

                {showStartAuction ? (
                  <div className="feature-card">
                    <h2>List Crop for Auction</h2>
                    <form onSubmit={handleAuctionSubmit}>
                      <input type="text" placeholder="Crop Name (e.g. Kolam Rice)" value={auctionForm.cropName} onChange={e => setAuctionForm({...auctionForm, cropName: e.target.value})} required />
                      <input type="text" placeholder="Quantity (e.g. 500kg)" value={auctionForm.quantity} onChange={e => setAuctionForm({...auctionForm, quantity: e.target.value})} required />
                      <input type="number" placeholder="Base Price (₹)" value={auctionForm.basePrice} onChange={e => setAuctionForm({...auctionForm, basePrice: e.target.value})} required />
                      <div className="input-field">
                        <label>Auction Duration (Hours)</label>
                        <select value={auctionForm.durationHours} onChange={e => setAuctionForm({...auctionForm, durationHours: e.target.value})}>
                          <option value="1">1 Hour</option>
                          <option value="6">6 Hours</option>
                          <option value="12">12 Hours</option>
                          <option value="24">24 Hours</option>
                          <option value="48">48 Hours</option>
                        </select>
                      </div>
                      <button type="submit">Start Live Auction</button>
                    </form>
                  </div>
                ) : (
                  <div className="auctions-grid">
                    {loading ? <p>Loading live auctions...</p> : (
                      auctions.map(auction => (
                        <AuctionCard key={auction._id} auction={auction} onBid={handlePlaceBid} />
                      ))
                    )}
                    {!loading && auctions.length === 0 && <p className="no-data">No active auctions right now.</p>}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'warehouse' && (
              <div className="warehouse-list">
                <h2>Government Warehouse Schemes</h2>
                {loading ? <p>Loading...</p> : (
                  <div className="grid">
                    {warehouses.map((w, i) => (
                      <div key={i} className="item-card">
                        <h3>{w.name}</h3>
                        <p><strong>Location:</strong> {w.location}</p>
                        <p><strong>Schemes:</strong> {w.schemes.join(", ")}</p>
                        <p><strong>Price:</strong> ₹{w.pricePerMonth}/month</p>
                        <button>Book Space</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeatures;

