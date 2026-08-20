import bcrypt from 'bcryptjs';
import { run, initDb, query } from './database.js';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seed = async () => {
  try {
    // 1. Initialise the database tables
    await initDb();

    // 2. Ensure uploads directory exists
    const uploadsDir = join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('Created server/uploads directory.');
    }

    console.log('Seeding database...');

    // 3. Seed Users
    const existingAdmin = await query('SELECT * FROM users WHERE email = ?', ['admin@selviarts.com']);
    let adminId;
    if (existingAdmin.length === 0) {
      const adminPassHash = await bcrypt.hash('adminpassword', 10);
      const res = await run(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ["Selvi's Arts & Craft Admin", 'admin@selviarts.com', adminPassHash, 'admin']
      );
      adminId = res.id;
      console.log('Admin user seeded (admin@selviarts.com / adminpassword)');
    } else {
      adminId = existingAdmin[0].id;
    }

    const existingCustomer = await query('SELECT * FROM users WHERE email = ?', ['customer@gmail.com']);
    if (existingCustomer.length === 0) {
      const customerPassHash = await bcrypt.hash('customerpassword', 10);
      await run(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Jane Doe', 'customer@gmail.com', customerPassHash, 'customer']
      );
      console.log('Customer user seeded (customer@gmail.com / customerpassword)');
    }

    // 4. Seed Categories
    const categoriesData = [
      { name: 'Bangles', slug: 'bangles', description: 'Traditional handmade silk thread bangles.', image_url: '/uploads/bangles.png' },
      { name: 'Jewellery', slug: 'jewellery', description: 'Premium handmade necklaces, earrings, and jewelry sets.', image_url: '/uploads/jewellery.png' },
      { name: 'Hair Accessories', slug: 'hair-accessories', description: 'Traditional hair decoration garlands and venis.', image_url: '/uploads/pollen_veni.png' },
      { name: 'Home Decor', slug: 'home-decor', description: 'Handcrafted wire baskets and artistic home items.', image_url: '/uploads/wire_basket.png' }
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      const existingCat = await query('SELECT * FROM categories WHERE slug = ?', [cat.slug]);
      if (existingCat.length === 0) {
        const res = await run(
          'INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)',
          [cat.name, cat.slug, cat.description, cat.image_url]
        );
        categoryMap[cat.slug] = res.id;
      } else {
        categoryMap[cat.slug] = existingCat[0].id;
      }
    }
    console.log('Categories seeded.');

    // 5. Seed Products
    const productsData = [
      {
        name: 'Silk Thread Bangles',
        slug: 'silk-thread-bangles',
        description: 'Exquisitely handcrafted Indian silk thread bangles, wrapped with high-quality silk yarn, and adorned with gold beads and small white Kundan stones. This set of bangles is perfect for weddings, traditional functions, and festivals. Designed to look opulent and feel premium on any wrist size.',
        price: 24.99,
        offer_price: 19.99,
        category_slug: 'bangles',
        stock: 12,
        rating: 4.8,
        image: '/uploads/bangles.png'
      },
      {
        name: 'Silk Thread Jewellery',
        slug: 'silk-thread-jewellery',
        description: 'A beautiful handmade silk thread necklace and matching hanging earrings set. Crafted using blush pink and cream thread with detailed gold beads. Its lightweight design offers comfortable wear while imparting an elegant, ethnic look suitable for special events.',
        price: 49.99,
        offer_price: 39.99,
        category_slug: 'jewellery',
        stock: 4, // Shows "Limited Stock" badge
        rating: 4.9,
        image: '/uploads/jewellery.png'
      },
      {
        name: 'Invisible Chain',
        slug: 'invisible-chain',
        description: 'A minimal, dainty invisible neck chain featuring a single sparkling floating zirconia crystal pendant. It rests gently on the collarbone, giving the appearance of a floating gem. Perfect for minimalist styling or layering with other delicate necklaces.',
        price: 18.00,
        offer_price: 15.00,
        category_slug: 'jewellery',
        stock: 15,
        rating: 4.7,
        image: '/uploads/invisible_chain.png'
      },
      {
        name: 'Artificial Jasmine Flower',
        slug: 'artificial-jasmine-flower',
        description: 'A beautiful, realistic artificial jasmine flower veni (hair garland) for traditional braid styling or bridal buns. Made with premium, soft-touch fabric buds that replicate fresh jasmines, bound together with high-durability green leafy accents.',
        price: 12.99,
        offer_price: 9.99,
        category_slug: 'hair-accessories',
        stock: 25,
        rating: 4.6,
        image: '/uploads/jasmine_flower.png'
      },
      {
        name: 'Wire Basket',
        slug: 'wire-basket',
        description: 'An elegant, gold-plated iron wire basket featuring a geometric woven wire design. Ideal for storing yarn, magazines, craft tools, or displaying fruits on the table. Adds a contemporary and premium touch to your workspace or home decor.',
        price: 34.99,
        offer_price: 29.99,
        category_slug: 'home-decor',
        stock: 8,
        rating: 4.5,
        image: '/uploads/wire_basket.png'
      },
      {
        name: 'Artificial Pollen Veni',
        slug: 'artificial-pollen-veni',
        description: 'A traditional Indian hair decoration garland featuring handcrafted soft pollen buds in cream and soft pink, highlighting delicate gold thread details. It creates a lush and colorful addition to bridal hairstyles.',
        price: 15.50,
        offer_price: 12.99,
        category_slug: 'hair-accessories',
        stock: 3, // Shows "Limited Stock" badge
        rating: 4.8,
        image: '/uploads/pollen_veni.png'
      }
    ];

    for (const prod of productsData) {
      const existingProd = await query('SELECT * FROM products WHERE slug = ?', [prod.slug]);
      if (existingProd.length === 0) {
        const catId = categoryMap[prod.category_slug];
        const res = await run(
          'INSERT INTO products (name, slug, description, price, offer_price, category_id, stock, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [prod.name, prod.slug, prod.description, prod.price, prod.offer_price, catId, prod.stock, prod.rating]
        );
        // Add product image
        await run(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
          [res.id, prod.image, 1]
        );
        // Add an extra image for product details gallery demo
        await run(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
          [res.id, prod.image, 0]
        );
      }
    }
    console.log('Products seeded.');

    // 6. Seed Banners
    const existingBanners = await query('SELECT * FROM banners');
    if (existingBanners.length === 0) {
      await run(
        'INSERT INTO banners (image_url, title, subtitle, link, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?)',
        ['/uploads/bangles.png', 'Elegance Redefined', 'Exquisite Handmade Silk Thread Jewellery & Accessories', '/shop', 1, 0]
      );
      await run(
        'INSERT INTO banners (image_url, title, subtitle, link, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?)',
        ['/uploads/wire_basket.png', 'Modern Handmade Home Decor', 'Elegant wire baskets, crafts, and unique accents.', '/shop?category=home-decor', 1, 1]
      );
      console.log('Homepage banners seeded.');
    }

    // 7. Seed Offers
    const existingOffers = await query('SELECT * FROM offers');
    if (existingOffers.length === 0) {
      await run(
        'INSERT INTO offers (code, discount_type, discount_value, min_order_amount, is_active) VALUES (?, ?, ?, ?, ?)',
        ['WELCOME10', 'percentage', 10.0, 0.0, 1]
      );
      await run(
        'INSERT INTO offers (code, discount_type, discount_value, min_order_amount, is_active) VALUES (?, ?, ?, ?, ?)',
        ['CRAFTGOLD', 'fixed', 15.0, 100.0, 1]
      );
      console.log('Promo offers seeded.');
    }

    console.log('Database seeding successfully finished!');
  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
};

seed();
