import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, X, Phone, UserCheck, LogOut } from 'lucide-react';
import { ownerService } from '../../services/services';
import { format } from 'date-fns';

function AddTenantModal({ pgs, onClose, onAdded }) {
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm();
  const [rooms, setRooms] = useState([]);
  const selectedPG = watch('pgId');

  useEffect(() => {
    if (selectedPG) ownerService.getRooms(selectedPG).then(r => setRooms(r.data.rooms.filter(rm => rm.status === 'vacant'))).catch(() => {});
  }, [selectedPG]);

  const onSubmit = async (data) => {
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v));
      await ownerService.addTenant(fd);
      toast.success('Tenant added!');
      onAdded(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Add Tenant</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input className="input" placeholder="Tenant Name" {...register('name', { required: true })} />
            </div>
            <div>
              <label className="label">Phone *</label>
              <input className="input" placeholder="9876543210" {...register('phone', { required: true })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="Optional" {...register('email')} />
            </div>
            <div>
              <label className="label">Select PG *</label>
              <select className="input" {...register('pgId', { required: true })}>
                <option value="">Select PG</option>
                {pgs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Select Room *</label>
              <select className="input" {...register('roomId', { required: true })}>
                <option value="">Select Room</option>
                {rooms.map(r => <option key={r._id} value={r._id}>Room {r.roomNumber} — {r.type} — ₹{r.rent}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Join Date *</label>
              <input type="date" className="input" {...register('joinDate', { required: true })} />
            </div>
            <div>
              <label className="label">Rent Amount (₹) *</label>
              <input type="number" className="input" {...register('rentAmount', { required: true })} />
            </div>
            <div>
              <label className="label">Advance Paid (₹)</label>
              <input type="number" className="input" defaultValue={0} {...register('advancePaid')} />
            </div>
            <div>
              <label className="label">ID Proof Type</label>
              <select className="input" {...register('idProofType')}>
                <option>Aadhar</option><option>PAN</option><option>Passport</option><option>Driving License</option><option>Other</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea className="input h-16 resize-none" placeholder="Any notes..." {...register('notes')} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting ? 'Adding...' : 'Add Tenant'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TenantManagement() {
  const [tenants, setTenants] = useState([]);
  const [pgs, setPGs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('active');

  const load = async () => {
    const [tRes, pRes] = await Promise.all([ownerService.getTenants({ status: filter }), ownerService.getMyPGs()]);
    setTenants(tRes.data.tenants);
    setPGs(pRes.data.pgs.filter(p => p.status === 'active'));
    setLoading(false);
  };
  useEffect(() => { setLoading(true); load(); }, [filter]);

  const checkout = async (id, name) => {
    if (!window.confirm(`Checkout ${name}? This will free up their room.`)) return;
    try { await ownerService.checkoutTenant(id); toast.success('Tenant checked out'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tenant Management</h1>
          <p className="text-gray-400 text-sm mt-0.5">{tenants.length} {filter} tenant{tenants.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus size={16} /> Add Tenant</button>
      </div>

      <div className="flex gap-2 mb-5">
        {['active', 'exited'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${filter === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>{s}</button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-primary-600"></div></div>
        : tenants.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-3">👥</div>
            <h3 className="font-semibold text-gray-500">No {filter} tenants found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Tenant', 'PG / Room', 'Contact', 'Join Date', 'Rent', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tenants.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">{t.name.charAt(0)}</div>
                        <span className="font-medium text-gray-800 text-sm">{t.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-500">
                      <div>{t.pg?.name}</div>
                      <div className="text-xs text-gray-400">Room {t.room?.roomNumber}</div>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-500">
                      <a href={`tel:${t.phone}`} className="flex items-center gap-1 hover:text-primary-600"><Phone size={12} /> {t.phone}</a>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-500">{t.joinDate ? format(new Date(t.joinDate), 'dd MMM yyyy') : '-'}</td>
                    <td className="py-3 pr-4 text-sm font-semibold text-gray-700">₹{t.rentAmount?.toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className={t.status === 'active' ? 'badge-active' : 'badge-inactive'}>{t.status}</span>
                    </td>
                    <td className="py-3">
                      {t.status === 'active' && (
                        <button onClick={() => checkout(t._id, t.name)} className="flex items-center gap-1 text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all border border-red-100">
                          <LogOut size={11} /> Checkout
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {showAdd && <AddTenantModal pgs={pgs} onClose={() => setShowAdd(false)} onAdded={load} />}
    </div>
  );
}
