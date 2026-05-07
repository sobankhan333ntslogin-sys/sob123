'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function Checkout() {
  const { cart, user, clearCart } = useAppContext();
  const router = useRouter();

  const [address, setAddress] = useState({ fullName: '', address: '', city: '', postalCode: '', country: '' });
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
    if (cart.length === 0 && !success) {
      router.push('/');
    }
  }, [user, cart, router, success]);

  if (!user || (cart.length === 0 && !success)) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxPrice = subtotal * 0.1;
  const shippingPrice = subtotal > 100 ? 0 : 10;
  const totalPrice = subtotal + taxPrice + shippingPrice;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const orderItems = cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      image: item.image,
      price: item.price,
      product: item._id
    }));

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderItems,
          shippingAddress: address,
          paymentMethod,
          itemsPrice: subtotal,
          shippingPrice,
          taxPrice,
          totalPrice,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        clearCart();
      } else {
        setError(data.message || 'Failed to place order');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '4rem 0', maxWidth: '600px', margin: '0 auto' }}>
        <CheckCircle size={64} color="var(--secondary)" style={{ margin: '0 auto 1.5rem' }} />
        <h2 className="page-title" style={{ borderBottom: 'none' }}>Order Placed Successfully!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.125rem' }}>
          Thank you for your purchase. We've received your order and will begin processing it right away.
        </p>
        <button onClick={() => router.push('/')} className="btn btn-primary" style={{ fontSize: '1.125rem' }}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h2 className="page-title">Checkout</h2>
      
      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      <div className="cart-grid">
        <div>
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: '600' }}>Shipping Address</h3>
            <form id="checkout-form" onSubmit={handlePlaceOrder}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input required type="text" className="form-input" value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input required type="text" className="form-input" value={address.address} onChange={e => setAddress({...address, address: e.target.value})} />
              </div>
              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input required type="text" className="form-input" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input required type="text" className="form-input" value={address.postalCode} onChange={e => setAddress({...address, postalCode: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input required type="text" className="form-input" value={address.country} onChange={e => setAddress({...address, country: e.target.value})} />
              </div>
            </form>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: '600' }}>Payment Method</h3>
            <div className="form-group">
              <select 
                className="form-input" 
                value={paymentMethod} 
                onChange={e => setPaymentMethod(e.target.value)}
                style={{ appearance: 'none', cursor: 'pointer' }}
              >
                <option value="Credit Card">Credit Card</option>
                <option value="PayPal">PayPal</option>
                <option value="Stripe">Stripe</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <div className="cart-summary">
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Order Summary</h3>
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              {cart.map(item => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-row">
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
              <span>{shippingPrice === 0 ? 'Free' : `$${shippingPrice.toFixed(2)}`}</span>
            </div>
            <div className="summary-row">
              <span style={{ color: 'var(--text-muted)' }}>Tax (10%)</span>
              <span>${taxPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>${totalPrice.toFixed(2)}</span>
            </div>
            <button 
              type="submit"
              form="checkout-form"
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem', fontSize: '1.125rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
