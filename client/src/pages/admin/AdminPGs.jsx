import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/services';

const STATUS_BADGE = { active: 'badge-active', inactive: 'badge-inactive', pending: 'badge-pending', rejected: 'badge-rejected' };

export default function AdminPGs() {
  const [pgs, setPGs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = async (status = filter) => {
    setLoading(true);
    const res = await adminService.getAllPGs({ status, limit: 50 });
    setPGs(res.data.pgs);
    setTotal(res.data.total);
    setLoading(false);
  };
  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status, reason = '') => {
    try {
      await adminService.updatePGStatus(id, { status, rejectionReason: reason });
      toast.success(`PG ${status}`);
      load();
    } catch { toast.error('Failed'); }
  };

  const deletePG = async (id) => {
    if (!window.confirm('Permanently delete this PG?')) return;
    try { await adminService.deletePG(id); toast.success('PG deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage All PGs</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} total PGs on platform</p>
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {[['', 'All'], ['pending', 'Pending'], ['active', 'Active'], ['inactive', 'Inactive'], ['rejected', 'Rejected']].map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === k ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-primary-600"></div></div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['PG Name', 'Owner', 'City', 'Category', 'Rooms', 'Rent', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pgs.map(pg => (
                  <tr key={pg._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-sm text-gray-900">{pg.name}</div>
                      <div className="text-xs text-gray-400">{pg.address?.locality}</div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-600">
                      <div>{pg.owner?.name}</div>
                      <div className="text-xs text-gray-400">{pg.owner?.phone}</div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-500">{pg.address?.city}</td>
                    <td className="py-3 pr-4"><span className="text-xs font-medium text-gray-500 capitalize">{pg.category}</span></td>
                    <td className="py-3 pr-4 text-sm text-gray-500">{pg.availableRooms}/{pg.totalRooms}</td>
                    <td className="py-3 pr-4 text-sm font-semibold text-gray-700">₹{pg.startingRent?.toLocaleString()}</td>
                    <td className="py-3 pr-4"><span className={STATUS_BADGE[pg.status] || 'badge-inactive'}>{pg.status}</span></td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {pg.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(pg._id, 'active')} className="flex items-center gap-1 text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded-lg border border-green-100 transition-all">
                              <CheckCircle size={11} /> Approve
                            </button>
                            <button onClick={() => { const r = window.prompt('Rejection reason:'); if (r !== null) updateStatus(pg._id, 'rejected', r); }} className="flex items-center gap-1 text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg border border-red-100 transition-all">
                              <XCircle size={11} /> Reject
                            </button>
                          </>
                        )}
                        <button onClick={() => deletePG(pg._id)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg border border-gray-100 transition-all">
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pgs.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-gray-400 text-sm">No PGs found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
