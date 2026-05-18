import React, { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [query, setQuery]       = useState('');

  const fetchProducts = useCallback(async (q) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await productService.getAll(q);
      setProducts(data.products);
    } catch {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(query);
  }, [query, fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(search.trim());
  };

  return (
    <div className="products-page">
      <div className="container">
        {/* Page header */}
        <div className="products-header">
          <div>
            <h1 className="page-title">Our Products</h1>
            <p className="page-subtitle">
              {query
                ? `Showing results for "${query}"`
                : 'Discover our curated collection of tech essentials'}
            </p>
          </div>

          {/* Search bar */}
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-wrap">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              {query && (
                <button type="button" className="search-clear" onClick={() => { setSearch(''); setQuery(''); }}>
                  ✕
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>

        {/* States */}
        {loading && <div className="spinner" />}

        {error && !loading && (
          <div className="alert alert-error">{error}</div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your search terms.</p>
            {query && (
              <button className="btn btn-secondary" onClick={() => { setSearch(''); setQuery(''); }}>
                Clear Search
              </button>
            )}
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <p className="results-count">{products.length} product{products.length !== 1 ? 's' : ''}</p>
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
