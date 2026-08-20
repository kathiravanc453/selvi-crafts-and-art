import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';

const STATUS_COLORS = {
  pending:   { bg: '#fff7e6', color: '#d48806' },
  confirmed: { bg: '#e6f7ff', color: '#1677ff' },
  shipped:   { bg: '#f0f5ff', color: '#2f54eb' },
  delivered: { bg: '#f6ffed', color: '#52c41a' },
  cancelled: { bg: '#fff1f0', color: '#ff4d4f' },
};

const MyOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/my-orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (!user) return (
    <div style={styles.center}>
      <Package size={48} color="#cca34d" />
      <p style={{ marginTop: 16, color: '#888' }}>Please <Link to="/login" style={{ color: 'var(--color-gold-dark)' }}>login</Link> to view your orders.</p>
    </div>
  );

  if (loading) return <div style={styles.center}><p>Loading your orders...</p></div>;

  if (orders.length === 0) return (
    <div style={styles.center}>
      <ShoppingBag size={64} color="#ddd" />
      <h2 style={{ marginTop: 16, color: '#aaa' }}>No orders yet</h2>
      <p style={{ color: '#bbb', marginBottom: 20 }}>You haven't placed any orders yet.</p>
      <Link to="/shop" className="btn-primary">Start Shopping</Link>
    </div>
  );

  return (
    <div className="container animate-fade-in padding-mobile" style={{ padding: '40px 20px' }}>
      <h1 style={styles.title}>My Orders</h1>
      <p style={styles.subtitle}>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>

      <div style={styles.list}>
        {orders.map(order => {
          const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
          return (
            <Link to={`/orders/${order.id}`} key={order.id} style={styles.card}>
              <div style={styles.cardLeft}>
                <div style={styles.orderIconBox}>
                  <Package size={22} color="var(--color-gold-dark)" />
                </div>
                <div>
                  <p style={styles.orderId}>Order #{order.id}</p>
                  <p style={styles.orderDate}>
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p style={styles.orderMeta}>
                    {order.payment_method?.toUpperCase()} · Rs. {parseFloat(order.total_amount).toFixed(2)}
                  </p>
                </div>
              </div>
              <div style={styles.cardRight}>
                <span style={{ ...styles.statusBadge, backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                  {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                </span>
                <ChevronRight size={18} color="#ccc" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  center: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '80px 20px', textAlign: 'center'
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    color: 'var(--color-gold-dark)',
    marginBottom: '4px'
  },
  subtitle: {
    color: '#999',
    fontSize: '0.9rem',
    marginBottom: '30px'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    border: '1px solid #f0f0f0',
    borderRadius: '14px',
    padding: '18px 20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    textDecoration: 'none',
    transition: 'box-shadow 0.2s, transform 0.2s',
    cursor: 'pointer'
  },
  cardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  orderIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'var(--color-cream)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  orderId: {
    fontWeight: '700',
    fontSize: '0.95rem',
    color: '#333',
    margin: 0
  },
  orderDate: {
    fontSize: '0.82rem',
    color: '#999',
    margin: '2px 0'
  },
  orderMeta: {
    fontSize: '0.85rem',
    color: '#666',
    margin: 0
  },
  cardRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.78rem',
    fontWeight: '600',
    letterSpacing: '0.3px'
  }
};

export default MyOrders;
