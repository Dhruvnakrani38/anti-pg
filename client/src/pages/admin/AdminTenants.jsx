import { useState, useEffect } from 'react';
import { adminService } from '../../services/services';
import { format } from 'date-fns';

export default function AdminTenants() {
  const [tenants, setTenants] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async (q = search) => {
    setLoading(true);
    try { const res = await adminService.getAllTenants({ search: q, limit: 50 }); setTenants(res.data.tenants); setTotal(res.data.total); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">All Tenants</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} tenants across all PGs</p>
        </div>
        <input className="input w-64 text-sm" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-primary-600"></div></div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Tenant', 'Phone', 'PG', 'Room', 'Owner', 'Join Date', 'Rent', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tenants.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-bold text-sm flex items-center justify-center flex-shrink-0">{t.name.charAt(0)}</div>
                        <span className="font-medium text-sm text-gray-900">{t.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-500">{t.phone}</td>
                    <td className="py-3 pr-4 text-sm text-gray-600">{t.pg?.name}</td>
                    <td className="py-3 pr-4 text-sm text-gray-500">Room {t.room?.roomNumber}</td>
                    <td className="py-3 pr-4 text-sm text-gray-500">{t.owner?.name}</td>
                    <td className="py-3 pr-4 text-sm text-gray-400">{t.joinDate ? format(new Date(t.joinDate), 'dd MMM yy') : '-'}</td>
                    <td className="py-3 pr-4 text-sm font-semibold text-gray-700">₹{t.rentAmount?.toLocaleString()}</td>
                    <td className="py-3"><span className={t.status === 'active' ? 'badge-active' : 'badge-inactive'}>{t.status}</span></td>
                  </tr>
                ))}
                {tenants.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-gray-400 text-sm">No tenants found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
