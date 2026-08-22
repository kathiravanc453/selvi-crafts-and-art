import React, { useEffect, useState } from 'react';
import { Users as UsersIcon, Mail, Phone, MapPin, Calendar, ShoppingBag, Search, Eye, X, ShieldCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? '' : 'https://selvi-crafts-and-art.onrender.com');

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/admin/customers`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: Failed to fetch customers`);
        return r.json();
      })
      .then(d => {
        setCustomers(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search)) ||
    (c.city && c.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15, marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Customer Database</h1>
          <p className="page-subtitle" style={{ margin: 0, marginTop: 4 }}>
            {customers.length} registered customers stored in database
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: 280 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input
            type="text"
            placeholder="Search name, email, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: 8,
              border: '1px solid #ddd',
              outline: 'none',
              fontSize: '0.88rem'
            }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Contact Info</th>
              <th>Location</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>
                  No customers found matching your search.
                </td>
              </tr>
            ) : (
              filteredCustomers.map(c => (
                <tr key={c.id}>
                  <td style={{ color: '#aaa', fontWeight: 700 }}>#{c.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #b8860b, #cca34d)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        flexShrink: 0
                      }}>
                        {c.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ color: '#aaa', fontSize: '0.78rem' }}>
                          Joined {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      <div style={{ color: '#333' }}><Mail size={12} style={{ marginRight: 6, verticalAlign: 'middle', color: '#888' }} />{c.email}</div>
                      <div style={{ color: '#666', marginTop: 2 }}>
                        <Phone size={12} style={{ marginRight: 6, verticalAlign: 'middle', color: '#888' }} />
                        {c.phone || <span style={{ color: '#ccc', italic: 'true' }}>Not provided</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#555' }}>
                    {c.city || c.state ? (
                      <div>
                        <MapPin size={12} style={{ marginRight: 4, verticalAlign: 'middle', color: '#b8860b' }} />
                        {[c.city, c.state].filter(Boolean).join(', ')}
                      </div>
                    ) : (
                      <span style={{ color: '#ccc' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#333', background: '#f5f5f5', padding: '4px 8px', borderRadius: 6, fontSize: '0.85rem' }}>
                      <ShoppingBag size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      {c.order_count || 0} orders
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#2e7d32', fontSize: '0.9rem' }}>
                    ₹{c.total_spent ? Number(c.total_spent).toLocaleString('en-IN') : '0'}
                  </td>
                  <td>
                    <span className="badge-status" style={{
                      background: c.role === 'admin' ? '#fff7e6' : '#f6ffed',
                      color: c.role === 'admin' ? '#d48806' : '#389e0d'
                    }}>
                      {c.role === 'admin' ? <ShieldCheck size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} /> : null}
                      {c.role}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      style={{
                        padding: '6px 12px',
                        background: '#f0f4f8',
                        color: '#1890ff',
                        border: '1px solid #adc6ff',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Eye size={13} /> Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Detail Popup Modal */}
      {selectedCustomer && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            width: '100%',
            maxWidth: 500,
            padding: 24,
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedCustomer(null)}
              style={{
                position: 'absolute',
                top: 16, right: 16,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#888'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #b8860b, #cca34d)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.2rem'
              }}>
                {selectedCustomer.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111' }}>{selectedCustomer.name}</h3>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>Customer ID #{selectedCustomer.id}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14, background: '#fafafa', padding: 16, borderRadius: 8, fontSize: '0.9rem' }}>
              <div>
                <strong>Email Address:</strong>
                <div style={{ color: '#444', marginTop: 2 }}>{selectedCustomer.email}</div>
              </div>

              <div>
                <strong>Phone Number:</strong>
                <div style={{ color: '#444', marginTop: 2 }}>{selectedCustomer.phone || 'Not specified'}</div>
              </div>

              <div>
                <strong>Stored Shipping Address:</strong>
                <div style={{ color: '#444', marginTop: 2, lineHeight: '1.4' }}>
                  {selectedCustomer.address_line1 ? (
                    <>
                      {selectedCustomer.address_line1}
                      {selectedCustomer.address_line2 ? `, ${selectedCustomer.address_line2}` : ''}<br />
                      {[selectedCustomer.city, selectedCustomer.state, selectedCustomer.zip].filter(Boolean).join(', ')}
                    </>
                  ) : (
                    <span style={{ color: '#aaa', italic: 'true' }}>No saved address yet</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: 12 }}>
                <div>
                  <strong>Total Orders:</strong>
                  <div style={{ color: '#b8860b', fontWeight: 700, fontSize: '1.1rem' }}>{selectedCustomer.order_count || 0}</div>
                </div>
                <div>
                  <strong>Total Spent:</strong>
                  <div style={{ color: '#2e7d32', fontWeight: 700, fontSize: '1.1rem' }}>
                    ₹{selectedCustomer.total_spent ? Number(selectedCustomer.total_spent).toLocaleString('en-IN') : '0'}
                  </div>
                </div>
                <div>
                  <strong>Member Since:</strong>
                  <div style={{ color: '#555', fontSize: '0.85rem', marginTop: 4 }}>
                    {new Date(selectedCustomer.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{
                  padding: '8px 18px',
                  background: '#b8860b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
