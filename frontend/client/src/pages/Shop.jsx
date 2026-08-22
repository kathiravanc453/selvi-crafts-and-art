import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? '' : 'https://selvi-crafts-and-art.onrender.com');

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: 'Handcrafted Temple Earrings',
    slug: 'handcrafted-temple-earrings',
    description: 'Exquisite traditional Indian temple jhumka earrings.',
    price: 599,
    offer_price: 449,
    category_slug: 'jewelry',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'
  },
  {
    id: 2,
    name: 'Terracotta Decorative Pot',
    slug: 'terracotta-decorative-pot',
    description: 'Hand-painted clay vase made by traditional artisans.',
    price: 899,
    offer_price: 699,
    category_slug: 'terracotta-craft',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800'
  },
  {
    id: 3,
    name: 'Silk Thread Bangles Set',
    slug: 'silk-thread-bangles-set',
    description: 'Vibrant handcrafted silk bangles set.',
    price: 399,
    offer_price: 299,
    category_slug: 'jewelry',
    image: 'https://images.unsplash.com/photo-1611591475281-b1c945375d83?w=800'
  },
  {
    id: 4,
    name: 'Handmade Bridal Hair Accessories',
    slug: 'handmade-bridal-hair-accessories',
    description: 'Traditional hair gajra and hairclips.',
    price: 499,
    offer_price: 349,
    category_slug: 'hair-accessories',
    image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800'
  }
];

const Shop = () => {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then(res => (res.ok && res.headers.get('content-type')?.includes('application/json')) ? res.json() : null)
      .then(data => { if (Array.isArray(data) && data.length > 0) setCategories(data); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category') || '';
    const q = params.get('search') || '';
    const s = params.get('sort') || 'newest';
    
    setSelectedCategory(cat);
    setSearch(q);
    setSort(s);

    const loadShared = () => {
      const savedProds = localStorage.getItem('shared_products');
      if (savedProds) {
        try {
          const parsed = JSON.parse(savedProds);
          if (Array.isArray(parsed) && parsed.length > 0) setProducts(parsed);
        } catch(e){}
      }
    };
    loadShared();

    let url = `${API_BASE}/api/products?sort=${s}`;
    if (cat) url += `&category=${cat}`;
    if (q) url += `&search=${q}`;

    fetch(url)
      .then(res => (res.ok && res.headers.get('content-type')?.includes('application/json')) ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(() => {});

    try {
      const bc = new BroadcastChannel('selvi_store_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'PRODUCTS_UPDATED' && Array.isArray(event.data.data)) {
          setProducts(event.data.data);
        }
      };
      return () => bc.close();
    } catch(e){}
  }, [location.search]);

  const updateFilters = (newCat, newSearch, newSort) => {
    const params = new URLSearchParams();
    if (newCat) params.set('category', newCat);
    if (newSearch) params.set('search', newSearch);
    if (newSort !== 'newest') params.set('sort', newSort);
    navigate(`/shop?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters(selectedCategory, search, sort);
  };

  return (
    <div className="container animate-fade-in" style={styles.page}>
      {/* Header removed for cleaner app-like interface */}

      <div className="flex-col-mobile" style={styles.layout}>


        {/* Main Content */}
        <main style={styles.main}>
          <div style={styles.filterBar}>
            <button style={styles.filterBtn} onClick={() => toast('Filter dialog coming soon!')}>
              <SlidersHorizontal size={16} /> Filter
            </button>
            <div style={{ color: '#888', fontSize: '0.85rem' }}>{products.length} products</div>
          </div>

          {products.length > 0 ? (
            <div style={styles.grid}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div style={styles.empty}>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search query.</p>
              <button className="btn-outline" onClick={() => updateFilters('', '', 'newest')} style={{ marginTop: '15px' }}>
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const styles = {
  page: {
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '2.5rem',
    color: 'var(--color-gold-dark)',
    marginBottom: '10px'
  },
  layout: {
    display: 'flex',
    gap: '40px',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  sidebar: {
    flex: '1 1 250px',
    maxWidth: '300px',
    backgroundColor: 'var(--color-cream)',
    padding: '24px',
    borderRadius: 'var(--radius-md)'
  },
  filterSection: {
    marginBottom: '30px'
  },
  filterTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'var(--font-sans)',
    fontSize: '1.1rem',
    marginBottom: '15px',
    color: 'var(--color-text-main)'
  },
  categoryList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  categoryItem: {
    cursor: 'pointer',
    color: 'var(--color-text-muted)',
    transition: 'color var(--transition-fast)'
  },
  main: {
    flex: '3 1 600px'
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0',
    marginBottom: '20px'
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#0056b3', /* Blueish filter text from image */
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: 0
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'var(--color-off-white)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-muted)'
  }
};

export default Shop;
