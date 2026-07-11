import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query, queryOne, run } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, 'uploads')));

import multer from 'multer';
import fs from 'fs';
const uploadDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage });

// --- ADMIN FILE UPLOAD ROUTE ---
app.post('/api/admin/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

const JWT_SECRET = 'super-secret-key-for-selvi-arts';

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Middleware to verify Admin
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Requires admin privileges.' });
  }
};

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await queryOne('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    
    const hash = await bcrypt.hash(password, 10);
    const result = await run('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hash]);
    
    const token = jwt.sign({ id: result.id, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: result.id, name, email, role: 'customer' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await queryOne('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await queryOne('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PUBLIC ROUTES (Products, Categories, Banners, Offers) ---
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await query('SELECT * FROM categories');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let sql = `
      SELECT p.*, c.slug as category_slug, 
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    const params = [];

    if (category) {
      sql += ' AND c.slug = ?';
      params.push(category);
    }
    if (search) {
      sql += ' AND p.name LIKE ?';
      params.push(`%${search}%`);
    }

    if (sort === 'price_asc') sql += ' ORDER BY p.price ASC';
    else if (sort === 'price_desc') sql += ' ORDER BY p.price DESC';
    else if (sort === 'newest') sql += ' ORDER BY p.created_at DESC';
    else sql += ' ORDER BY p.created_at DESC'; // default

    const products = await query(sql, params);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:slug', async (req, res) => {
  try {
    const product = await queryOne(`
      SELECT p.*, c.name as category_name, c.slug as category_slug 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.is_active = 1
    `, [req.params.slug]);
    
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const images = await query('SELECT image_url, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC', [product.id]);
    product.images = images;
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/banners', async (req, res) => {
  try {
    const banners = await query('SELECT * FROM banners WHERE is_active = 1 ORDER BY display_order ASC');
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/offers', async (req, res) => {
  try {
    const offers = await query('SELECT * FROM offers WHERE is_active = 1');
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN PRODUCT MANAGEMENT ROUTES ---

// Admin: Get all products
app.get('/api/admin/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const products = await query(`
      SELECT p.*, c.name as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get single product by ID (with images)
app.get('/api/admin/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await queryOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const images = await query('SELECT * FROM product_images WHERE product_id = ?', [req.params.id]);
    product.images = images;
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Create product
app.post('/api/admin/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, slug, description, price, offer_price, category_id, stock, is_active, shipping_days, shipping_info, image_url } = req.body;
    const result = await run(`
      INSERT INTO products (name, slug, description, price, offer_price, category_id, stock, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, slug || name.toLowerCase().replace(/\s+/g, '-'), description, price, offer_price || null, category_id || null, stock || 0, is_active !== false ? 1 : 0]);

    if (image_url) {
      await run('INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, 1)', [result.id, image_url]);
    }
    res.status(201).json({ message: 'Product created', id: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update product
app.put('/api/admin/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, slug, description, price, offer_price, category_id, stock, is_active, image_url } = req.body;
    await run(`
      UPDATE products SET
        name = ?, slug = ?, description = ?, price = ?, offer_price = ?,
        category_id = ?, stock = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, slug, description, parseFloat(price), offer_price ? parseFloat(offer_price) : null,
        category_id || null, parseInt(stock), is_active ? 1 : 0, req.params.id]);

    if (image_url) {
      // Update primary image
      const existing = await queryOne('SELECT id FROM product_images WHERE product_id = ? AND is_primary = 1', [req.params.id]);
      if (existing) {
        await run('UPDATE product_images SET image_url = ? WHERE id = ?', [image_url, existing.id]);
      } else {
        await run('INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, 1)', [req.params.id, image_url]);
      }
    }
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete product
app.delete('/api/admin/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await run('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all categories (for product form dropdown)
app.get('/api/admin/categories', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const cats = await query('SELECT * FROM categories');
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all customers
app.get('/api/admin/customers', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Categories CRUD
app.post('/api/admin/categories', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, slug, description, image_url } = req.body;
    const s = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const result = await run('INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)', [name, s, description, image_url]);
    res.status(201).json({ id: result.id, name, slug: s, description, image_url });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/categories/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, slug, description, image_url } = req.body;
    await run('UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ? WHERE id = ?', [name, slug, description, image_url, req.params.id]);
    res.json({ message: 'Category updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/categories/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin Offers CRUD
app.get('/api/admin/offers', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const offers = await query('SELECT * FROM offers');
    res.json(offers);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/offers', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, code, discount_percent, valid_until, is_active } = req.body;
    await run('INSERT INTO offers (title, description, code, discount_percent, valid_until, is_active) VALUES (?, ?, ?, ?, ?, ?)', 
      [title, description, code, discount_percent, valid_until, is_active ? 1 : 0]);
    res.status(201).json({ message: 'Offer created' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/offers/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, code, discount_percent, valid_until, is_active } = req.body;
    await run('UPDATE offers SET title = ?, description = ?, code = ?, discount_percent = ?, valid_until = ?, is_active = ? WHERE id = ?', 
      [title, description, code, discount_percent, valid_until, is_active ? 1 : 0, req.params.id]);
    res.json({ message: 'Offer updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/offers/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await run('DELETE FROM offers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Offer deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin Banners CRUD
app.get('/api/admin/banners', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const banners = await query('SELECT * FROM banners ORDER BY display_order ASC');
    res.json(banners);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/banners', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, subtitle, image_url, link_url, display_order, is_active } = req.body;
    await run('INSERT INTO banners (title, subtitle, image_url, link_url, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?)', 
      [title, subtitle, image_url, link_url, display_order, is_active ? 1 : 0]);
    res.status(201).json({ message: 'Banner created' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/banners/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, subtitle, image_url, link_url, display_order, is_active } = req.body;
    await run('UPDATE banners SET title = ?, subtitle = ?, image_url = ?, link_url = ?, display_order = ?, is_active = ? WHERE id = ?', 
      [title, subtitle, image_url, link_url, display_order, is_active ? 1 : 0, req.params.id]);
    res.json({ message: 'Banner updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/banners/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await run('DELETE FROM banners WHERE id = ?', [req.params.id]);
    res.json({ message: 'Banner deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- CART & WISHLIST ROUTES (Require Auth) ---
app.get('/api/cart', authMiddleware, async (req, res) => {
  try {
    const cartItems = await query(`
      SELECT c.id as cart_id, c.quantity, p.*, 
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [req.user.id]);
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cart', authMiddleware, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const existing = await queryOne('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [req.user.id, product_id]);
    if (existing) {
      await run('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [quantity, existing.id]);
    } else {
      await run('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [req.user.id, product_id, quantity]);
    }
    res.status(201).json({ message: 'Added to cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cart/:id', authMiddleware, async (req, res) => {
  try {
    // Note: id here is cart.id
    await run('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Removed from cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cart/:id', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    await run('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.user.id]);
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- ORDERS ROUTES ---
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { total_amount, shipping_fee, discount_amount, coupon_code, payment_method, shippingDetails, items } = req.body;
    
    const orderRes = await run(`
      INSERT INTO orders (
        user_id, total_amount, shipping_fee, discount_amount, coupon_code, payment_method,
        shipping_name, shipping_email, shipping_phone, shipping_address_line1, shipping_address_line2,
        shipping_city, shipping_state, shipping_zip
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id, total_amount, shipping_fee, discount_amount, coupon_code, payment_method,
      shippingDetails.name, shippingDetails.email, shippingDetails.phone, shippingDetails.address1, shippingDetails.address2,
      shippingDetails.city, shippingDetails.state, shippingDetails.zip
    ]);

    for (const item of items) {
      await run('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [
        orderRes.id, item.id, item.quantity, item.price
      ]);
      await run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
    }

    await run('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.status(201).json({ message: 'Order placed successfully', order_id: orderRes.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User: Get all my orders
app.get('/api/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User: Get single order by ID (for order tracking)
app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  try {
    const order = await queryOne('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const items = await query(`
      SELECT oi.*, p.name, p.slug,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [req.params.id]);

    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all orders
app.get('/api/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get single order details (items)
app.get('/api/admin/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const order = await queryOne('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const items = await query(`
      SELECT oi.*, p.name, p.slug,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [req.params.id]);

    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update order status
app.put('/api/orders/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    await run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
