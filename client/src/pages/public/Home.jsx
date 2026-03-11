import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Wifi, Shield, DollarSign, ChevronRight, Building2, Users, TrendingUp } from 'lucide-react';
import { publicService } from '../../services/services';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PGCard from '../../components/public/PGCard';

const AMENITY_ICONS = { WiFi: Wifi, CCTV: Shield };
const CATEGORIES = [
  { id: 'boys', label: "Boys PG", emoji: "👦", color: "from-blue-500 to-blue-700" },
  { id: 'girls', label: "Girls PG", emoji: "👧", color: "from-pink-500 to-pink-700" },
  { id: 'coed', label: "Co-ed PG", emoji: "🏠", color: "from-purple-500 to-purple-700" },
  { id: 'couple', label: "For Couples", emoji: "💑", color: "from-rose-500 to-rose-700" },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [stats, setStats] = useState({ totalPGs: 0, totalCities: 0, totalSearches: 0 });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    publicService.getFeatured().then(r => setFeatured(r.data.pgs)).catch(() => {});
    publicService.getStats().then(r => setStats(r.data.stats)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?city=${encodeURIComponent(search.trim())}`);
    else navigate('/search');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient text-white pt-20 pb-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent-500 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm mb-6 border border-white/20">
            <Star size={14} className="text-yellow-300" /> Trusted by 1000+ tenants
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 leading-tight">
            Find Your Perfect <span className="text-yellow-300">PG</span> Today
          </h1>
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">Search from hundreds of verified paying guest accommodations across India. Safe, affordable, and convenient.</p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-2 flex-1 px-3">
                <MapPin size={18} className="text-gray-400 flex-shrink-0" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by city, locality..." className="flex-1 outline-none text-gray-800 text-sm font-medium placeholder-gray-400" />
              </div>
              <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all flex-shrink-0">
                <Search size={17} /> Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white -mt-12 mx-4 sm:mx-auto max-w-4xl rounded-2xl shadow-xl p-6 grid grid-cols-3 gap-4 relative z-10">
        {[
          { label: 'PGs Listed', value: stats.totalPGs + '+', icon: Building2, color: 'text-primary-600' },
          { label: 'Cities', value: stats.totalCities + '+', icon: MapPin, color: 'text-green-600' },
          { label: 'Searches Done', value: stats.totalSearches + '+', icon: TrendingUp, color: 'text-purple-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="text-center">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 mb-2 ${color}`}><Icon size={20} /></div>
            <div className="text-2xl font-extrabold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by Category</h2>
        <p className="text-gray-500 mb-7">Find PGs tailored to your specific needs</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map(c => (
            <Link key={c.id} to={`/search?category=${c.id}`}
              className={`bg-gradient-to-br ${c.color} text-white rounded-2xl p-6 text-center hover:scale-105 transition-all shadow-lg cursor-pointer`}>
              <div className="text-4xl mb-2">{c.emoji}</div>
              <div className="font-semibold text-sm">{c.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured PGs */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-16">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured PGs</h2>
              <p className="text-gray-500 mt-1">Top-rated accommodations near you</p>
            </div>
            <Link to="/search" className="flex items-center gap-1 text-primary-600 font-semibold text-sm hover:gap-2 transition-all">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {featured.slice(0, 8).map(pg => <PGCard key={pg._id} pg={pg} />)}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="bg-gray-900 text-white mt-20 py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">How It Works</h2>
          <p className="text-gray-400 mb-12">Simple steps to find or list a PG</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Search', desc: 'Filter by city, budget, type, and amenities to find your ideal PG', icon: Search },
              { step: '02', title: 'Contact Owner', desc: 'View full details, photos, and directly contact the PG owner', icon: Users },
              { step: '03', title: 'Move In', desc: 'Visit the PG, finalize details, and start your comfortable stay', icon: Building2 },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-4 text-2xl font-black">{step}</div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - List your PG */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 my-16">
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl p-10 text-white text-center shadow-xl">
          <h2 className="text-3xl font-bold mb-3">Own a PG? List it for Free!</h2>
          <p className="text-blue-100 mb-7 max-w-lg mx-auto">Join hundreds of PG owners who use our platform to manage tenants, rooms, and finances effortlessly.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg">
              List Your PG Free
            </Link>
            <Link to="/search" className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-all">
              Browse PGs
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
