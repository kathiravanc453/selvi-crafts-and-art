import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Menu, X, LogOut, Settings, Package } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const { wishlistItems } = useContext(WishlistContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Categories', path: '/categories' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          Selvi's arts & craft
        </Link>

        {/* Icons */}
        <div style={styles.icons}>
          <Link to="/cart" style={styles.iconWrapper}>
            <ShoppingCart size={20} />
            {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
          </Link>
          <Link to="/shop" style={styles.iconWrapper}>
            <Heart size={20} />
            {wishlistCount > 0 && <span style={styles.badge}>{wishlistCount}</span>}
          </Link>
          
          {user ? (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }} title="My Profile">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1.5 solid #cca34d' }} />
                ) : (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#cca34d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', fontWeight: 600 }}>{user.name}</span>
              </Link>
              <Link to="/my-orders" style={styles.iconWrapper} title="My Orders">
                <Package size={20} />
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={styles.iconWrapper} title="Admin Dashboard">
                  <Settings size={20} />
                </Link>
              )}
              <button onClick={handleLogout} style={styles.iconWrapper} title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" style={styles.iconWrapper}>
              <User size={20} />
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button style={styles.mobileMenuBtn} onClick={() => setIsMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div 
        style={{
          ...styles.backdrop, 
          opacity: isMenuOpen ? 1 : 0, 
          pointerEvents: isMenuOpen ? 'auto' : 'none'
        }}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      {/* Mobile Drawer */}
      <div style={{
        ...styles.mobileDrawer, 
        transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)'
      }}>
        <div style={styles.drawerHeader}>
          <span style={styles.drawerTitle}>Menu</span>
          <button style={styles.mobileMenuBtn} onClick={() => setIsMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            to={link.path} 
            style={styles.mobileLink}
            onClick={() => setIsMenuOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        {user && (
          <Link to="/profile" style={{ ...styles.mobileLink, color: 'var(--color-gold-dark)', fontWeight: '600' }} onClick={() => setIsMenuOpen(false)}>
            👤 My Profile
          </Link>
        )}
        {user && (
          <Link to="/my-orders" style={{ ...styles.mobileLink, color: 'var(--color-gold-dark)', fontWeight: '600' }} onClick={() => setIsMenuOpen(false)}>
            📦 My Orders
          </Link>
        )}
        {user && (
          <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} style={{ ...styles.mobileLink, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#e74c3c', width: '100%' }}>
            🚪 Logout
          </button>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: 'var(--color-white)',
    boxShadow: 'var(--shadow-sm)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '70px'
  },
  logo: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--color-gold-dark)'
  },

  icons: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  iconWrapper: {
    position: 'relative',
    color: 'var(--color-text-main)',
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  badge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: 'var(--color-pink-accent)',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  mobileMenuBtn: {
    display: 'flex',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-main)',
    alignItems: 'center'
  },
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
    transition: 'opacity 0.3s ease',
  },
  mobileDrawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '280px',
    backgroundColor: 'var(--color-white)',
    boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    zIndex: 1000,
    transition: 'transform 0.3s ease',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #eee'
  },
  drawerTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: 'var(--color-gold-dark)',
    fontFamily: 'var(--font-serif)'
  },
  mobileLink: {
    padding: '16px 0', /* Increased padding for tap target */
    borderBottom: '1px solid #f5f5f5',
    fontSize: '1.1rem', /* Larger text for mobile */
    fontWeight: '500',
    color: 'var(--color-text-main)'
  }
};

export default Navbar;
