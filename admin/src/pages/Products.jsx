import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const token = () => localStorage.getItem('admin_token');
const hdrs = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

const EMPTY = { name:'', slug:'', description:'', price:'', offer_price:'', category_id:'', stock:'', is_active:true, image_url:'', shipping_days:'3-5', shipping_info:'Ships within 3-5 business days.' };

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [tab, setTab] = useState('details');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = () => {
    fetch('/api/admin/products', { headers: hdrs() }).then(r=>r.json()).then(d=>setProducts(Array.isArray(d)?d:[]));
    fetch('/api/admin/categories',{headers:hdrs()}).then(r=>r.json()).then(d=>setCategories(Array.isArray(d)?d:[]));
  };

  const openAdd = () => { setForm(EMPTY); setEditId(null); setTab('details'); setShowForm(true); };
  const openEdit = async (p) => {
    const res = await fetch(`/api/admin/products/${p.id}`,{headers:hdrs()});
    const d = await res.json();
    setForm({ name:d.name||'', slug:d.slug||'', description:d.description||'', price:d.price||'', offer_price:d.offer_price||'', category_id:d.category_id||'', stock:d.stock||'', is_active:d.is_active===1, image_url:d.images?.[0]?.image_url||'', shipping_days:d.shipping_days||'3-5', shipping_info:d.shipping_info||'Ships within 3-5 business days.' });
    setEditId(p.id); setTab('details'); setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const v = type==='checkbox' ? checked : value;
    setForm(prev => ({ ...prev, [name]: v, ...(name==='name' ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') } : {}) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Name & price required'); return; }
    setSaving(true);
    const url = editId ? `/api/admin/products/${editId}` : '/api/admin/products';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url,{method,headers:hdrs(),body:JSON.stringify(form)});
    if (res.ok) { toast.success(editId?'Product updated!':'Product created!'); setShowForm(false); fetchAll(); }
    else { const d=await res.json(); toast.error(d.error||'Error'); }
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
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await fetch(`/api/admin/products/${id}`,{method:'DELETE',headers:hdrs()});
    if (res.ok) { toast.success('Deleted'); fetchAll(); } else toast.error('Error');
  };

  const toggleActive = async (p) => {
    await fetch(`/api/admin/products/${p.id}`,{method:'PUT',headers:hdrs(),body:JSON.stringify({...p,is_active:!p.is_active})});
    toast.success(`${p.is_active?'Deactivated':'Activated'}`); fetchAll();
  };

  const filtered = products.filter(p=>p.name?.toLowerCase().includes(search.toLowerCase()));
  const discount = form.offer_price && form.price ? Math.round((1-parseFloat(form.offer_price)/parseFloat(form.price))*100) : 0;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div><h1 className="page-title">Products</h1><p className="page-subtitle">{products.length} total products</p></div>
        <button className="btn btn-gold" onClick={openAdd}><Plus size={18}/>Add New Product</button>
      </div>

      <div className="search-bar">
        <Search size={18} color="#aaa"/>
        <input className="search-input" placeholder="Search products..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>MRP</th><th>Sale Price</th><th>Stock</th><th>Active</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 ? <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'#aaa' }}>No products found</td></tr>
              : filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <img src={p.image?`http://localhost:5000${p.image}`:''} alt={p.name} style={{ width:46, height:46, objectFit:'cover', borderRadius:8, border:'1px solid #f0f0f0', flexShrink:0 }} onError={e=>e.target.style.display='none'}/>
                      <div>
                        <p style={{ fontWeight:700, margin:0, fontSize:'0.9rem' }}>{p.name}</p>
                        <p style={{ color:'#bbb', fontSize:'0.73rem', margin:'2px 0 0' }}>{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ background:'#f5f5f5', padding:'3px 10px', borderRadius:12, fontSize:'0.78rem', color:'#666' }}>{p.category_name||'—'}</span></td>
                  <td>Rs. {parseFloat(p.price).toFixed(2)}</td>
                  <td>{p.offer_price ? <span style={{ color:'#389e0d', fontWeight:700 }}>Rs. {parseFloat(p.offer_price).toFixed(2)}</span> : <span style={{ color:'#ccc' }}>—</span>}</td>
                  <td>
                    <span style={{ padding:'3px 10px', borderRadius:12, fontSize:'0.8rem', fontWeight:600, background:p.stock>5?'#f6ffed':p.stock>0?'#fff7e6':'#fff1f0', color:p.stock>5?'#389e0d':p.stock>0?'#d48806':'#cf1322' }}>
                      {p.stock} units
                    </span>
                  </td>
                  <td>
                    <button onClick={()=>toggleActive(p)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex' }}>
                      {p.is_active ? <ToggleRight size={28} color="#52c41a"/> : <ToggleLeft size={28} color="#ccc"/>}
                    </button>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-edit" style={{ padding:'7px 10px' }} onClick={()=>openEdit(p)}><Edit2 size={15}/></button>
                      <button className="btn btn-danger" style={{ padding:'7px 10px' }} onClick={()=>handleDelete(p.id,p.name)}><Trash2 size={15}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide Panel */}
      {showForm && (
        <div className="overlay" onClick={()=>setShowForm(false)}>
          <div className="slide-panel" onClick={e=>e.stopPropagation()}>
            <div className="panel-header">
              <h2 style={{ fontFamily:"'Playfair Display',serif", color:'#8b6914', fontSize:'1.2rem', margin:0 }}>{editId?'Edit Product':'New Product'}</h2>
              <button onClick={()=>setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#aaa', display:'flex' }}><X size={22}/></button>
            </div>
            <div className="tabs" style={{ padding:'0 24px' }}>
              {['details','pricing','delivery'].map(t=>(
                <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
                  {t==='details'?'📋 Details':t==='pricing'?'💰 Pricing':'🚚 Delivery'}
                </button>
              ))}
            </div>
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
              <div className="panel-body">
                {tab==='details' && <>
                  <div className="form-field"><label className="form-label">Product Name *</label><input name="name" value={form.name} onChange={handleChange} required className="form-input" placeholder="e.g. Silk Thread Bangles"/></div>
                  <div className="form-field"><label className="form-label">URL Slug</label><input name="slug" value={form.slug} onChange={handleChange} className="form-input" placeholder="auto-generated"/></div>
                  <div className="form-field">
                    <label className="form-label">Category</label>
                    <select name="category_id" value={form.category_id} onChange={handleChange} className="form-input">
                      <option value="">-- Select Category --</option>
                      {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-field"><label className="form-label">Description</label><textarea name="description" value={form.description} onChange={handleChange} className="form-input" placeholder="Describe the product..."/></div>
                  <div className="form-field">
                    <label className="form-label">Product Image</label>
                    <div style={{ display:'flex', gap:10, marginBottom:8 }}>
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ flex:1, padding:'6px 12px', border:'1px solid #ccc', borderRadius:8 }}/>
                      <span style={{ alignSelf:'center', color:'#888', fontSize:'0.8rem' }}>OR URL:</span>
                      <input name="image_url" value={form.image_url} onChange={handleChange} className="form-input" placeholder="/uploads/... or https://..." style={{ flex:2, margin:0 }}/>
                    </div>
                    {form.image_url && <img src={form.image_url.startsWith('/')?`http://localhost:5000${form.image_url}`:form.image_url} alt="preview" style={{ width:'100%', height:160, objectFit:'cover', borderRadius:8, border:'1px solid #eee' }} onError={e=>e.target.style.display='none'}/>}
                  </div>
                  <div className="form-field">
                    <label className="form-label">Visible on Store</label>
                    <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                      <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange}/>
                      <span style={{ fontSize:'0.9rem', color: form.is_active ? '#389e0d':'#cf1322' }}>{form.is_active?'✅ Visible to customers':'❌ Hidden from store'}</span>
                    </label>
                  </div>
                </>}

                {tab==='pricing' && <>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
                    <div style={{ background:'#fafafa', borderRadius:12, padding:20, border:'1px solid #eee', textAlign:'center' }}>
                      <div style={{ fontSize:'2rem', marginBottom:8 }}>💵</div>
                      <label className="form-label">Original Price (Rs.) *</label>
                      <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required className="form-input" style={{ textAlign:'center', fontSize:'1.3rem', fontWeight:700 }} placeholder="0.00"/>
                      <p style={{ color:'#aaa', fontSize:'0.75rem', marginTop:4 }}>MRP / Crossed out price</p>
                    </div>
                    <div style={{ background:'#fafafa', borderRadius:12, padding:20, border:'1px solid #eee', textAlign:'center' }}>
                      <div style={{ fontSize:'2rem', marginBottom:8 }}>🏷️</div>
                      <label className="form-label">Sale Price (Rs.)</label>
                      <input name="offer_price" type="number" step="0.01" min="0" value={form.offer_price} onChange={handleChange} className="form-input" style={{ textAlign:'center', fontSize:'1.3rem', fontWeight:700, color:'#389e0d' }} placeholder="0.00"/>
                      <p style={{ color:'#aaa', fontSize:'0.75rem', marginTop:4 }}>Leave empty for no discount</p>
                    </div>
                  </div>
                  {discount > 0 && (
                    <div style={{ background:'#f6ffed', border:'1px solid #b7eb8f', borderRadius:8, padding:'12px 16px', color:'#389e0d', fontWeight:700, marginBottom:20 }}>
                      🎉 {discount}% discount · Customer saves Rs. {(parseFloat(form.price)-parseFloat(form.offer_price)).toFixed(2)}
                    </div>
                  )}
                  <div className="form-field">
                    <label className="form-label">Stock Quantity</label>
                    <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className="form-input" placeholder="0"/>
                    {parseInt(form.stock)===0 && <p style={{ color:'#cf1322', fontSize:'0.82rem', marginTop:4 }}>❌ Out of stock</p>}
                    {parseInt(form.stock)>0 && parseInt(form.stock)<=5 && <p style={{ color:'#d48806', fontSize:'0.82rem', marginTop:4 }}>⚠️ Low stock</p>}
                  </div>
                </>}

                {tab==='delivery' && <>
                  <div style={{ background:'#fafafa', borderRadius:14, border:'1px solid #eee', padding:24, textAlign:'center', marginBottom:20 }}>
                    <div style={{ fontSize:'3rem', marginBottom:8 }}>🚚</div>
                    <h3 style={{ color:'#333', marginBottom:20 }}>Delivery Settings</h3>
                    <div className="form-field" style={{ textAlign:'left' }}>
                      <label className="form-label">Estimated Delivery Time</label>
                      <select name="shipping_days" value={form.shipping_days} onChange={handleChange} className="form-input">
                        <option value="1-2">1-2 Days (Express)</option>
                        <option value="3-5">3-5 Days (Standard)</option>
                        <option value="5-7">5-7 Days (Economy)</option>
                        <option value="7-10">7-10 Days</option>
                        <option value="10-15">10-15 Days</option>
                      </select>
                    </div>
                    <div className="form-field" style={{ textAlign:'left' }}>
                      <label className="form-label">Shipping Note</label>
                      <textarea name="shipping_info" value={form.shipping_info} onChange={handleChange} className="form-input" placeholder="Shipping details..."/>
                    </div>
                  </div>
                  <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, padding:16 }}>
                    <p style={{ fontWeight:600, fontSize:'0.83rem', color:'#555', marginBottom:8 }}>Preview on product page:</p>
                    <p style={{ color:'#52c41a', fontWeight:600, fontSize:'0.9rem' }}>🚚 Delivery in {form.shipping_days} business days</p>
                    <p style={{ color:'#888', fontSize:'0.82rem', marginTop:6 }}>{form.shipping_info}</p>
                  </div>
                </>}
              </div>
              <div className="panel-footer">
                <button type="button" className="btn btn-outline" style={{ flex:1 }} onClick={()=>setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" style={{ flex:2 }} disabled={saving}>
                  <Save size={16}/>{saving?'Saving...':editId?'Save Changes':'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
