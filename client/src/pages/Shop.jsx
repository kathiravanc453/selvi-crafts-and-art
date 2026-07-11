import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
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

    let url = `/api/products?sort=${s}`;
    if (cat) url += `&category=${cat}`;
    if (q) url += `&search=${q}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(console.error);
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
