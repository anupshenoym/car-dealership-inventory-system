import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Car, LayoutDashboard, LogOut, Shield, PlusCircle } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)'
          }}>
            <Car size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>
            AutoVault
          </span>
        </Link>

        {/* Nav Links */}
        {isAuthenticated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, color: 'var(--color-muted)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}>
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, color: 'var(--color-muted)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}>
                <Shield size={16} />
                Admin
              </Link>
            )}
          </div>
        )}

        {/* User Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isAuthenticated ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: 'white'
                }}>
                  {user?.email[0].toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2 }}>
                    {user?.email.split('@')[0]}
                  </span>
                  {user?.role === 'admin' && (
                    <span style={{ fontSize: '0.65rem', color: '#a5b4fc', fontWeight: 600 }}>ADMIN</span>
                  )}
                </div>
              </div>
              <button onClick={handleLogout} className="btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: '0.85rem' }}>
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"><button className="btn-outline" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>Login</button></Link>
              <Link to="/register"><button className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}><PlusCircle size={15} />Register</button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
