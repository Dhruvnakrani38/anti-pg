import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, LogIn, UserPlus, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border border-gray-100 sticky top-4 z-50 shadow-sm mx-4 sm:mx-6 lg:mx-8 rounded-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 font-bold text-2xl text-primary-900 tracking-tight group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-base font-black shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300">PG</div>
            <span className="hidden sm:block">PG Management</span>
          </Link>

          {/* Nav Links (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:text-primary-700 hover:bg-primary-50 transition-all font-medium">
              <Home size={16} /> Home
            </Link>
            <Link to="/search" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:text-primary-700 hover:bg-primary-50 transition-all font-medium">
              <Search size={16} /> Find PG
            </Link>
          </div>

          {/* Auth Buttons Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to={user.role === 'admin' ? '/admin' : '/owner'} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl transition-all h-10">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all h-10">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-xl transition-all"><LogIn size={16} /> Login</Link>
                <Link to="/register" className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 rounded-xl transition-all duration-300"><UserPlus size={16} /> List Your PG</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl px-4 py-5 space-y-5 shadow-2xl absolute w-full rounded-b-3xl">
          <div className="flex flex-col gap-2">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-base text-gray-700 hover:text-primary-700 hover:bg-primary-50 font-bold transition-all">
              <Home size={20} className="text-primary-600" /> Home
            </Link>
            <Link to="/search" className="flex items-center gap-3 px-4 py-3 rounded-xl text-base text-gray-700 hover:text-primary-700 hover:bg-primary-50 font-bold transition-all">
              <Search size={20} className="text-primary-600" /> Find PG
            </Link>
          </div>
          
          <div className="border-t border-gray-100 pt-5 flex flex-col gap-3">
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin' : '/owner'} className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 transition-all">
                  <LayoutDashboard size={18} /> Dashboard ({user.role})
                </Link>
                <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all w-full text-center">
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all">
                  <LogIn size={18} /> Login
                </Link>
                <Link to="/register" className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold bg-gray-900 text-white hover:bg-gray-800 shadow-xl transition-all">
                  <UserPlus size={18} /> List Your PG
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
