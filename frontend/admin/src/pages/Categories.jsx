import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const token = () => localStorage.getItem('admin_token');
const hdrs = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

const EMPTY = { name:'', slug:'', description:'', image_url:'' };

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = () => {
    fetch('/api/admin/categories', { headers: hdrs() }).then(r=>r.json()).then(d=>setCategories(Array.isArray(d)?d:[]));
  };

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (c) => { setForm({ name:c.name, slug:c.slug, description:c.description||'', image_url:c.image_url||'' }); setEditId(c.id); setShowForm(true); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value, ...(name==='name' ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') } : {}) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Name required');
    setSaving(true);
    const url = editId ? `/api/admin/categories/${editId}` : '/api/admin/categories';
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

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE', headers: hdrs() });
    if (res.ok) { toast.success('Deleted'); fetchAll(); } else toast.error('Error deleting');
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div><h1 className="page-title">Categories</h1><p className="page-subtitle">Manage product categories</p></div>
        <button className="btn btn-gold" onClick={openAdd}><Plus size={18}/>Add Category</button>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr><th>Image</th><th>Name</th><th>Slug</th><th>Description</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {categories.length===0 ? <tr><td colSpan={5} style={{ textAlign:'center', padding:40, color:'#aaa' }}>No categories found</td></tr>
            : categories.map(c => (
              <tr key={c.id}>
                <td><img src={c.image_url?`http://localhost:5000${c.image_url}`:''} alt={c.name} style={{ width:40, height:40, objectFit:'cover', borderRadius:8 }} onError={e=>e.target.style.display='none'}/></td>
                <td style={{ fontWeight:600 }}>{c.name}</td>
                <td style={{ color:'#888' }}>{c.slug}</td>
                <td>{c.description||'—'}</td>
                <td>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-edit" style={{ padding:'7px 10px' }} onClick={()=>openEdit(c)}><Edit2 size={15}/></button>
                    <button className="btn btn-danger" style={{ padding:'7px 10px' }} onClick={()=>handleDelete(c.id,c.name)}><Trash2 size={15}/></button>
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
              <h2 className="formTitle" style={{ margin:0, color:'#8b6914' }}>{editId?'Edit Category':'New Category'}</h2>
              <button onClick={()=>setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={22} color="#aaa"/></button>
            </div>
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', flex:1 }}>
              <div className="panel-body">
                <div className="form-field"><label className="form-label">Name *</label><input name="name" value={form.name} onChange={handleChange} required className="form-input"/></div>
                <div className="form-field"><label className="form-label">Slug</label><input name="slug" value={form.slug} onChange={handleChange} className="form-input"/></div>
                <div className="form-field"><label className="form-label">Description</label><textarea name="description" value={form.description} onChange={handleChange} className="form-input"/></div>
                <div className="form-field">
                  <label className="form-label">Category Image</label>
                  <div style={{ display:'flex', gap:10, marginBottom:8 }}>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ flex:1, padding:'6px 12px', border:'1px solid #ccc', borderRadius:8 }}/>
                    <span style={{ alignSelf:'center', color:'#888', fontSize:'0.8rem' }}>OR URL:</span>
                    <input name="image_url" value={form.image_url} onChange={handleChange} className="form-input" placeholder="/uploads/... or https://..." style={{ flex:2, margin:0 }}/>
                  </div>
                  {form.image_url && <img src={form.image_url.startsWith('/')?`http://localhost:5000${form.image_url}`:form.image_url} alt="preview" style={{ width:'100%', height:120, objectFit:'cover', borderRadius:8, border:'1px solid #eee' }} onError={e=>e.target.style.display='none'}/>}
                </div>
              </div>
              <div className="panel-footer">
                <button type="button" className="btn btn-outline" style={{ flex:1 }} onClick={()=>setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ flex:2 }} disabled={saving}><Save size={16}/> {saving?'Saving...':'Save Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
