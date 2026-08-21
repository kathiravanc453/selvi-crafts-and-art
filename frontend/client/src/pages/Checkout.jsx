import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import toast from 'react-hot-toast';
import { SmartphoneNfc, CreditCard, Banknote, ShieldCheck, Truck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { cartItems, fetchCart, subtotal: contextSubtotal } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  const stateData = location.state || {};
  const subtotal = stateData.subtotal !== undefined ? stateData.subtotal : contextSubtotal;
  const shipping = stateData.shipping !== undefined ? stateData.shipping : (subtotal > 0 ? (subtotal > 50 ? 0 : 5.99) : 0);
  const discount = stateData.discount !== undefined ? stateData.discount : 0;
  const couponCode = stateData.couponCode !== undefined ? stateData.couponCode : '';
  const grandTotal = stateData.grandTotal !== undefined ? stateData.grandTotal : (subtotal + shipping - discount);

  const [shippingDetails, setShippingDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address1: user?.address_line1 || '',
    address2: user?.address_line2 || '',
    city: user?.city || '',
    state: user?.state || '',
    zip: user?.zip || ''
  });

  const [paymentMethod, setPaymentMethod] = useState('upi');

  const handleChange = (e) => setShippingDetails({ ...shippingDetails, [e.target.name]: e.target.value });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error('Cart is empty!');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          total_amount: grandTotal,
          shipping_fee: shipping,
          discount_amount: discount,
          coupon_code: couponCode,
          payment_method: paymentMethod,
          shippingDetails,
          items: cartItems.map(item => ({
            id: item.product_id,
            quantity: item.quantity,
            price: item.offer_price || item.price
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Order placed successfully! 🎉');
        fetchCart();
        navigate(`/orders/${data.order_id}`);
      } else {
        const err = await res.json();
        toast.error('Failed to place order: ' + err.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while placing order.');
    }
  };

  if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Please login first.</div>;
  if (grandTotal === 0) return <div style={{ padding: '40px', textAlign: 'center' }}>Your cart is empty or invalid checkout access.</div>;

  return (
    <div className="container animate-fade-in padding-mobile" style={{ padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-gold-dark)', marginBottom: '30px' }}>Checkout</h1>
      
      <div className="flex-col-mobile" style={styles.layout}>
        <div style={styles.formSection}>
          <form onSubmit={handlePlaceOrder} id="checkout-form">
            <h3 style={styles.sectionTitle}>Shipping Details</h3>
            <div style={styles.inputGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input type="text" name="name" value={shippingDetails.name} onChange={handleChange} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input type="email" name="email" value={shippingDetails.email} onChange={handleChange} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number</label>
                <input type="text" name="phone" value={shippingDetails.phone} onChange={handleChange} required />
              </div>
            </div>

            <div style={{ ...styles.inputGroup, marginTop: '20px' }}>
              <label style={styles.label}>Address Line 1</label>
              <input type="text" name="address1" value={shippingDetails.address1} onChange={handleChange} required />
            </div>
            <div style={{ ...styles.inputGroup, marginTop: '15px' }}>
              <label style={styles.label}>Address Line 2 (Optional)</label>
              <input type="text" name="address2" value={shippingDetails.address2} onChange={handleChange} />
            </div>

            <div style={{ ...styles.inputGrid, marginTop: '20px' }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>City</label>
                <input type="text" name="city" value={shippingDetails.city} onChange={handleChange} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>State</label>
                <input type="text" name="state" value={shippingDetails.state} onChange={handleChange} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Zip Code</label>
                <input type="text" name="zip" value={shippingDetails.zip} onChange={handleChange} required />
              </div>
            </div>

            {/* PAYMENT METHOD SECTION WITH LOGOS */}
            <h3 style={{ ...styles.sectionTitle, marginTop: '40px' }}>Payment Method</h3>
            <div style={styles.paymentMethods}>
              
              {/* 1. UPI PAYMENT OPTION */}
              <label style={{
                ...styles.radioCard,
                borderColor: paymentMethod === 'upi' ? '#cca34d' : '#e5e5e5',
                backgroundColor: paymentMethod === 'upi' ? '#fffdf5' : '#fff',
                boxShadow: paymentMethod === 'upi' ? '0 4px 14px rgba(204,163,77,0.15)' : 'none'
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  style={styles.radioInput}
                />
                <div style={styles.cardMain}>
                  <div style={styles.cardHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <SmartphoneNfc size={22} color="#5f259f" />
                      <span style={styles.methodTitle}>UPI Instant Payment</span>
                      <span style={styles.instantBadge}>FASTEST</span>
                    </div>
                    {/* Brand Logos */}
                    <div style={styles.logoGroup}>
                      {/* GPay Logo */}
                      <span style={{ ...styles.brandPill, background: '#fff', border: '1px solid #e0e0e0', color: '#4285F4', fontWeight: 'bold' }}>
                        G<span style={{ color: '#EA4335' }}>P</span><span style={{ color: '#FBBC05' }}>a</span><span style={{ color: '#34A853' }}>y</span>
                      </span>
                      {/* PhonePe Logo */}
                      <span style={{ ...styles.brandPill, background: '#5f259f', color: '#fff', fontWeight: 'bold' }}>
                        PhonePe
                      </span>
                      {/* Paytm Logo */}
                      <span style={{ ...styles.brandPill, background: '#002e6e', color: '#00baf2', fontWeight: 'bold' }}>
                        Paytm
                      </span>
                      {/* BHIM UPI */}
                      <span style={{ ...styles.brandPill, background: '#ff6600', color: '#fff', fontWeight: 'bold' }}>
                        UPI
                      </span>
                    </div>
                  </div>
                  <p style={styles.methodDesc}>
                    Pay instantly via Google Pay, PhonePe, Paytm, BHIM or any UPI QR app.
                  </p>
                </div>
              </label>

              {/* 2. CREDIT/DEBIT CARD OPTION */}
              <label style={{
                ...styles.radioCard,
                borderColor: paymentMethod === 'card' ? '#cca34d' : '#e5e5e5',
                backgroundColor: paymentMethod === 'card' ? '#fffdf5' : '#fff',
                boxShadow: paymentMethod === 'card' ? '0 4px 14px rgba(204,163,77,0.15)' : 'none'
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  style={styles.radioInput}
                />
                <div style={styles.cardMain}>
                  <div style={styles.cardHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CreditCard size={22} color="#1a1f71" />
                      <span style={styles.methodTitle}>Credit / Debit Card</span>
                    </div>
                    {/* Brand Logos */}
                    <div style={styles.logoGroup}>
                      {/* VISA Logo */}
                      <span style={{ ...styles.brandPill, background: '#1a1f71', color: '#f7b600', fontWeight: 'bold', fontStyle: 'italic' }}>
                        VISA
                      </span>
                      {/* MasterCard Logo */}
                      <div style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: 4, background: '#222' }}>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#eb001b', display: 'inline-block' }}></span>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f79e1b', display: 'inline-block', marginLeft: -5 }}></span>
                        <span style={{ color: '#fff', fontSize: '0.68rem', fontWeight: 700, marginLeft: 4 }}>Mastercard</span>
                      </div>
                      {/* RuPay Logo */}
                      <span style={{ ...styles.brandPill, background: '#0066b2', color: '#88c540', fontWeight: 'bold' }}>
                        RuPay
                      </span>
                    </div>
                  </div>
                  <p style={styles.methodDesc}>
                    Supports Visa, Mastercard, RuPay, Maestro & International Cards.
                  </p>
                </div>
              </label>

              {/* 3. CASH ON DELIVERY (COD) OPTION */}
              <label style={{
                ...styles.radioCard,
                borderColor: paymentMethod === 'cod' ? '#cca34d' : '#e5e5e5',
                backgroundColor: paymentMethod === 'cod' ? '#fffdf5' : '#fff',
                boxShadow: paymentMethod === 'cod' ? '0 4px 14px rgba(204,163,77,0.15)' : 'none'
              }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  style={styles.radioInput}
                />
                <div style={styles.cardMain}>
                  <div style={styles.cardHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Banknote size={22} color="#2e7d32" />
                      <span style={styles.methodTitle}>Cash on Delivery</span>
                    </div>
                    {/* Badge */}
                    <div style={styles.logoGroup}>
                      <span style={{ ...styles.brandPill, background: '#e8f5e9', color: '#2e7d32', fontWeight: 700, border: '1px solid #a5d6a7' }}>
                        <Truck size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        PAY AT DOORSTEP
                      </span>
                    </div>
                  </div>
                  <p style={styles.methodDesc}>
                    Pay cash or UPI directly to delivery agent upon receiving order.
                  </p>
                </div>
              </label>

            </div>
          </form>
        </div>

        <div style={styles.summarySection}>
          <div style={styles.summaryBox}>
            <h3 style={{ marginBottom: '20px', fontFamily: 'var(--font-sans)', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Order Details</h3>
            
            <div style={{ marginBottom: '20px', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
              {cartItems.map(item => (
                <div key={item.cart_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                  <span>{item.quantity} x {item.name}</span>
                  <span>Rs. {((item.offer_price || item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Shipping</span>
              <span>Rs. {shipping.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ ...styles.summaryRow, color: 'green' }}>
                <span>Discount</span>
                <span>-Rs. {discount.toFixed(2)}</span>
              </div>
            )}
            
            <div style={styles.grandTotal}>
              <span>Grand Total</span>
              <span>Rs. {grandTotal.toFixed(2)}</span>
            </div>

            <button 
              type="submit" 
              form="checkout-form"
              className="btn-primary" 
              style={{ width: '100%', padding: '15px' }}
            >
              Place Order
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 15, color: '#666', fontSize: '0.8rem' }}>
              <ShieldCheck size={16} color="#cca34d" /> 100% Safe & Encrypted Payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  layout: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '40px',
    alignItems: 'flex-start'
  },
  formSection: {
    flex: '2 1 500px',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    marginBottom: '20px',
    color: 'var(--color-gold-dark)'
  },
  inputGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '0.9rem',
    color: 'var(--color-text-main)',
    fontWeight: '500'
  },
  paymentMethods: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  radioCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '16px 20px',
    border: '2px solid #e5e5e5',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out'
  },
  radioInput: {
    accentColor: '#cca34d',
    width: '18px',
    height: '18px',
    marginTop: '3px',
    cursor: 'pointer'
  },
  cardMain: {
    flex: 1
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '4px'
  },
  methodTitle: {
    fontWeight: '700',
    fontSize: '1rem',
    color: '#111'
  },
  instantBadge: {
    background: '#fff0f6',
    color: '#eb2f96',
    fontSize: '0.68rem',
    fontWeight: 800,
    padding: '2px 6px',
    borderRadius: 4,
    border: '1px solid #ffadd2'
  },
  methodDesc: {
    margin: 0,
    fontSize: '0.82rem',
    color: '#666',
    lineHeight: '1.4'
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap'
  },
  brandPill: {
    fontSize: '0.7rem',
    padding: '3px 8px',
    borderRadius: '4px',
    letterSpacing: '0.3px',
    display: 'inline-flex',
    alignItems: 'center'
  },
  summarySection: {
    flex: '1 1 350px'
  },
  summaryBox: {
    backgroundColor: 'var(--color-cream)',
    padding: '20px',
    borderRadius: 'var(--radius-lg)'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
    color: 'var(--color-text-main)'
  },
  grandTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '2px solid #eaeaea',
    fontSize: '1.4rem',
    fontWeight: '600',
    color: 'var(--color-gold-dark)',
    marginBottom: '25px'
  }
};

export default Checkout;
