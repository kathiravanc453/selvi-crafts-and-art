import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, ToggleLeft, ToggleRight, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';

const token = () => localStorage.getItem('admin_token');
const hdrs = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

const EMPTY = { title:'', subtitle:'', image_url:'', link_url:'', display_order:0, is_active:true };

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = () => {
    fetch('/api/admin/banners', { headers: hdrs() }).then(r=>r.json()).then(d=>setBanners(Array.isArray(d)?d:[]));
  };

  const openAdd = () => { setForm({...EMPTY, display_order: banners.length+1}); setEditId(null); setShowForm(true); };
  const openEdit = (b) => { 
    setForm({ title:b.title, subtitle:b.subtitle||'', image_url:b.image_url, link_url:b.link_url||'', display_order:b.display_order, is_active:b.is_active===1 }); 
    setEditId(b.id); setShowForm(true); 
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type==='checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.image_url) return toast.error('Required fields missing');
    setSaving(true);
    const url = editId ? `/api/admin/banners/${editId}` : '/api/admin/banners';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: hdrs(), body: JSON.stringify(form) });
    if (res.ok) { toast.success(editId?'Updated':'Created'); setShowForm(false); fetchAll(); }
    else toast.error('Error saving');
    setSaving(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    toast.loading('Uploading image...', { id: 'upload' });
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) { setForm(prev => ({ ...prev, image_url: data.url })); toast.success('Image uploaded', { id: 'upload' }); }
      else throw new Error(data.error);
    } catch (err) { toast.error('Upload failed', { id: 'upload' }); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete banner "${title}"?`)) return;
    const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE', headers: hdrs() });
    if (res.ok) { toast.success('Deleted'); fetchAll(); } else toast.error('Error deleting');
  };

  const toggleActive = async (b) => {
    await fetch(`/api/admin/banners/${b.id}`, { method:'PUT', headers:hdrs(), body:JSON.stringify({...b, is_active:!b.is_active}) });
    toast.success(`${b.is_active?'Deactivated':'Activated'}`); fetchAll();
  };

  const moveOrder = async (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === banners.length - 1)) return;
    const b1 = banners[index];
    const b2 = banners[index + direction];
    
    // Swap display_order in local state for fast UI update
    const tempOrder = b1.display_order;
    b1.display_order = b2.display_order;
    b2.display_order = tempOrder;
    
    // Fire requests to backend
    await Promise.all([
      fetch(`/api/admin/banners/${b1.id}`, { method:'PUT', headers:hdrs(), body:JSON.stringify(b1) }),
      fetch(`/api/admin/banners/${b2.id}`, { method:'PUT', headers:hdrs(), body:JSON.stringify(b2) })
    ]);
    fetchAll();
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div><h1 className="page-title">Homepage Banners</h1><p className="page-subtitle">Manage sliding hero images</p></div>
        <button className="btn btn-gold" onClick={openAdd}><Plus size={18}/>Add Banner</button>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr><th>Order</th><th>Image</th><th>Text Content</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {banners.length===0 ? <tr><td colSpan={5} style={{ textAlign:'center', padding:40, color:'#aaa' }}>No banners found</td></tr>
            : banners.map((b, i) => (
              <tr key={b.id}>
                <td>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <button onClick={()=>moveOrder(i, -1)} disabled={i===0} style={{ background:'none', border:'none', cursor:i===0?'default':'pointer', color:i===0?'#eee':'#888' }}><ArrowUp size={16}/></button>
                    <span style={{ fontWeight:700, fontSize:'1.1rem', color:'#1a1a2e' }}>{b.display_order}</span>
                    <button onClick={()=>moveOrder(i, 1)} disabled={i===banners.length-1} style={{ background:'none', border:'none', cursor:i===banners.length-1?'default':'pointer', color:i===banners.length-1?'#eee':'#888' }}><ArrowDown size={16}/></button>
                  </div>
                </td>
                <td>
                  <div style={{ width:160, height:80, borderRadius:8, overflow:'hidden', background:'#f0f0f0' }}>
                    <img src={b.image_url?`http://localhost:5000${b.image_url}`:''} alt="banner" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'}/>
                  </div>
                </td>
                <td>
                  <p style={{ fontWeight:700, fontSize:'1rem', margin:0, color:'#1a1a2e' }}>{b.title}</p>
                  <p style={{ color:'#888', fontSize:'0.85rem', margin:'4px 0' }}>{b.subtitle}</p>
                  {b.link_url && <a href={b.link_url} target="_blank" rel="noreferrer" style={{ fontSize:'0.75rem', color:'#1677ff', textDecoration:'underline' }}>{b.link_url}</a>}
                </td>
                <td>
                  <button onClick={()=>toggleActive(b)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex' }}>
                    {b.is_active ? <ToggleRight size={28} color="#52c41a"/> : <ToggleLeft size={28} color="#ccc"/>}
                  </button>
                </td>
                <td>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-edit" style={{ padding:'7px 10px' }} onClick={()=>openEdit(b)}><Edit2 size={15}/></button>
                    <button className="btn btn-danger" style={{ padding:'7px 10px' }} onClick={()=>handleDelete(b.id,b.title)}><Trash2 size={15}/></button>
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
              <h2 className="formTitle" style={{ margin:0, color:'#8b6914' }}>{editId?'Edit Banner':'New Banner'}</h2>
              <button onClick={()=>setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={22} color="#aaa"/></button>
            </div>
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', flex:1 }}>
              <div className="panel-body">
                <div className="form-field"><label className="form-label">Headline Title *</label><input name="title" value={form.title} onChange={handleChange} required className="form-input" placeholder="e.g. Grand Festive Sale"/></div>
                <div className="form-field"><label className="form-label">Subtitle</label><input name="subtitle" value={form.subtitle} onChange={handleChange} className="form-input" placeholder="e.g. Flat 50% Off"/></div>
                <div className="form-field">
                  <label className="form-label">Banner Image *</label>
                  <div style={{ display:'flex', gap:10, marginBottom:8 }}>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ flex:1, padding:'6px 12px', border:'1px solid #ccc', borderRadius:8 }}/>
                    <span style={{ alignSelf:'center', color:'#888', fontSize:'0.8rem' }}>OR URL:</span>
                    <input name="image_url" value={form.image_url} onChange={handleChange} required className="form-input" placeholder="/uploads/... or https://..." style={{ flex:2, margin:0 }}/>
                  </div>
                  {form.image_url && <img src={form.image_url.startsWith('/')?`http://localhost:5000${form.image_url}`:form.image_url} alt="preview" style={{ width:'100%', height:140, objectFit:'cover', borderRadius:8, border:'1px solid #eee' }} onError={e=>e.target.style.display='none'}/>}
                </div>
                <div className="form-field"><label className="form-label">Link URL (optional)</label><input name="link_url" value={form.link_url} onChange={handleChange} className="form-input" placeholder="e.g. /category/sarees"/></div>
                <div className="form-field"><label className="form-label">Display Order</label><input name="display_order" type="number" value={form.display_order} onChange={handleChange} className="form-input"/></div>
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
                <button type="submit" className="btn btn-gold" style={{ flex:2 }} disabled={saving}><Save size={16}/> {saving?'Saving...':'Save Banner'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
