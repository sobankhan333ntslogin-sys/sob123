'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart, user } = useAppContext();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setProducts(data);
          setError(null);
        } else {
          console.error('API Error:', data.message);
          setError(data.message || 'Failed to connect to database. Have you configured your MongoDB URI?');
          setProducts([]);
        }
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to fetch products', err);
        setError('Network error. Check console for details.');
        setProducts([]);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (!user) {
    return (
      <div>
        <section className="hero fade-in">
          <h1 className="hero-title">Welcome to NexCommerce</h1>
          <p className="hero-subtitle">Discover premium products curated just for you. Quality, style, and performance delivered to your door.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <Link href="/login" className="btn btn-primary" style={{ fontSize: '1.125rem' }}>
              Log In to Shop
            </Link>
            <Link href="/signup" className="btn btn-secondary" style={{ fontSize: '1.125rem' }}>
              Create Account
            </Link>
          </div>
        </section>

        <section style={{ marginTop: '4rem', padding: '4rem 0', backgroundColor: 'var(--surface)', borderRadius: '1rem', textAlign: 'center' }} className="fade-in">
          <h2 className="page-title" style={{ borderBottom: 'none', marginBottom: '2rem' }}>Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '2rem', padding: '0 2rem' }}>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Fast Delivery</h3>
              <p style={{ color: 'var(--text-muted)' }}>Get your products delivered to your doorstep in record time.</p>
            </div>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Secure Checkout</h3>
              <p style={{ color: 'var(--text-muted)' }}>We ensure your data and payment details are safe.</p>
            </div>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Premium Quality</h3>
              <p style={{ color: 'var(--text-muted)' }}>We only source the best materials for our products.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="hero fade-in" style={{ padding: '2rem 0' }}>
        <h1 className="hero-title" style={{ fontSize: '2.5rem' }}>Welcome back, {user.name}!</h1>
        <p className="hero-subtitle">Check out our latest featured products.</p>
      </section>

      <section id="products" style={{ marginTop: '2rem' }}>
        <h2 className="page-title" style={{ borderBottom: 'none', textAlign: 'center', marginBottom: '3rem' }}>
          Featured Products
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', fontSize: '1.25rem', color: 'var(--text-muted)' }}>
            Loading products...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', fontSize: '1.125rem', color: 'var(--danger)', padding: '2rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '1rem', border: '1px solid rgba(239,68,68,0.2)' }}>
            <strong>Error loading products:</strong> {error}
            <br/><br/>
            Please ensure you have configured your <code>MONGODB_URI</code> correctly in your <code>.env</code> file.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: '1.5rem' }}>
            {products.map((product, index) => (
              <div key={product._id} className="card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="card-img-wrapper" style={{ paddingTop: '75%' }}>
                  <img src={product.image} alt={product.name} className="card-img" />
                </div>
                <div className="card-body" style={{ padding: '1rem' }}>
                  <h3 className="card-title" style={{ fontSize: '1rem' }}>{product.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: '#FBBF24' }}>★</span> {product.rating} ({product.numReviews})
                  </div>
                  <p className="card-price" style={{ fontSize: '1.125rem' }}>${product.price.toFixed(2)}</p>
                  
                  <button 
                    onClick={() => addToCart(product)}
                    className="btn btn-primary card-btn"
                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.875rem' }}
                  >
                    <ShoppingBag size={16} /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
