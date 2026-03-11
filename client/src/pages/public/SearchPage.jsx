import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { publicService } from '../../services/services';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PGCard from '../../components/public/PGCard';

const AMENITY_OPTIONS = ['WiFi', 'AC', 'Meals', 'Laundry', 'CCTV', 'Parking', 'Gym'];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pgs, setPGs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    minRent: '', maxRent: '', amenities: '', sort: 'newest', available: '',
  });

  const fetchPGs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await publicService.searchPGs(params);
      setPGs(res.data.pgs);
      setTotal(res.data.total);
    } catch { } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchPGs(); }, [fetchPGs]);

  const updateFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Search Header */}
      <div className="bg-white border-b border-gray-100 py-4 px-4 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex gap-3 flex-wrap items-center">
          <div className="flex-1 min-w-64 relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input className="input pl-9" placeholder="Search city or locality..." value={filters.city}
              onChange={e => updateFilter('city', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchPGs()} />
          </div>
          <select className="input w-auto min-w-36" value={filters.category} onChange={e => updateFilter('category', e.target.value)}>
            <option value="">All Types</option>
            <option value="boys">Boys PG</option>
            <option value="girls">Girls PG</option>
            <option value="coed">Co-ed</option>
            <option value="couple">Couple Friendly</option>
          </select>
          <select className="input w-auto" value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
          <button onClick={() => setShowFilters(v => !v)} className="btn-secondary py-2.5 gap-2">
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-4 items-end">
            <div>
              <label className="label text-xs">Min Rent (₹)</label>
              <input type="number" className="input w-32 text-sm" placeholder="2000" value={filters.minRent} onChange={e => updateFilter('minRent', e.target.value)} />
            </div>
            <div>
              <label className="label text-xs">Max Rent (₹)</label>
              <input type="number" className="input w-32 text-sm" placeholder="20000" value={filters.maxRent} onChange={e => updateFilter('maxRent', e.target.value)} />
            </div>
            <div>
              <label className="label text-xs">Amenities</label>
              <select className="input w-auto text-sm" onChange={e => updateFilter('amenities', e.target.value)}>
                <option value="">Any</option>
                {AMENITY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-xs">Availability</label>
              <select className="input w-auto text-sm" value={filters.available} onChange={e => updateFilter('available', e.target.value)}>
                <option value="">Any</option>
                <option value="true">Available Now</option>
              </select>
            </div>
            <button onClick={() => setFilters({ city: '', category: '', minRent: '', maxRent: '', amenities: '', sort: 'newest', available: '' })} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors py-1">
              <X size={14} /> Clear All
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1">
        <div className="mb-4 text-sm text-gray-500">{loading ? 'Searching...' : `${total} PG${total !== 1 ? 's' : ''} found`}</div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card p-0 overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : pgs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No PGs found</h3>
            <p className="text-gray-400">Try changing your search filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {pgs.map(pg => <PGCard key={pg._id} pg={pg} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
