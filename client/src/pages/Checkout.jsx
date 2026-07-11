import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import toast from 'react-hot-toast';
import { SmartphoneNfc, CreditCard, Banknote } from 'lucide-react';

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
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('upi');

  const handleChange = (e) => setShippingDetails({ ...shippingDetails, [e.target.name]: e.target.value });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error('Cart is empty!');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders', {
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

            <h3 style={{ ...styles.sectionTitle, marginTop: '40px' }}>Payment Method</h3>
            <div style={styles.paymentMethods}>
              <label style={styles.radioLabel}>
                <input type="radio" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                <SmartphoneNfc size={24} color="#0056b3" />
                <span style={{fontWeight: '500'}}>UPI Payment</span>
              </label>
              <label style={styles.radioLabel}>
                <input type="radio" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                <CreditCard size={24} color="#ff4d4f" />
                <span style={{fontWeight: '500'}}>Credit/Debit Card</span>
              </label>
              <label style={styles.radioLabel}>
                <input type="radio" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <Banknote size={24} color="#52c41a" />
                <span style={{fontWeight: '500'}}>Cash on Delivery</span>
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
    gap: '15px'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '15px',
    border: '1px solid #eee',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer'
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
