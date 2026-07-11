import React, { useState, useEffect } from 'react';
import { Package, Users, Tag, Image as ImageIcon, Box, LayoutDashboard, ShoppingCart, ChevronDown, ChevronUp, MapPin, Phone, Mail, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminProducts from './AdminProducts';

const STATUS_COLORS = {
  pending:    { bg: '#fff7e6', color: '#d48806', border: '#ffd591' },
  confirmed:  { bg: '#e6f7ff', color: '#1677ff', border: '#91d5ff' },
  processing: { bg: '#f9f0ff', color: '#722ed1', border: '#d3adf7' },
  shipped:    { bg: '#f0f5ff', color: '#2f54eb', border: '#adc6ff' },
  delivered:  { bg: '#f6ffed', color: '#389e0d', border: '#b7eb8f' },
  cancelled:  { bg: '#fff1f0', color: '#cf1322', border: '#ffa39e' },
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = () => {
    const token = localStorage.getItem('token');
    fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  const fetchOrderItems = async (orderId) => {
    if (orderItems[orderId]) return; // already loaded
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setOrderItems(prev => ({ ...prev, [orderId]: data.items || [] }));
    } catch (e) { console.error(e); }
  };

  const toggleExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderItems(orderId);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Order #${orderId} marked as ${newStatus}!`);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div className="flex-col-mobile" style={styles.page}>
      <aside className="admin-sidebar-mobile" style={styles.sidebar}>
        <div style={styles.logo}>Selvi's arts & craft Admin</div>
        <ul style={styles.navList}>
          <li style={{ ...styles.navItem, ...(activeTab === 'dashboard' ? styles.navItemActive : {}) }} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={18} /> Dashboard
          </li>
          <li style={{ ...styles.navItem, ...(activeTab === 'orders' ? styles.navItemActive : {}) }} onClick={() => setActiveTab('orders')}>
            <ShoppingCart size={18} /> Orders
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <span style={styles.pendingBadge}>{orders.filter(o => o.status === 'pending').length}</span>
            )}
          </li>
          <li style={{ ...styles.navItem, ...(activeTab === 'products' ? styles.navItemActive : {}) }} onClick={() => setActiveTab('products')}>
            <Package size={18} /> Manage Products
          </li>
          <li style={{ ...styles.navItem, ...(activeTab === 'categories' ? styles.navItemActive : {}) }} onClick={() => setActiveTab('categories')}>
            <Box size={18} /> Categories
          </li>
          <li style={{ ...styles.navItem, ...(activeTab === 'offers' ? styles.navItemActive : {}) }} onClick={() => setActiveTab('offers')}>
            <Tag size={18} /> Offers & Coupons
          </li>
          <li style={{ ...styles.navItem, ...(activeTab === 'banners' ? styles.navItemActive : {}) }} onClick={() => setActiveTab('banners')}>
            <ImageIcon size={18} /> Homepage Banners
          </li>
          <li style={{ ...styles.navItem, ...(activeTab === 'customers' ? styles.navItemActive : {}) }} onClick={() => setActiveTab('customers')}>
            <Users size={18} /> Customers
          </li>
        </ul>
      </aside>

      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-gold-dark)' }}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
          </h1>
        </div>

        <div style={styles.content}>
          {activeTab === 'products' && (
            <AdminProducts />
          )}

          {activeTab === 'orders' && (
            <div>
              {/* Stats row */}
              <div style={styles.statsRow}>
                {['all','pending','confirmed','shipped','delivered','cancelled'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    style={{
                      ...styles.statBtn,
                      backgroundColor: filterStatus === s ? 'var(--color-gold-light)' : '#fff',
                      color: filterStatus === s ? '#fff' : '#555',
                      fontWeight: filterStatus === s ? '700' : '500'
                    }}
                  >
                    {s === 'all' ? `All (${orders.length})` : `${s.charAt(0).toUpperCase()+s.slice(1)} (${orders.filter(o=>o.status===s).length})`}
                  </button>
                ))}
              </div>

              {/* Orders List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredOrders.length === 0 ? (
                  <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px' }}>
                    <ShoppingCart size={40} color="#ddd" />
                    <p style={{ color: '#aaa', marginTop: 12 }}>No orders found.</p>
                  </div>
                ) : filteredOrders.map(o => {
                  const st = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
                  const isOpen = expandedOrder === o.id;
                  return (
                    <div key={o.id} style={styles.orderCard}>
                      {/* Order Header Row */}
                      <div style={styles.orderHeader} onClick={() => toggleExpand(o.id)}>
                        <div style={styles.orderHeaderLeft}>
                          <span style={styles.orderId}>#{o.id}</span>
                          <div>
                            <p style={styles.customerName}>{o.shipping_name}</p>
                            <p style={styles.orderMeta}>
                              {new Date(o.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div style={styles.orderHeaderRight}>
                          <span style={styles.orderAmount}>Rs. {parseFloat(o.total_amount).toFixed(2)}</span>
                          <span style={{ ...styles.statusChip, backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                            {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                          </span>
                          <select
                            value={o.status}
                            onChange={(e) => { e.stopPropagation(); handleStatusChange(o.id, e.target.value); }}
                            onClick={e => e.stopPropagation()}
                            style={styles.statusSelect}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {isOpen ? <ChevronUp size={18} color="#aaa" /> : <ChevronDown size={18} color="#aaa" />}
                        </div>
                      </div>

                      {/* Expanded Detail Panel */}
                      {isOpen && (
                        <div style={styles.expandedPanel}>
                          <div style={styles.detailGrid}>
                            {/* Customer Info */}
                            <div style={styles.detailBox}>
                              <h4 style={styles.detailTitle}><Users size={15} style={{marginRight:6}}/>Customer Info</h4>
                              <p style={styles.detailRow}><Mail size={13} style={{marginRight:6}} />{o.shipping_email}</p>
                              <p style={styles.detailRow}><Phone size={13} style={{marginRight:6}} />{o.shipping_phone}</p>
                              <p style={styles.detailRow}><CreditCard size={13} style={{marginRight:6}} />{o.payment_method?.toUpperCase()}</p>
                            </div>

                            {/* Shipping Address */}
                            <div style={styles.detailBox}>
                              <h4 style={styles.detailTitle}><MapPin size={15} style={{marginRight:6}}/>Shipping Address</h4>
                              <p style={styles.detailRow}>{o.shipping_address_line1}</p>
                              {o.shipping_address_line2 && <p style={styles.detailRow}>{o.shipping_address_line2}</p>}
                              <p style={styles.detailRow}>{o.shipping_city}, {o.shipping_state} - {o.shipping_zip}</p>
                            </div>

                            {/* Price Summary */}
                            <div style={styles.detailBox}>
                              <h4 style={styles.detailTitle}>💰 Price Summary</h4>
                              <div style={styles.priceRow}><span>Subtotal</span><span>Rs. {(parseFloat(o.total_amount) - parseFloat(o.shipping_fee||0) + parseFloat(o.discount_amount||0)).toFixed(2)}</span></div>
                              {o.discount_amount > 0 && <div style={{ ...styles.priceRow, color:'green' }}><span>Discount</span><span>-Rs. {parseFloat(o.discount_amount).toFixed(2)}</span></div>}
                              <div style={styles.priceRow}><span>Shipping</span><span>Rs. {parseFloat(o.shipping_fee||0).toFixed(2)}</span></div>
                              <div style={{ ...styles.priceRow, fontWeight:'700', color:'var(--color-gold-dark)', borderTop:'1px solid #eee', paddingTop:8, marginTop:4 }}><span>Total</span><span>Rs. {parseFloat(o.total_amount).toFixed(2)}</span></div>
                            </div>
                          </div>

                          {/* Items Ordered */}
                          <div style={{ marginTop: 20 }}>
                            <h4 style={styles.detailTitle}><Package size={15} style={{marginRight:6}}/>Items Ordered</h4>
                            {orderItems[o.id] ? (
                              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                                {orderItems[o.id].map(item => (
                                  <div key={item.id} style={styles.itemRow}>
                                    <img
                                      src={item.image ? `http://localhost:5000${item.image}` : ''}
                                      alt={item.name}
                                      style={styles.itemImg}
                                    />
                                    <div style={{ flex:1 }}>
                                      <p style={{ fontWeight:'600', margin:0 }}>{item.name}</p>
                                      <p style={{ color:'#888', fontSize:'0.82rem', margin:'2px 0 0' }}>Qty: {item.quantity}</p>
                                    </div>
                                    <p style={{ fontWeight:'700', color:'var(--color-gold-dark)' }}>Rs. {(item.quantity * parseFloat(item.price)).toFixed(2)}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ color:'#aaa', fontSize:'0.85rem' }}>Loading items...</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab !== 'products' && activeTab !== 'orders' && (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)' }}>
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h2>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '10px' }}>
                This section allows full CRUD operations on {activeTab} that instantly reflect on the storefront via the SQLite database.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--color-off-white)'
  },
  sidebar: {
    width: '250px',
    backgroundColor: 'var(--color-white)',
    borderRight: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column'
  },
  logo: {
    padding: '20px',
    fontFamily: 'var(--font-serif)',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: 'var(--color-gold-dark)',
    borderBottom: '1px solid #eee'
  },
  navList: {
    listStyle: 'none',
    padding: '20px 0'
  },
  navItem: {
    padding: '15px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    color: 'var(--color-text-muted)',
    transition: 'background var(--transition-fast)'
  },
  navItemActive: {
    backgroundColor: 'var(--color-pink-light)',
    color: 'var(--color-gold-dark)',
    fontWeight: '500',
    borderRight: '3px solid var(--color-gold-dark)'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    padding: '20px 40px',
    backgroundColor: 'var(--color-white)',
    borderBottom: '1px solid #eee'
  },
  content: {
    padding: '40px',
    flex: 1
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'var(--color-white)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)'
  },
  th: {
    textAlign: 'left',
    padding: '15px',
    backgroundColor: 'var(--color-cream)',
    color: 'var(--color-text-main)',
    fontWeight: '600'
  },
  td: {
    padding: '15px',
    borderBottom: '1px solid #eee',
    verticalAlign: 'middle'
  },
  tr: {
    transition: 'background var(--transition-fast)'
  },
  pendingBadge: {
    marginLeft: 'auto',
    backgroundColor: '#ff4d4f',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '2px 7px'
  },
  statsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px'
  },
  statBtn: {
    padding: '8px 14px',
    borderRadius: '20px',
    border: '1px solid #eee',
    cursor: 'pointer',
    fontSize: '0.82rem',
    transition: 'all 0.2s'
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: '14px',
    border: '1px solid #f0f0f0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    overflow: 'hidden'
  },
  orderHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 20px',
    cursor: 'pointer',
    gap: '12px',
    flexWrap: 'wrap'
  },
  orderHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  orderHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  orderId: {
    fontWeight: '800',
    fontSize: '1.1rem',
    color: 'var(--color-gold-dark)',
    minWidth: '40px'
  },
  customerName: {
    fontWeight: '600',
    margin: 0,
    fontSize: '0.95rem',
    color: '#333'
  },
  orderMeta: {
    fontSize: '0.78rem',
    color: '#aaa',
    margin: '2px 0 0'
  },
  orderAmount: {
    fontWeight: '700',
    fontSize: '1rem',
    color: '#333'
  },
  statusChip: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.78rem',
    fontWeight: '600'
  },
  statusSelect: {
    padding: '6px 10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '0.85rem',
    cursor: 'pointer',
    backgroundColor: '#fafafa'
  },
  expandedPanel: {
    padding: '20px 24px',
    borderTop: '1px solid #f5f5f5',
    backgroundColor: '#fafafa'
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px'
  },
  detailBox: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid #eee'
  },
  detailTitle: {
    fontWeight: '700',
    fontSize: '0.88rem',
    color: '#444',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center'
  },
  detailRow: {
    fontSize: '0.85rem',
    color: '#666',
    margin: '4px 0',
    display: 'flex',
    alignItems: 'center'
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#555',
    padding: '4px 0'
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #f0f0f0'
  },
  itemImg: {
    width: '52px',
    height: '52px',
    objectFit: 'cover',
    borderRadius: '8px',
    flexShrink: 0
  }
};

export default AdminDashboard;
