import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const token = () => localStorage.getItem('admin_token');
const hdrs = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

const EMPTY = { title:'', description:'', code:'', discount_percent:'', valid_until:'', is_active:true };

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = () => {
    fetch('/api/admin/offers', { headers: hdrs() }).then(r=>r.json()).then(d=>setOffers(Array.isArray(d)?d:[]));
  };

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (o) => { 
    setForm({ 
      title:o.title, description:o.description||'', code:o.code, 
      discount_percent:o.discount_percent, 
      valid_until:o.valid_until ? o.valid_until.split('T')[0] : '', 
      is_active:o.is_active===1 
    }); 
    setEditId(o.id); setShowForm(true); 
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type==='checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.code || !form.discount_percent) return toast.error('Required fields missing');
    setSaving(true);
    const url = editId ? `/api/admin/offers/${editId}` : '/api/admin/offers';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: hdrs(), body: JSON.stringify(form) });
    if (res.ok) { toast.success(editId?'Updated':'Created'); setShowForm(false); fetchAll(); }
    else toast.error('Error saving');
    setSaving(false);
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete offer "${title}"?`)) return;
    const res = await fetch(`/api/admin/offers/${id}`, { method: 'DELETE', headers: hdrs() });
    if (res.ok) { toast.success('Deleted'); fetchAll(); } else toast.error('Error deleting');
  };

  const toggleActive = async (o) => {
    await fetch(`/api/admin/offers/${o.id}`, { method:'PUT', headers:hdrs(), body:JSON.stringify({...o, is_active:!o.is_active}) });
    toast.success(`${o.is_active?'Deactivated':'Activated'}`); fetchAll();
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div><h1 className="page-title">Offers & Coupons</h1><p className="page-subtitle">Manage store discounts</p></div>
        <button className="btn btn-gold" onClick={openAdd}><Plus size={18}/>Add Offer</button>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr><th>Title</th><th>Code</th><th>Discount</th><th>Expires</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {offers.length===0 ? <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'#aaa' }}>No offers found</td></tr>
            : offers.map(o => (
              <tr key={o.id}>
                <td style={{ fontWeight:600 }}>{o.title}</td>
                <td><span style={{ background:'#f9f0ff', color:'#722ed1', padding:'3px 10px', borderRadius:12, fontWeight:700, fontFamily:'monospace', fontSize:'0.9rem' }}>{o.code}</span></td>
                <td style={{ fontWeight:700, color:'#389e0d' }}>{o.discount_percent}% OFF</td>
                <td style={{ color:'#888' }}>{o.valid_until ? new Date(o.valid_until).toLocaleDateString() : 'Never'}</td>
                <td>
                  <button onClick={()=>toggleActive(o)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex' }}>
                    {o.is_active ? <ToggleRight size={28} color="#52c41a"/> : <ToggleLeft size={28} color="#ccc"/>}
                  </button>
                </td>
                <td>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-edit" style={{ padding:'7px 10px' }} onClick={()=>openEdit(o)}><Edit2 size={15}/></button>
                    <button className="btn btn-danger" style={{ padding:'7px 10px' }} onClick={()=>handleDelete(o.id,o.title)}><Trash2 size={15}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="overlay" onClick={()=>setShowForm(false)}>
          <div className="slide-panel" onClick={e=>e.stopPropagation()}>
            <div className="panel-header">
              <h2 className="formTitle" style={{ margin:0, color:'#8b6914' }}>{editId?'Edit Offer':'New Offer'}</h2>
              <button onClick={()=>setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={22} color="#aaa"/></button>
            </div>
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', flex:1 }}>
              <div className="panel-body">
                <div className="form-field"><label className="form-label">Offer Title *</label><input name="title" value={form.title} onChange={handleChange} required className="form-input" placeholder="e.g. Summer Sale 2026"/></div>
                <div className="form-field"><label className="form-label">Description</label><textarea name="description" value={form.description} onChange={handleChange} className="form-input"/></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div className="form-field"><label className="form-label">Coupon Code *</label><input name="code" value={form.code} onChange={handleChange} required className="form-input" placeholder="SUMMER20" style={{ textTransform:'uppercase' }}/></div>
                  <div className="form-field"><label className="form-label">Discount % *</label><input name="discount_percent" type="number" min="1" max="100" value={form.discount_percent} onChange={handleChange} required className="form-input"/></div>
                </div>
                <div className="form-field"><label className="form-label">Valid Until</label><input name="valid_until" type="date" value={form.valid_until} onChange={handleChange} className="form-input"/></div>
                <div className="form-field">
                  <label className="form-label">Active</label>
                  <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                    <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange}/>
                    <span>{form.is_active?'✅ Active':'❌ Inactive'}</span>
                  </label>
                </div>
              </div>
              <div className="panel-footer">
                <button type="button" className="btn btn-outline" style={{ flex:1 }} onClick={()=>setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ flex:2 }} disabled={saving}><Save size={16}/> {saving?'Saving...':'Save Offer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;
