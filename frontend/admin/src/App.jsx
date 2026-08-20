import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Offers from './pages/Offers';
import Banners from './pages/Banners';
import Customers from './pages/Customers';
import {
  LayoutDashboard, ShoppingCart, Package, Users,
  LogOut, ShieldCheck, ExternalLink, Box, Tag, ImageIcon
} from 'lucide-react';

const NAV = [
  { path: '/',         label: 'Dashboard',  icon: LayoutDashboard },
  { path: '/orders',   label: 'Orders',     icon: ShoppingCart },
  { path: '/products', label: 'Products',   icon: Package },
  { path: '/categories',label: 'Categories',icon: Box },
  { path: '/offers',   label: 'Offers',     icon: Tag },
  { path: '/banners',  label: 'Banners',    icon: ImageIcon },
  { path: '/customers',label: 'Customers',  icon: Users },
];

const Layout = ({ children }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <ShieldCheck size={20} style={{ marginBottom: 4 }} />
          Selvi's Arts & Craft
          <span>Admin Panel</span>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section">Main Menu</div>
          {NAV.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
          <div className="sidebar-section" style={{ marginTop: 32 }}>Store</div>
          <a href="http://localhost:5173" target="_blank" rel="noreferrer" className="nav-item">
            <ExternalLink size={18} /> View Store
          </a>
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={handleLogout} className="nav-item" style={{ width:'100%', border:'none', background:'none', cursor:'pointer', color:'rgba(255,100,100,0.8)' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Top Bar */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <h2 style={{ fontSize:'1rem', fontWeight:700, color:'#1a1a2e', margin:0 }}>Welcome back</h2>
            <p style={{ fontSize:'0.78rem', color:'#999', margin:0 }}>Selvi's Arts & Craft Admin Panel</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#b8860b,#cca34d)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700 }}>
              {admin?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight:700, fontSize:'0.88rem', margin:0, color:'#1a1a2e' }}>{admin?.name}</p>
              <p style={{ fontSize:'0.75rem', color:'#999', margin:0 }}>{admin?.email}</p>
            </div>
          </div>
        </header>

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { admin, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#1a1a2e', color:'#cca34d', fontSize:'1.2rem' }}>Loading...</div>;
  if (!admin) return <Login />;

  return (
    <Layout>
      <Routes>
        <Route path="/"          element={<Dashboard />} />
        <Route path="/orders"    element={<Orders />} />
        <Route path="/products"  element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/offers"    element={<Offers />} />
        <Route path="/banners"   element={<Banners />} />
        <Route path="/customers" element={<Customers />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
