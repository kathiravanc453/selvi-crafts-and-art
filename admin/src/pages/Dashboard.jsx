import React, { useEffect, useState } from 'react';
import { ShoppingCart, Package, Users, TrendingUp, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';

const API = (path) => {
  const token = localStorage.getItem('admin_token');
  return fetch(path, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
};

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API('/api/orders'), API('/api/admin/products')])
      .then(([o, p]) => { setOrders(Array.isArray(o) ? o : []); setProducts(Array.isArray(p) ? p : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const recentOrders = [...orders].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);

  const stats = [
    { label: 'Total Revenue', value: `Rs. ${revenue.toFixed(0)}`, icon: TrendingUp, color: '#52c41a', bg: '#f6ffed' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: '#1677ff', bg: '#e6f7ff' },
    { label: 'Pending Orders', value: pending, icon: Clock, color: '#d48806', bg: '#fff7e6' },
    { label: 'Products Active', value: products.filter(p=>p.is_active).length, icon: Package, color: '#722ed1', bg: '#f9f0ff' },
  ];

  const statusStyle = {
    pending:   { bg:'#fff7e6', color:'#d48806' },
    confirmed: { bg:'#e6f7ff', color:'#1677ff' },
    shipped:   { bg:'#f0f5ff', color:'#2f54eb' },
    delivered: { bg:'#f6ffed', color:'#389e0d' },
    cancelled: { bg:'#fff1f0', color:'#cf1322' },
  };

  if (loading) return <div className="empty-state">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle" style={{ marginBottom: 28 }}>Welcome back! Here's what's happening today.</p>

      {/* Stats */}
      <div className="grid-stats">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={24} color={s.color} />
            </div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h2 style={{ marginBottom: 20, fontSize: '1.1rem', fontWeight: 700 }}>Recent Orders</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign:'center', padding:'40px', color:'#aaa' }}>No orders yet</td></tr>
              ) : recentOrders.map(o => {
                const st = statusStyle[o.status] || statusStyle.pending;
                return (
                  <tr key={o.id}>
                    <td style={{ fontWeight:700, color:'#8b6914' }}>#{o.id}</td>
                    <td>
                      <div style={{ fontWeight:600 }}>{o.shipping_name}</div>
                      <div style={{ fontSize:'0.78rem', color:'#999' }}>{o.shipping_email}</div>
                    </td>
                    <td style={{ fontWeight:600 }}>Rs. {parseFloat(o.total_amount).toFixed(2)}</td>
                    <td style={{ textTransform:'uppercase', fontSize:'0.8rem', color:'#666' }}>{o.payment_method}</td>
                    <td style={{ color:'#999', fontSize:'0.82rem' }}>{new Date(o.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</td>
                    <td>
                      <span className="badge-status" style={{ background:st.bg, color:st.color }}>
                        {o.status.charAt(0).toUpperCase()+o.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
