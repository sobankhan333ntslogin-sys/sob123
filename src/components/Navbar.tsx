'use client';

import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User as UserIcon, LogOut } from 'lucide-react';

export default function Navbar() {
  const { cart, user, setUser } = useAppContext();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout failed');
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link href="/" className="nav-logo">
          NexCommerce
        </Link>
        <div className="nav-links">
          <Link href="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: 'var(--danger)',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserIcon size={20} />
                {user.name}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="nav-btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--primary)' }}>
                Log In
              </Link>
              <Link href="/signup" className="nav-btn">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
