import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, BedDouble, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { ownerService } from '../../services/services';

const STATUS_BADGE = { active: 'badge-active', inactive: 'badge-inactive', pending: 'badge-pending', rejected: 'badge-rejected' };

export default function MyPGs() {
  const [pgs, setPGs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => ownerService.getMyPGs().then(r => { setPGs(r.data.pgs); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggleStatus = async (pg) => {
    try {
      await ownerService.togglePGStatus(pg._id);
      toast.success(`PG ${pg.status === 'active' ? 'deactivated' : 'activated'}`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deletePG = async (id) => {
    if (!window.confirm('Delete this PG? This cannot be undone.')) return;
    try { await ownerService.deletePG(id); toast.success('PG deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-primary-600"></div></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My PG Listings</h1>
          <p className="text-gray-400 text-sm mt-0.5">{pgs.length} total listing{pgs.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/owner/pgs/add" className="btn-primary"><Plus size={16} /> Add New PG</Link>
      </div>

      {pgs.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🏠</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No PGs Listed Yet</h3>
          <p className="text-gray-400 text-sm mb-5">Start by adding your first PG listing</p>
          <Link to="/owner/pgs/add" className="btn-primary"><Plus size={16} /> Add Your First PG</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {pgs.map(pg => (
            <div key={pg._id} className="card flex flex-col sm:flex-row gap-4">
              {/* Thumbnail */}
              <div className="w-full sm:w-28 h-28 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex-shrink-0 overflow-hidden">
                {pg.images?.[0] ? <img src={pg.images[0]} alt={pg.name} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-primary-300 text-3xl">🏠</div>}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2 justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{pg.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{pg.address?.locality}, {pg.address?.city}</p>
                  </div>
                  <span className={STATUS_BADGE[pg.status] || 'badge-inactive'}>{pg.status}</span>
                </div>
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                  <span>₹{pg.startingRent?.toLocaleString()}/mo</span>
                  <span>•</span>
                  <span>{pg.availableRooms} of {pg.totalRooms} rooms available</span>
                </div>
                {pg.status === 'pending' && <p className="text-xs text-amber-600 mt-1 flex items-center gap-1"><Clock size={11} /> Awaiting admin approval</p>}
                {pg.status === 'rejected' && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><XCircle size={11} /> Rejected: {pg.rejectionReason}</p>}
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col gap-2 flex-shrink-0">
                <Link to={`/owner/pgs/${pg._id}/rooms`} className="btn-secondary text-xs py-2 px-3"><BedDouble size={13} /> Rooms</Link>
                <Link to={`/owner/pgs/${pg._id}/edit`} className="btn-secondary text-xs py-2 px-3"><Edit size={13} /> Edit</Link>
                {(pg.status === 'active' || pg.status === 'inactive') && (
                  <button onClick={() => toggleStatus(pg)} className="btn-secondary text-xs py-2 px-3">
                    {pg.status === 'active' ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Show</>}
                  </button>
                )}
                <button onClick={() => deletePG(pg._id)} className="btn-danger text-xs py-2 px-3"><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
