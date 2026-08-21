import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Camera, Phone, MapPin, Mail, Save, CheckCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Profile = () => {
  const { user, login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || '',
    phone: user?.phone || '',
    address_line1: user?.address_line1 || '',
    address_line2: user?.address_line2 || '',
    city: user?.city || '',
    state: user?.state || '',
    zip: user?.zip || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        avatar_url: user.avatar_url || '',
        phone: user.phone || '',
        address_line1: user.address_line1 || '',
        address_line2: user.address_line2 || '',
        city: user.city || '',
        state: user.state || '',
        zip: user.zip || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Image Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setUploading(true);
    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, avatar_url: result.url }));
        toast.success('Picture uploaded successfully! Click Save to apply.');
      } else {
        toast.error('Upload failed: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error uploading photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Profile updated successfully! 🎉');
        if (data.user) {
          login(token, data.user);
        }
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while updating profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Please log in to view your profile.</h2>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px', maxWidth: 800 }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-gold-dark)', marginBottom: 20 }}>
        My Profile & Settings
      </h1>

      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        padding: 30
      }}>
        <form onSubmit={handleSubmit}>
          {/* Avatar Upload Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 30 }}>
            <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 15 }}>
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt={formData.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #cca34d'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #b8860b, #cca34d)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '2.5rem',
                  fontWeight: 700
                }}>
                  {formData.name?.charAt(0).toUpperCase() || <User size={48} />}
                </div>
              )}

              {/* Upload Button overlay */}
              <label htmlFor="avatar-file-input" style={{
                position: 'absolute',
                bottom: 0, right: 0,
                background: '#cca34d',
                color: '#fff',
                width: 38, height: 38,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                border: '2px solid #fff'
              }}>
                <Camera size={18} />
              </label>
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>

            <p style={{ margin: 0, color: '#666', fontSize: '0.88rem' }}>
              {uploading ? 'Uploading picture...' : 'Click the camera icon to upload your profile photo'}
            </p>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #eee', background: '#f8f8f8', color: '#888' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }}>Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', outline: 'none' }}
              />
            </div>
          </div>

          <h3 style={{ borderTop: '1px solid #eee', paddingTop: 20, marginTop: 20, marginBottom: 15, fontSize: '1.05rem', color: '#333' }}>
            <MapPin size={18} style={{ verticalAlign: 'middle', marginRight: 6, color: '#cca34d' }} /> Saved Shipping Address
          </h3>

          <div style={{ display: 'grid', gap: 15 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: 4 }}>Address Line 1</label>
              <input
                type="text"
                name="address_line1"
                placeholder="Street address, house no."
                value={formData.address_line1}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: 4 }}>Address Line 2 (Optional)</label>
              <input
                type="text"
                name="address_line2"
                placeholder="Apartment, suite, landmark"
                value={formData.address_line2}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: 4 }}>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Chennai"
                  value={formData.city}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: 4 }}>State</label>
                <input
                  type="text"
                  name="state"
                  placeholder="Tamil Nadu"
                  value={formData.state}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: 4 }}>Pincode / Zip</label>
                <input
                  type="text"
                  name="zip"
                  placeholder="600001"
                  value={formData.zip}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 30, textAlign: 'right' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 28px',
                backgroundColor: '#cca34d',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Save size={18} /> {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
