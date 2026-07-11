import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, subtotal } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'WELCOME10') {
      setDiscount(subtotal * 0.1);
      toast.success('Coupon applied! 10% off.');
    } else if (couponCode.toUpperCase() === 'CRAFTGOLD' && subtotal >= 100) {
      setDiscount(15);
      toast.success('Coupon applied! Rs. 15 off.');
    } else {
      setDiscount(0);
      toast.error('Invalid coupon or minimum amount not met.');
    }
  };

  const shipping = subtotal > 0 ? (subtotal > 50 ? 0 : 5.99) : 0;
  const grandTotal = subtotal + shipping - discount;

  if (!user) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Please log in to view your cart</h2>
        <Link to="/login" className="btn-primary" style={{ marginTop: '20px' }}>Login</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in padding-mobile" style={{ padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-gold-dark)', marginBottom: '30px' }}>Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--color-cream)', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ marginBottom: '15px' }}>Your cart is empty</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '25px' }}>Looks like you haven't added any handmade beauties yet.</p>
          <Link to="/shop" className="btn-primary">Return to Shop</Link>
        </div>
      ) : (
        <div className="flex-col-mobile" style={styles.layout}>
          <div style={styles.cartList}>
            {cartItems.map(item => (
              <div key={item.cart_id} style={styles.cartItem}>
                <img src={item.image} alt={item.name} style={styles.itemImg} />
                <div style={styles.itemDetails}>
                  <Link to={`/product/${item.slug}`} style={styles.itemName}>{item.name}</Link>
                  <div style={styles.itemPrice}>Rs. {(item.offer_price || item.price).toFixed(2)}</div>
                </div>
                <div style={styles.qtyBox}>
                  <button style={styles.qtyBtn} onClick={() => updateQuantity(item.cart_id, Math.max(1, item.quantity - 1))}>-</button>
                  <div style={styles.qtyDisplay}>{item.quantity}</div>
                  <button style={styles.qtyBtn} onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}>+</button>
                </div>
                <div style={styles.itemTotal}>
                  Rs. {((item.offer_price || item.price) * item.quantity).toFixed(2)}
                </div>
                <button style={styles.removeBtn} onClick={() => removeFromCart(item.cart_id)}>
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div style={styles.summaryBox}>
            <h3 style={{ marginBottom: '20px', fontFamily: 'var(--font-sans)', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Order Summary</h3>
            
            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Shipping {subtotal > 50 ? '(Free over Rs. 50)' : ''}</span>
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
              <span>Rs. {Math.max(0, grandTotal).toFixed(2)}</span>
            </div>

            <form onSubmit={handleApplyCoupon} style={styles.couponForm}>
              <input 
                type="text" 
                placeholder="Coupon code" 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value)} 
                style={styles.couponInput} 
              />
              <button type="submit" className="btn-secondary" style={{ padding: '10px 15px' }}>Apply</button>
            </form>

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '15px' }}
              onClick={() => navigate('/checkout', { state: { subtotal, shipping, discount, grandTotal, couponCode } })}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
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
  cartList: {
    flex: '2 1 500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: 'var(--color-white)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    gap: '20px',
    flexWrap: 'wrap'
  },
  itemImg: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: 'var(--radius-sm)'
  },
  itemDetails: {
    flex: '1 1 200px'
  },
  itemName: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: 'var(--color-text-main)',
    marginBottom: '5px',
    display: 'block'
  },
  itemPrice: {
    color: 'var(--color-text-muted)'
  },
  qtyBox: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ddd',
    borderRadius: 'var(--radius-sm)'
  },
  qtyBtn: {
    padding: '5px 12px',
    backgroundColor: '#f9f9f9'
  },
  qtyDisplay: {
    padding: '5px 15px',
    borderLeft: '1px solid #ddd',
    borderRight: '1px solid #ddd',
    fontWeight: '500'
  },
  itemTotal: {
    fontWeight: '600',
    color: 'var(--color-gold-dark)',
    width: '80px',
    textAlign: 'right'
  },
  removeBtn: {
    background: 'none',
    color: '#ff4d4f',
    padding: '10px'
  },
  summaryBox: {
    flex: '1 1 300px',
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
  },
  couponForm: {
    display: 'flex',
    gap: '10px',
    marginBottom: '25px'
  },
  couponInput: {
    flex: 1,
    backgroundColor: 'var(--color-white)'
  }
};

export default Cart;
