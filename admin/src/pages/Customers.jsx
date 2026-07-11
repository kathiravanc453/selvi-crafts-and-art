import React, { useEffect, useState } from 'react';
import { Users as UsersIcon, Mail, Calendar } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    fetch('/api/admin/customers', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setCustomers(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="page-title">Customers</h1>
      <p className="page-subtitle" style={{ marginBottom: 24 }}>{customers.length} registered customers</p>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign:'center', padding:40, color:'#aaa' }}>No customers yet</td></tr>
            ) : customers.map(c => (
              <tr key={c.id}>
                <td style={{ color:'#aaa', fontWeight:700 }}>#{c.id}</td>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#b8860b,#cca34d)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:'0.9rem', flexShrink:0 }}>
                      {c.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight:600 }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ color:'#555' }}><Mail size={13} style={{ marginRight:6, verticalAlign:'middle' }}/>{c.email}</td>
                <td>
                  <span className="badge-status" style={{ background: c.role==='admin' ? '#fff7e6':'#f6ffed', color: c.role==='admin'?'#d48806':'#389e0d' }}>
                    {c.role}
                  </span>
                </td>
                <td style={{ color:'#aaa', fontSize:'0.82rem' }}>
                  <Calendar size={13} style={{ marginRight:6, verticalAlign:'middle' }}/>
                  {new Date(c.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
