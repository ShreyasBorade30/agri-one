import React, { useState, useEffect } from 'react';
import './Marketplace.scss';
import Sidebar from '../../components/sidebar/Sidebar.jsx';
import Navbar from '../../components/navbar/Navbar';
import newRequest from '../../utils/newRequest.js';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import EngineeringIcon from '@mui/icons-material/Engineering';
import AddIcon from '@mui/icons-material/Add';

const Marketplace = ({ setUserRole }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: '', category: '', price: '', description: '', type: '', rentPerDay: '', quantity: 1
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'products' ? '/api/market/products/all' : '/api/market/equipments/all';
      const res = await newRequest.get(endpoint);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (item) => {
    try {
      if (activeTab === 'products' && item.quantity <= 0) {
        alert("This item is currently out of stock!");
        return;
      }
      
      // Ensure Razorpay script is available
      if (!window.Razorpay) {
        alert("Razorpay SDK not found. Please refresh the page.");
        return;
      }

      const res = await newRequest.post('/api/market/payments/order', {
        amount: activeTab === 'products' ? item.price : item.rentPerDay,
        itemId: item._id,
        type: activeTab === 'products' ? 'Purchase' : 'Rental',
        quantity: 1 // Purchasing 1 unit at a time for now
      });

      // Get Razorpay Key securely from Backend
      const keyRes = await newRequest.get('/api/market/payments/get-key');
      const RAZORPAY_KEY = keyRes.data.key;

      if (!RAZORPAY_KEY) {
        alert("Payment key not found. Check backend .env");
        return;
      }
      
      const options = {
        key: RAZORPAY_KEY, 
        amount: res.data.amount,
        currency: "INR",
        name: "Agri-One Marketplace",
        description: `Payment for ${item.name}`,
        order_id: res.data.id,
        config: {
          display: {
            blocks: {
              banks: {
                name: 'Choose Netbanking (Easiest for Test)',
                instruments: [
                  { method: 'netbanking' },
                ],
              },
            },
            sequence: ['block.banks', 'block.card'],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
        handler: async (response) => {
          try {
            await newRequest.post('/api/market/payments/verify', response);
            alert("✅ Payment Successful! Order Placed.");
            fetchData();
          } catch (err) {
            alert("❌ Payment Verification Failed!");
          }
        },
        prefill: {
          name: "Farmer User",
          email: "farmer@agriconnect.com",
          contact: "9999999999",
          method: "netbanking"
        },
        theme: { color: "#2d6a4f" }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Payment initialization failed. Check console for details.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (imageFile) data.append('image', imageFile);

    try {
      const endpoint = activeTab === 'products' ? '/api/market/products/add' : '/api/market/equipments/add';
      await newRequest.post(endpoint, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Added successfully!");
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      alert("Failed to add item");
    }
  };

  return (
    <div className="marketplace-page">
      <Sidebar setUserRole={setUserRole} />
      <div className="market-container">
        <Navbar />
        <div className="content">
          <div className="header">
            <div className="tabs">
              <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
                <ShoppingCartIcon /> Products
              </button>
              <button className={activeTab === 'rentals' ? 'active' : ''} onClick={() => setActiveTab('rentals')}>
                <EngineeringIcon /> Equipment Rental
              </button>
            </div>
            <button className="add-btn" onClick={() => setShowAddModal(true)}>
              <AddIcon /> List New Item
            </button>
          </div>

          {showAddModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>{activeTab === 'products' ? 'Sell Product' : 'Rent Equipment'}</h2>
                <form onSubmit={handleSubmit}>
                  <input type="text" placeholder="Name" onChange={e => setFormData({...formData, name: e.target.value})} required />
                  <input type="text" placeholder="Category/Type" onChange={e => setFormData({...formData, category: e.target.value, type: e.target.value})} required />
                  <input type="number" placeholder={activeTab === 'products' ? 'Price (₹)' : 'Rent per Day (₹)'} 
                         onChange={e => setFormData({...formData, price: e.target.value, rentPerDay: e.target.value})} required />
                  {activeTab === 'products' && (
                    <input type="number" placeholder="Quantity in Stock" onChange={e => setFormData({...formData, quantity: e.target.value})} required />
                  )}
                  <textarea placeholder="Description" onChange={e => setFormData({...formData, description: e.target.value})} />
                  <div className="input-group">
                    <label>Product Image:</label>
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} required />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="confirm">Submit</button>
                    <button type="button" className="cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="items-grid">
            {loading ? <p>Loading items...</p> : (
              items.map(item => (
                <div key={item._id} className={`item-card ${activeTab === 'products' && item.quantity <= 0 ? 'out-of-stock' : ''}`}>
                  <div className="img-container">
                    {item.imageUrl ? (
                      <img src={`http://localhost:8000${item.imageUrl}`} alt={item.name} />
                    ) : (
                      <div className="img-placeholder">📸 No Image</div>
                    )}
                  </div>
                  <div className="details">
                    <h3>{item.name}</h3>
                    <span className="badge">{item.category || item.type}</span>
                    <p className="price">₹{item.price || item.rentPerDay} <span>{activeTab === 'rentals' ? '/day' : ''}</span></p>
                    {activeTab === 'products' && (
                      <p className={`stock ${item.quantity <= 0 ? 'empty' : ''}`}>
                        Stock: {item.quantity > 0 ? item.quantity : 'Out of Stock'}
                      </p>
                    )}
                    <p className="desc">{item.description}</p>
                    <button 
                      onClick={() => handleBuy(item)}
                      disabled={activeTab === 'products' && item.quantity <= 0}
                    >
                      {activeTab === 'products' && item.quantity <= 0 ? 'Unavailable' : (activeTab === 'products' ? 'Buy Now' : 'Rent Now')}
                    </button>
                  </div>
                </div>
              ))
            )}
            {items.length === 0 && !loading && <p className="no-data">No items found in this category.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
