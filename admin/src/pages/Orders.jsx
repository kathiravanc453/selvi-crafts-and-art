import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, MapPin, Phone, Mail, CreditCard, Package, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const token = () => localStorage.getItem('admin_token');
const headers = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

const STATUS_COLORS = {
  pending:    { bg:'#fff7e6', color:'#d48806', border:'#ffd591' },
  confirmed:  { bg:'#e6f7ff', color:'#1677ff', border:'#91d5ff' },
  processing: { bg:'#f9f0ff', color:'#722ed1', border:'#d3adf7' },
  shipped:    { bg:'#f0f5ff', color:'#2f54eb', border:'#adc6ff' },
  delivered:  { bg:'#f6ffed', color:'#389e0d', border:'#b7eb8f' },
  cancelled:  { bg:'#fff1f0', color:'#cf1322', border:'#ffa39e' },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [itemsMap, setItemsMap] = useState({});
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = () => {
    fetch('/api/orders', { headers: headers() })
      .then(r => r.json())
      .then(d => { setOrders(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchItems = async (id) => {
    if (itemsMap[id]) return;
    const res = await fetch(`/api/admin/orders/${id}`, { headers: headers() });
    const data = await res.json();
    setItemsMap(prev => ({ ...prev, [id]: data.items || [] }));
  };

  const toggle = (id) => {
    setExpanded(expanded === id ? null : id);
    fetchItems(id);
  };

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/orders/${id}/status`, { method:'PUT', headers: headers(), body: JSON.stringify({ status }) });
    if (res.ok) { toast.success(`Order #${id} → ${status}`); setOrders(prev => prev.map(o => o.id===id ? {...o, status} : o)); }
    else toast.error('Failed to update');
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const allStatuses = ['all','pending','confirmed','processing','shipped','delivered','cancelled'];

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div><h1 className="page-title">Orders</h1><p className="page-subtitle">{orders.length} total orders</p></div>
        <button className="btn btn-outline" onClick={fetchOrders}><RefreshCw size={16} />Refresh</button>
      </div>

      {/* Filter Pills */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
        {allStatuses.map(s => {
          const count = s==='all' ? orders.length : orders.filter(o=>o.status===s).length;
          return (
            <button key={s} onClick={()=>setFilter(s)} style={{
              padding:'7px 16px', borderRadius:20, border:'1.5px solid',
              borderColor: filter===s ? '#8b6914' : '#e8e8e8',
              background: filter===s ? '#8b6914' : '#fff',
              color: filter===s ? '#fff' : '#555',
              fontWeight: filter===s ? 700 : 500, fontSize:'0.82rem', cursor:'pointer'
            }}>
              {s.charAt(0).toUpperCase()+s.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {loading ? <div className="empty-state">Loading orders...</div> : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {filtered.length === 0 ? (
            <div className="card empty-state"><Package size={40} color="#ddd" /><p style={{ marginTop:12 }}>No orders in this category</p></div>
          ) : filtered.map(o => {
            const st = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
            const isOpen = expanded === o.id;
            return (
              <div key={o.id} className="card" style={{ padding:0, overflow:'hidden' }}>
                {/* Header */}
                <div onClick={()=>toggle(o.id)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', cursor:'pointer', flexWrap:'wrap', gap:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                    <span style={{ fontWeight:800, color:'#8b6914', fontSize:'1.05rem', minWidth:40 }}>#{o.id}</span>
                    <div>
                      <p style={{ fontWeight:700, margin:0, fontSize:'0.95rem' }}>{o.shipping_name}</p>
                      <p style={{ color:'#aaa', fontSize:'0.78rem', margin:'2px 0 0' }}>
                        {new Date(o.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                    <span style={{ fontWeight:700, fontSize:'1rem' }}>Rs. {parseFloat(o.total_amount).toFixed(2)}</span>
                    <span className="badge-status" style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}` }}>
                      {o.status.charAt(0).toUpperCase()+o.status.slice(1)}
                    </span>
                    <select value={o.status} onClick={e=>e.stopPropagation()} onChange={e=>{e.stopPropagation();updateStatus(o.id,e.target.value)}}
                      style={{ padding:'7px 12px', borderRadius:8, border:'1.5px solid #e8e8e8', fontSize:'0.85rem', cursor:'pointer', background:'#fafafa' }}>
                      {['pending','confirmed','processing','shipped','delivered','cancelled'].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                    </select>
                    {isOpen ? <ChevronUp size={18} color="#aaa"/> : <ChevronDown size={18} color="#aaa"/>}
                  </div>
                </div>

                {/* Expanded Panel */}
                {isOpen && (
                  <div style={{ padding:'20px 24px', borderTop:'1px solid #f5f5f5', background:'#fafafa' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:20 }}>
                      {/* Customer */}
                      <div style={{ background:'#fff', borderRadius:10, padding:16, border:'1px solid #eee' }}>
                        <h4 style={{ fontWeight:700, fontSize:'0.83rem', color:'#555', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}><Users size={14}/>Customer</h4>
                        <p style={{ fontSize:'0.85rem', color:'#666', margin:'4px 0', display:'flex', alignItems:'center', gap:6 }}><Mail size={13}/>{o.shipping_email}</p>
                        <p style={{ fontSize:'0.85rem', color:'#666', margin:'4px 0', display:'flex', alignItems:'center', gap:6 }}><Phone size={13}/>{o.shipping_phone}</p>
                        <p style={{ fontSize:'0.85rem', color:'#666', margin:'4px 0', display:'flex', alignItems:'center', gap:6 }}><CreditCard size={13}/>{o.payment_method?.toUpperCase()}</p>
                      </div>
                      {/* Address */}
                      <div style={{ background:'#fff', borderRadius:10, padding:16, border:'1px solid #eee' }}>
                        <h4 style={{ fontWeight:700, fontSize:'0.83rem', color:'#555', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}><MapPin size={14}/>Shipping Address</h4>
                        <p style={{ fontSize:'0.85rem', color:'#666', margin:'4px 0' }}>{o.shipping_address_line1}</p>
                        {o.shipping_address_line2 && <p style={{ fontSize:'0.85rem', color:'#666', margin:'4px 0' }}>{o.shipping_address_line2}</p>}
                        <p style={{ fontSize:'0.85rem', color:'#666', margin:'4px 0' }}>{o.shipping_city}, {o.shipping_state} — {o.shipping_zip}</p>
                      </div>
                      {/* Price Summary */}
                      <div style={{ background:'#fff', borderRadius:10, padding:16, border:'1px solid #eee' }}>
                        <h4 style={{ fontWeight:700, fontSize:'0.83rem', color:'#555', marginBottom:10 }}>💰 Price Summary</h4>
                        {[
                          ['Subtotal', `Rs. ${(parseFloat(o.total_amount)-parseFloat(o.shipping_fee||0)+parseFloat(o.discount_amount||0)).toFixed(2)}`],
                          o.discount_amount>0 && ['Discount', `-Rs. ${parseFloat(o.discount_amount).toFixed(2)}`, {color:'green'}],
                          ['Shipping', `Rs. ${parseFloat(o.shipping_fee||0).toFixed(2)}`],
                        ].filter(Boolean).map(([k,v,s={}])=>(
                          <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem', padding:'3px 0', ...s }}><span>{k}</span><span>{v}</span></div>
                        ))}
                        <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, color:'#8b6914', borderTop:'1px solid #eee', paddingTop:8, marginTop:6 }}>
                          <span>Total</span><span>Rs. {parseFloat(o.total_amount).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Items */}
                    <h4 style={{ fontWeight:700, fontSize:'0.83rem', color:'#555', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}><Package size={14}/>Items Ordered</h4>
                    {itemsMap[o.id] ? itemsMap[o.id].map(item=>(
                      <div key={item.id} style={{ display:'flex', alignItems:'center', gap:12, padding:10, background:'#fff', borderRadius:8, border:'1px solid #f0f0f0', marginBottom:8 }}>
                        <img src={item.image?`http://localhost:5000${item.image}`:''} alt={item.name} style={{ width:52, height:52, objectFit:'cover', borderRadius:8, border:'1px solid #eee' }} onError={e=>e.target.style.display='none'}/>
                        <div style={{ flex:1 }}>
                          <p style={{ fontWeight:700, margin:0, fontSize:'0.9rem' }}>{item.name}</p>
                          <p style={{ color:'#aaa', fontSize:'0.8rem', margin:'2px 0 0' }}>Qty: {item.quantity}</p>
                        </div>
                        <p style={{ fontWeight:700, color:'#8b6914', fontSize:'0.95rem' }}>Rs. {(item.quantity*parseFloat(item.price)).toFixed(2)}</p>
                      </div>
                    )) : <p style={{ color:'#aaa', fontSize:'0.85rem' }}>Loading items...</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
