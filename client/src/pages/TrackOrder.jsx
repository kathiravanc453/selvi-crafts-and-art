import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Package, Truck, CheckCircle, Clock, MapPin, ShoppingBag } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'pending',    label: 'Order Placed',   icon: Clock },
  { key: 'confirmed', label: 'Confirmed',        icon: CheckCircle },
  { key: 'shipped',   label: 'Shipped',          icon: Truck },
  { key: 'delivered', label: 'Delivered',        icon: Package },
];

const TrackOrder = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setOrder(data);
        setLoading(false);
      })
      .catch(() => { setError('Failed to fetch order.'); setLoading(false); });
  }, [id]);

  if (!user) return (
    <div style={styles.center}>
      <p>Please <Link to="/login">login</Link> to track your order.</p>
    </div>
  );

  if (loading) return <div style={styles.center}>Loading order details...</div>;
  if (error)   return <div style={styles.center}><p style={{ color: 'red' }}>{error}</p><Link to="/">Go Home</Link></div>;

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.status);
  const activeStep = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div className="container animate-fade-in padding-mobile" style={{ padding: '40px 20px' }}>
      {/* Header */}
      <div style={styles.header}>
        <ShoppingBag size={32} color="var(--color-gold-dark)" />
        <div>
          <h1 style={styles.title}>Order #{order.id}</h1>
          <p style={styles.date}>Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Progress Tracker */}
      <div style={styles.trackerCard}>
        <h2 style={styles.cardTitle}>Tracking Status</h2>
        <div style={styles.steps}>
          {STATUS_STEPS.map((step, i) => {
            const Icon = step.icon;
            const isDone = i <= activeStep;
            const isActive = i === activeStep;
            return (
              <div key={step.key} style={styles.stepWrapper}>
                {/* Line before (except first) */}
                {i > 0 && (
                  <div style={{ ...styles.line, backgroundColor: i <= activeStep ? 'var(--color-gold-light)' : '#e0e0e0' }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    ...styles.iconCircle,
                    backgroundColor: isDone ? 'var(--color-gold-light)' : '#e0e0e0',
                    boxShadow: isActive ? '0 0 0 4px rgba(204,163,77,0.25)' : 'none'
                  }}>
                    <Icon size={20} color={isDone ? '#fff' : '#999'} />
                  </div>
                  <span style={{ ...styles.stepLabel, color: isDone ? 'var(--color-gold-dark)' : '#aaa', fontWeight: isActive ? '700' : '500' }}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.layout}>
        {/* Order Items */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Items Ordered</h2>
          {order.items.map(item => (
            <div key={item.id} style={styles.itemRow}>
              <img
                src={item.image ? `http://localhost:5000${item.image}` : '/placeholder.jpg'}
                alt={item.name}
                style={styles.itemImage}
              />
              <div style={styles.itemInfo}>
                <p style={styles.itemName}>{item.name}</p>
                <p style={styles.itemMeta}>Qty: {item.quantity} × Rs. {parseFloat(item.price).toFixed(2)}</p>
              </div>
              <p style={styles.itemTotal}>Rs. {(item.quantity * parseFloat(item.price)).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Summary & Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Price Summary */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Payment Summary</h2>
            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>Rs. {(parseFloat(order.total_amount) - parseFloat(order.shipping_fee || 0) + parseFloat(order.discount_amount || 0)).toFixed(2)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div style={{ ...styles.summaryRow, color: 'green' }}>
                <span>Discount</span>
                <span>- Rs. {parseFloat(order.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <div style={styles.summaryRow}>
              <span>Shipping</span>
              <span>Rs. {parseFloat(order.shipping_fee || 0).toFixed(2)}</span>
            </div>
            <div style={{ ...styles.summaryRow, ...styles.totalRow }}>
              <span>Grand Total</span>
              <span>Rs. {parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
            <p style={styles.paymentMethod}>Payment: <strong>{order.payment_method?.toUpperCase()}</strong></p>
          </div>

          {/* Shipping Address */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}><MapPin size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />Shipping To</h2>
            <p style={styles.addressLine}><strong>{order.shipping_name}</strong></p>
            <p style={styles.addressLine}>{order.shipping_address_line1}</p>
            {order.shipping_address_line2 && <p style={styles.addressLine}>{order.shipping_address_line2}</p>}
            <p style={styles.addressLine}>{order.shipping_city}, {order.shipping_state} - {order.shipping_zip}</p>
            <p style={styles.addressLine}>{order.shipping_phone}</p>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
};

const styles = {
  center: { padding: '80px 20px', textAlign: 'center' },
  header: {
    display: 'flex', alignItems: 'center', gap: '16px',
    marginBottom: '30px'
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.8rem',
    color: 'var(--color-gold-dark)',
    margin: 0
  },
  date: { color: '#888', fontSize: '0.9rem', margin: '4px 0 0' },
  trackerCard: {
    backgroundColor: 'var(--color-off-white)',
    borderRadius: '16px',
    padding: '30px 20px',
    marginBottom: '30px'
  },
  cardTitle: {
    fontFamily: 'var(--font-sans)',
    fontWeight: '700',
    fontSize: '1.1rem',
    marginBottom: '20px',
    color: '#333'
  },
  steps: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '0',
    position: 'relative'
  },
  stepWrapper: {
    display: 'flex',
    alignItems: 'center',
    flex: 1
  },
  line: {
    flex: 1,
    height: '3px',
    borderRadius: '2px',
    marginBottom: '28px'
  },
  iconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  },
  stepLabel: {
    fontSize: '0.78rem',
    textAlign: 'center',
    maxWidth: '70px'
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #f0f0f0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 0',
    borderBottom: '1px solid #f5f5f5'
  },
  itemImage: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px',
    flexShrink: 0
  },
  itemInfo: { flex: 1 },
  itemName: { fontWeight: '600', fontSize: '0.95rem', color: '#333', margin: 0 },
  itemMeta: { fontSize: '0.82rem', color: '#888', margin: '4px 0 0' },
  itemTotal: { fontWeight: '700', color: 'var(--color-gold-dark)', fontSize: '0.95rem', flexShrink: 0 },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: '0.9rem',
    color: '#555',
    borderBottom: '1px solid #f5f5f5'
  },
  totalRow: {
    fontWeight: '700',
    fontSize: '1.1rem',
    color: 'var(--color-gold-dark)',
    border: 'none',
    paddingTop: '14px'
  },
  paymentMethod: {
    marginTop: '12px',
    fontSize: '0.85rem',
    color: '#888'
  },
  addressLine: {
    fontSize: '0.9rem',
    color: '#555',
    margin: '4px 0'
  }
};

export default TrackOrder;
