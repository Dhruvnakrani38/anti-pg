import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, LogIn, UserPlus, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-700">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white text-sm font-black">PG</div>
            <span className="hidden sm:block">PG Management</span>
          </Link>

          {/* Nav Links (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all font-medium">
              <Home size={15} /> Home
            </Link>
            <Link to="/search" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all font-medium">
              <Search size={15} /> Find PG
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to={user.role === 'admin' ? '/admin' : '/owner'} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                  <LogOut size={15} /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2 hidden sm:flex"><LogIn size={15} /> Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2"><UserPlus size={15} /> List Your PG</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
