import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white text-sm font-black">PG</div>
              <span className="text-white font-bold text-lg">PG Management</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">Your one-stop platform to find the perfect PG accommodation or manage your PG business efficiently.</p>
          </div>
          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/search" className="hover:text-white transition-colors">Find PG</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">List Your PG</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-5 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} PG Management. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
