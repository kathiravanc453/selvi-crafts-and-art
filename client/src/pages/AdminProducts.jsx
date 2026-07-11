import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Package, Search, ToggleLeft, ToggleRight, Image as ImageIcon, Tag, Truck, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', slug: '', description: '',
  price: '', offer_price: '',
  category_id: '', stock: '',
  is_active: true,
  image_url: '',
  shipping_info: 'Ships within 3-5 business days. Free shipping on orders above Rs. 499.',
  shipping_days: '3-5'
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // details | pricing | delivery

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = () => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  const fetchCategories = () => {
    fetch('/api/admin/categories', { headers })
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setActiveTab('details');
    setShowForm(true);
  };

  const openEdit = async (product) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { headers });
      const data = await res.json();
      setForm({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        price: data.price || '',
        offer_price: data.offer_price || '',
        category_id: data.category_id || '',
        stock: data.stock || '',
        is_active: data.is_active === 1,
        image_url: data.images?.[0]?.image_url || '',
        shipping_info: data.shipping_info || 'Ships within 3-5 business days. Free shipping on orders above Rs. 499.',
        shipping_days: data.shipping_days || '3-5'
      });
      setEditingId(product.id);
      setActiveTab('details');
      setShowForm(true);
    } catch (e) { toast.error('Failed to load product'); }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Auto generate slug from name
    if (name === 'name') {
      setForm(prev => ({
        ...prev,
        name: value,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    setLoading(true);
    try {
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) {
        toast.success(editingId ? 'Product updated!' : 'Product created!');
        setShowForm(false);
        fetchProducts();
      } else {
        toast.error(data.error || 'Failed to save product');
      }
    } catch (e) { toast.error('Network error'); }
    setLoading(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', headers });
      if (res.ok) { toast.success('Product deleted'); fetchProducts(); }
      else toast.error('Failed to delete');
    } catch (e) { toast.error('Network error'); }
  };

  const handleToggleActive = async (product) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ ...product, is_active: !product.is_active, category_id: product.category_id })
      });
      if (res.ok) {
        toast.success(`Product ${!product.is_active ? 'activated' : 'deactivated'}`);
        fetchProducts();
      }
    } catch (e) { toast.error('Network error'); }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Product Management</h1>
          <p style={styles.subtitle}>{products.length} total products</p>
        </div>
        <button onClick={openAdd} style={styles.addBtn}>
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Search */}
      <div style={styles.searchBar}>
        <Search size={18} color="#aaa" />
        <input
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Products Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Product</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Offer Price</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign:'center', padding:'40px', color:'#aaa' }}>No products found</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <img
                      src={p.image ? `http://localhost:5000${p.image}` : ''}
                      alt={p.name}
                      style={styles.thumb}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    <div>
                      <p style={{ fontWeight:'600', margin:0, fontSize:'0.9rem' }}>{p.name}</p>
                      <p style={{ color:'#aaa', fontSize:'0.75rem', margin:'2px 0 0' }}>{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td style={styles.td}><span style={styles.catChip}>{p.category_name || '—'}</span></td>
                <td style={styles.td}>Rs. {parseFloat(p.price).toFixed(2)}</td>
                <td style={styles.td}>
                  {p.offer_price ? <span style={styles.offerPrice}>Rs. {parseFloat(p.offer_price).toFixed(2)}</span> : <span style={{ color:'#ccc' }}>—</span>}
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.stockChip, backgroundColor: p.stock > 5 ? '#f6ffed' : p.stock > 0 ? '#fff7e6' : '#fff1f0', color: p.stock > 5 ? '#389e0d' : p.stock > 0 ? '#d48806' : '#cf1322' }}>
                    {p.stock} units
                  </span>
                </td>
                <td style={styles.td}>
                  <button onClick={() => handleToggleActive(p)} style={styles.toggleBtn} title={p.is_active ? 'Active – click to deactivate' : 'Inactive – click to activate'}>
                    {p.is_active ? <ToggleRight size={28} color="#52c41a" /> : <ToggleLeft size={28} color="#ccc" />}
                  </button>
                </td>
                <td style={styles.td}>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => openEdit(p)} style={styles.editBtn} title="Edit"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(p.id, p.name)} style={styles.deleteBtn} title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-in Form Panel */}
      {showForm && (
        <div style={styles.overlay} onClick={() => setShowForm(false)}>
          <div style={styles.formPanel} onClick={e => e.stopPropagation()}>
            {/* Form Header */}
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>{editingId ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
              <button onClick={() => setShowForm(false)} style={styles.closeBtn}><X size={22} /></button>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
              {[
                { key: 'details', label: '📋 Details', icon: Package },
                { key: 'pricing', label: '💰 Pricing & Stock', icon: IndianRupee },
                { key: 'delivery', label: '🚚 Delivery', icon: Truck },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{ ...styles.tab, ...(activeTab === tab.key ? styles.tabActive : {}) }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* DETAILS TAB */}
              {activeTab === 'details' && (
                <div style={styles.tabContent}>
                  <div style={styles.field}>
                    <label style={styles.label}>Product Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} required style={styles.input} placeholder="e.g. Silk Thread Bangles" />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>URL Slug</label>
                    <input name="slug" value={form.slug} onChange={handleChange} style={styles.input} placeholder="auto-generated-from-name" />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Category</label>
                    <select name="category_id" value={form.category_id} onChange={handleChange} style={styles.input}>
                      <option value="">-- Select Category --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} style={{ ...styles.input, height: '100px', resize: 'vertical' }} placeholder="Describe the product..." />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}><ImageIcon size={14} style={{ marginRight:4 }} />Primary Image URL</label>
                    <input name="image_url" value={form.image_url} onChange={handleChange} style={styles.input} placeholder="https://... or /uploads/..." />
                    {form.image_url && (
                      <img src={form.image_url.startsWith('/') ? `http://localhost:5000${form.image_url}` : form.image_url} alt="preview" style={styles.imgPreview} onError={e => e.target.style.display='none'} />
                    )}
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Active / Visible on Store</label>
                    <label style={styles.checkLabel}>
                      <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                      <span style={{ marginLeft:8 }}>{form.is_active ? 'Yes – visible to customers' : 'No – hidden from store'}</span>
                    </label>
                  </div>
                </div>
              )}

              {/* PRICING TAB */}
              {activeTab === 'pricing' && (
                <div style={styles.tabContent}>
                  <div style={styles.pricingGrid}>
                    <div style={styles.pricingCard}>
                      <div style={styles.pricingIcon}>💵</div>
                      <label style={styles.label}>Original Price (Rs.) *</label>
                      <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required style={{ ...styles.input, fontSize:'1.3rem', fontWeight:'700', textAlign:'center' }} placeholder="0.00" />
                      <p style={styles.hint}>This is the MRP shown crossed out</p>
                    </div>
                    <div style={styles.pricingCard}>
                      <div style={styles.pricingIcon}>🏷️</div>
                      <label style={styles.label}>Offer / Sale Price (Rs.)</label>
                      <input name="offer_price" type="number" step="0.01" min="0" value={form.offer_price} onChange={handleChange} style={{ ...styles.input, fontSize:'1.3rem', fontWeight:'700', textAlign:'center', color:'#389e0d' }} placeholder="0.00" />
                      <p style={styles.hint}>Leave empty if no discount</p>
                    </div>
                  </div>
                  {form.offer_price && form.price && (
                    <div style={styles.discountBanner}>
                      🎉 Discount: {Math.round((1 - parseFloat(form.offer_price) / parseFloat(form.price)) * 100)}% off
                      &nbsp;| Customer saves Rs. {(parseFloat(form.price) - parseFloat(form.offer_price)).toFixed(2)}
                    </div>
                  )}
                  <div style={styles.field}>
                    <label style={styles.label}>Stock Quantity</label>
                    <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} style={styles.input} placeholder="0" />
                    {form.stock <= 5 && form.stock > 0 && <p style={{ color:'#d48806', fontSize:'0.82rem', marginTop:4 }}>⚠️ Low stock warning</p>}
                    {form.stock == 0 && <p style={{ color:'#cf1322', fontSize:'0.82rem', marginTop:4 }}>❌ Out of stock</p>}
                  </div>
                </div>
              )}

              {/* DELIVERY TAB */}
              {activeTab === 'delivery' && (
                <div style={styles.tabContent}>
                  <div style={styles.deliveryCard}>
                    <div style={styles.deliveryIcon}><Truck size={32} color="var(--color-gold-dark)" /></div>
                    <h3 style={{ margin:'0 0 20px', color:'#333' }}>Delivery Configuration</h3>
                    <div style={styles.field}>
                      <label style={styles.label}>Estimated Delivery Days</label>
                      <select name="shipping_days" value={form.shipping_days} onChange={handleChange} style={styles.input}>
                        <option value="1-2">1-2 Business Days (Express)</option>
                        <option value="3-5">3-5 Business Days (Standard)</option>
                        <option value="5-7">5-7 Business Days (Economy)</option>
                        <option value="7-10">7-10 Business Days</option>
                        <option value="10-15">10-15 Business Days</option>
                      </select>
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Shipping Info / Note</label>
                      <textarea
                        name="shipping_info"
                        value={form.shipping_info}
                        onChange={handleChange}
                        style={{ ...styles.input, height:'80px', resize:'vertical' }}
                        placeholder="Ships within 3-5 business days..."
                      />
                    </div>
                    <div style={styles.deliveryPreview}>
                      <h4 style={{ margin:'0 0 8px', fontSize:'0.88rem', color:'#666' }}>Preview on product page:</h4>
                      <div style={styles.deliveryPreviewBox}>
                        <Truck size={16} color="#52c41a" />
                        <span>Delivery in <strong>{form.shipping_days} days</strong></span>
                      </div>
                      <p style={{ fontSize:'0.83rem', color:'#888', margin:'8px 0 0' }}>{form.shipping_info}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" disabled={loading} style={styles.saveBtn}>
                  <Save size={16} />
                  {loading ? 'Saving...' : editingId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: '0' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '24px', flexWrap: 'wrap', gap: '12px'
  },
  title: {
    fontFamily: 'var(--font-serif)', fontSize: '1.8rem',
    color: 'var(--color-gold-dark)', margin: 0
  },
  subtitle: { color: '#aaa', fontSize: '0.9rem', margin: '4px 0 0' },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: 'var(--color-gold-dark)', color: '#fff',
    border: 'none', borderRadius: '10px', padding: '12px 20px',
    fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer'
  },
  searchBar: {
    display: 'flex', alignItems: 'center', gap: '10px',
    backgroundColor: '#fff', borderRadius: '10px',
    padding: '12px 16px', border: '1px solid #eee',
    marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  },
  searchInput: {
    border: 'none', outline: 'none', flex: 1,
    fontSize: '0.95rem', background: 'transparent'
  },
  tableWrapper: {
    backgroundColor: '#fff', borderRadius: '14px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden'
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: 'var(--color-cream)' },
  th: { padding: '14px 16px', textAlign: 'left', fontWeight: '700', fontSize: '0.82rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s' },
  td: { padding: '14px 16px', verticalAlign: 'middle' },
  thumb: { width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, border: '1px solid #f0f0f0' },
  catChip: { backgroundColor: '#f5f5f5', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', color: '#666' },
  offerPrice: { color: '#389e0d', fontWeight: '700' },
  stockChip: { padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' },
  toggleBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  editBtn: { backgroundColor: '#e6f7ff', color: '#1677ff', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex' },
  deleteBtn: { backgroundColor: '#fff1f0', color: '#cf1322', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex' },
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 2000, display: 'flex', justifyContent: 'flex-end'
  },
  formPanel: {
    width: '480px', maxWidth: '100vw', backgroundColor: '#fff',
    height: '100%', overflow: 'hidden', display: 'flex',
    flexDirection: 'column', boxShadow: '-4px 0 30px rgba(0,0,0,0.15)'
  },
  formHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 24px', borderBottom: '1px solid #eee', flexShrink: 0
  },
  formTitle: { fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--color-gold-dark)', margin: 0 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex' },
  tabs: { display: 'flex', borderBottom: '2px solid #f0f0f0', flexShrink: 0 },
  tab: {
    flex: 1, padding: '14px 8px', border: 'none', background: 'none',
    cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', color: '#aaa'
  },
  tabActive: {
    color: 'var(--color-gold-dark)',
    borderBottom: '2px solid var(--color-gold-dark)',
    marginBottom: '-2px'
  },
  form: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  tabContent: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
  field: { marginBottom: '18px' },
  label: { display: 'block', fontWeight: '600', fontSize: '0.85rem', color: '#555', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0',
    borderRadius: '8px', fontSize: '0.95rem', outline: 'none',
    boxSizing: 'border-box', backgroundColor: '#fafafa',
    transition: 'border-color 0.2s'
  },
  hint: { color: '#aaa', fontSize: '0.78rem', margin: '4px 0 0' },
  checkLabel: { display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' },
  imgPreview: { width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px', border: '1px solid #eee' },
  pricingGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  pricingCard: {
    backgroundColor: '#fafafa', borderRadius: '12px',
    padding: '20px', border: '1px solid #eee', textAlign: 'center'
  },
  pricingIcon: { fontSize: '2rem', marginBottom: '10px' },
  discountBanner: {
    backgroundColor: '#f6ffed', border: '1px solid #b7eb8f',
    borderRadius: '8px', padding: '12px 16px',
    color: '#389e0d', fontWeight: '600', fontSize: '0.9rem', marginBottom: '20px'
  },
  deliveryCard: {
    backgroundColor: '#fafafa', borderRadius: '14px',
    border: '1px solid #eee', padding: '24px', textAlign: 'center'
  },
  deliveryIcon: { marginBottom: '12px' },
  deliveryPreview: {
    marginTop: '24px', backgroundColor: '#fff',
    borderRadius: '10px', padding: '16px', border: '1px solid #eee', textAlign: 'left'
  },
  deliveryPreviewBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    color: '#333', fontSize: '0.9rem'
  },
  formActions: {
    display: 'flex', gap: '12px', padding: '16px 24px',
    borderTop: '1px solid #eee', flexShrink: 0
  },
  cancelBtn: {
    flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '10px',
    background: '#fff', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600'
  },
  saveBtn: {
    flex: 2, padding: '12px', backgroundColor: 'var(--color-gold-dark)',
    color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer',
    fontSize: '0.95rem', fontWeight: '700', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: '8px'
  }
};

export default AdminProducts;
