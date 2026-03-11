import { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/services';
import { format } from 'date-fns';

export default function AdminOwners() {
  const [owners, setOwners] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async (q = search) => {
    setLoading(true);
    try {
      const res = await adminService.getAllOwners({ search: q, limit: 50 });
      setOwners(res.data.owners);
      setTotal(res.data.total);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    try { await adminService.toggleOwnerStatus(id); toast.success('Owner status updated'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Owners</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} registered owners</p>
        </div>
        <div className="flex items-center gap-2">
          <input className="input w-64 text-sm" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
        </div>
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-primary-600"></div></div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Owner', 'Contact', 'PGs', 'Active Tenants', 'Joined', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {owners.map(o => (
                  <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">{o.name.charAt(0)}</div>
                        <div>
                          <div className="font-semibold text-sm text-gray-900">{o.name}</div>
                          <div className="text-xs text-gray-400">{o.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-500">{o.phone}</td>
                    <td className="py-3 pr-4 text-sm font-semibold text-primary-600">{o.pgCount}</td>
                    <td className="py-3 pr-4 text-sm text-gray-600">{o.tenantCount}</td>
                    <td className="py-3 pr-4 text-sm text-gray-400">{o.createdAt ? format(new Date(o.createdAt), 'dd MMM yyyy') : '-'}</td>
                    <td className="py-3 pr-4"><span className={o.isActive ? 'badge-active' : 'badge-inactive'}>{o.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="py-3">
                      <button onClick={() => toggle(o._id)} className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg border transition-all ${o.isActive ? 'text-red-500 border-red-100 hover:bg-red-50' : 'text-green-600 border-green-100 hover:bg-green-50'}`}>
                        {o.isActive ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                        {o.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {owners.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-gray-400 text-sm">No owners found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
