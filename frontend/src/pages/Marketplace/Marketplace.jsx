import React, { useState, useEffect } from 'react';
import './Marketplace.scss';
import Sidebar from '../../components/sidebar/Sidebar.jsx';
import Navbar from '../../components/navbar/Navbar';
import newRequest from '../../utils/newRequest.js';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import EngineeringIcon from '@mui/icons-material/Engineering';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';

const Marketplace = ({ setUserRole }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [mySales, setMySales] = useState({ products: [], equipments: [] });
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(null); // stores the item being edited
  const [checkoutData, setCheckoutModalData] = useState({
    name: '', phone: '', address: '', city: '', pincode: ''
  });

  // Form States
  const [formData, setFormData] = useState({
    name: '', category: '', price: '', description: '', type: '', rentPerDay: '', quantity: 1
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchOrders();
    } else if (activeTab === 'my-listings') {
      fetchMySales();
    } else {
      fetchData();
    }
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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await newRequest.get('/api/market/orders/history');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySales = async () => {
    setLoading(true);
    try {
      const res = await newRequest.get('/api/market/sales/history');
      setMySales(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyClick = (item) => {
    if (activeTab === 'products' && item.quantity <= 0) {
      alert("This item is currently out of stock!");
      return;
    }
    setSelectedItem(item);
    setShowCheckoutModal(true);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!window.Razorpay) {
      alert("Razorpay SDK not found. Please refresh the page.");
      return;
    }

    try {
      const res = await newRequest.post('/api/market/payments/order', {
        amount: activeTab === 'products' ? selectedItem.price : selectedItem.rentPerDay,
        itemId: selectedItem._id,
        type: activeTab === 'products' ? 'Purchase' : 'Rental',
        quantity: 1,
        shippingAddress: checkoutData
      });

      const keyRes = await newRequest.get('/api/market/payments/get-key');
      const RAZORPAY_KEY = keyRes.data.key;

      const options = {
        key: RAZORPAY_KEY, 
        amount: res.data.amount,
        currency: "INR",
        name: "Agri-One Marketplace",
        description: `Payment for ${selectedItem.name}`,
        order_id: res.data.id,
        handler: async (response) => {
          try {
            await newRequest.post('/api/market/payments/verify', response);
            alert("✅ Payment Successful! Order Placed.");
            setShowCheckoutModal(false);
            fetchData();
          } catch (err) {
            alert("❌ Payment Verification Failed!");
          }
        },
        prefill: {
          name: checkoutData.name,
          contact: checkoutData.phone,
          method: "netbanking"
        },
        theme: { color: "#2d6a4f" }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Checkout failed: " + (err.response?.data?.error || err.message));
    }
  };

  const handleEditClick = (item, type) => {
    setIsEditing({ ...item, listingType: type });
    setFormData({
      name: item.name,
      category: item.category || item.type,
      price: item.price || item.rentPerDay,
      description: item.description,
      quantity: item.quantity || 1,
      availability: item.availability
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (imageFile) data.append('image', imageFile);

      if (isEditing) {
        const endpoint = isEditing.listingType === 'product' 
          ? `/api/market/products/update/${isEditing._id}` 
          : `/api/market/equipments/update/${isEditing._id}`;
        
        // Use regular object for update if no image, or handle FormData if image
        const updateData = imageFile ? data : formData;
        await newRequest.put(endpoint, updateData);
        alert("Listing updated!");
      } else {
        const endpoint = activeTab === 'products' ? '/api/market/products/add' : '/api/market/equipments/add';
        await newRequest.post(endpoint, data);
        alert("Item listed successfully!");
      }
      
      setShowAddModal(false);
      setIsEditing(null);
      fetchData();
      if (activeTab === 'my-listings') fetchMySales();
    } catch (err) {
      alert("Action failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
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
              <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
                <HistoryIcon /> Order History
              </button>
              <button className={activeTab === 'my-listings' ? 'active' : ''} onClick={() => setActiveTab('my-listings')}>
                <AddIcon /> My Listings
              </button>
            </div>
            {activeTab !== 'history' && activeTab !== 'my-listings' && (
              <button className="add-btn" onClick={() => setShowAddModal(true)}>
                <AddIcon /> List New Item
              </button>
            )}
          </div>

          {showAddModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>{isEditing ? `Edit ${isEditing.name}` : (activeTab === 'products' ? 'Sell Product' : 'Rent Equipment')}</h2>
                <form onSubmit={handleSubmit}>
                  <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  <input type="text" placeholder="Category/Type" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value, type: e.target.value})} required />
                  <input type="number" placeholder={activeTab === 'products' || (isEditing?.listingType === 'product') ? 'Price (₹)' : 'Rent per Day (₹)'} 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value, rentPerDay: e.target.value})} required />
                  
                  {(activeTab === 'products' || isEditing?.listingType === 'product') && (
                    <input type="number" placeholder="Quantity" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required />
                  )}

                  <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
                  
                  <div className="modal-actions">
                    <button type="submit" className="confirm">{isEditing ? 'Update' : 'Submit'}</button>
                    <button type="button" className="cancel" onClick={() => { setShowAddModal(false); setIsEditing(null); }}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showCheckoutModal && (
            <div className="modal-overlay">
              <div className="modal checkout-modal">
                <h2>Shipping & Delivery Details</h2>
                <p className="item-summary">Buying: <strong>{selectedItem?.name}</strong> (₹{selectedItem?.price || selectedItem?.rentPerDay})</p>
                <form onSubmit={handleCheckoutSubmit}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="Recipient Name" onChange={e => setCheckoutModalData({...checkoutData, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" placeholder="10-digit mobile" onChange={e => setCheckoutModalData({...checkoutData, phone: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Full Address</label>
                    <textarea placeholder="House No, Street, Landmark" onChange={e => setCheckoutModalData({...checkoutData, address: e.target.value})} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input type="text" placeholder="City/Village" onChange={e => setCheckoutModalData({...checkoutData, city: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Pincode</label>
                      <input type="text" placeholder="6-digit code" onChange={e => setCheckoutModalData({...checkoutData, pincode: e.target.value})} required />
                    </div>
                  </div>
                  
                  <div className="modal-actions">
                    <button type="submit" className="confirm">Pay Now (Razorpay)</button>
                    <button type="button" className="cancel" onClick={() => setShowCheckoutModal(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="items-grid">
            {loading ? <p>Loading...</p> : activeTab === 'history' ? (
              <div className="order-history-list">
                <h2>My Order History</h2>
                {orders.length > 0 ? (
                  <div className="history-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Type</th>
                          <th>Price Paid</th>
                          <th>Date of Purchase</th>
                          <th>Payment Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td className="item-name">{order.productId?.name || order.equipmentId?.name || "Deleted Item"}</td>
                            <td><span className={`type-badge ${order.type.toLowerCase()}`}>{order.type}</span></td>
                            <td className="price-val">₹{order.amount}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                            <td><span className="status-success">✓ Paid</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-data">
                    <p>You haven't made any purchases yet.</p>
                  </div>
                )}
              </div>
            ) : activeTab === 'my-listings' ? (
              <div className="order-history-list">
                <h2>My Items for Sale/Rent</h2>
                {(mySales.products.length > 0 || mySales.equipments.length > 0) ? (
                  <div className="history-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Category/Type</th>
                          <th>Price/Rent</th>
                          <th>Stock/Status</th>
                          <th>Listed On</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mySales.products.map((prod) => (
                          <tr key={prod._id}>
                            <td className="item-name">{prod.name}</td>
                            <td><span className="type-badge purchase">Product</span></td>
                            <td className="price-val">₹{prod.price}</td>
                            <td>{prod.quantity} in stock</td>
                            <td>{new Date(prod.createdAt).toLocaleDateString()}</td>
                            <td>
                              <button className="edit-mini-btn" onClick={() => handleEditClick(prod, 'product')}>Edit</button>
                            </td>
                          </tr>
                        ))}
                        {mySales.equipments.map((eq) => (
                          <tr key={eq._id}>
                            <td className="item-name">{eq.name}</td>
                            <td><span className="type-badge rental">Equipment</span></td>
                            <td className="price-val">₹{eq.rentPerDay}/day</td>
                            <td>{eq.availability ? "Available" : "Busy"}</td>
                            <td>{new Date(eq.createdAt).toLocaleDateString()}</td>
                            <td>
                              <button className="edit-mini-btn" onClick={() => handleEditClick(eq, 'equipment')}>Edit</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-data">
                    <p>You haven't listed any items yet.</p>
                  </div>
                )}
              </div>
            ) : (
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
                      onClick={() => handleBuyClick(item)}
                      disabled={activeTab === 'products' && item.quantity <= 0}
                    >
                      {activeTab === 'products' && item.quantity <= 0 ? 'Unavailable' : (activeTab === 'products' ? 'Buy Now' : 'Rent Now')}
                    </button>
                  </div>
                </div>
              ))
            )}
            {activeTab !== 'history' && items.length === 0 && !loading && <p className="no-data">No items found in this category.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
