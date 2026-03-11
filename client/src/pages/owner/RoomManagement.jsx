import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, Edit, BedDouble } from 'lucide-react';
import { ownerService } from '../../services/services';

const ROOM_TYPES = ['single', 'double', 'triple', 'dormitory'];
const ROOM_STATUS_CLASS = { vacant: 'badge-vacant', occupied: 'badge-occupied', maintenance: 'badge-pending' };

function AddRoomModal({ pgId, onClose, onAdded }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const onSubmit = async (data) => {
    try {
      await ownerService.addRoom(pgId, data);
      toast.success('Room added!');
      onAdded();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Room</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Room Number *</label>
              <input className="input" placeholder="101" {...register('roomNumber', { required: true })} />
            </div>
            <div>
              <label className="label">Floor</label>
              <input className="input" placeholder="Ground" {...register('floor')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type *</label>
              <select className="input" {...register('type', { required: true })}>
                {ROOM_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Rent (₹/mo) *</label>
              <input type="number" className="input" placeholder="8000" {...register('rent', { required: true })} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isAC" {...register('isAC')} className="w-4 h-4 accent-primary-600" />
            <label htmlFor="isAC" className="text-sm text-gray-700">AC Room</label>
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" placeholder="Optional notes" {...register('description')} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RoomManagement() {
  const { id: pgId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = () => ownerService.getRooms(pgId).then(r => { setRooms(r.data.rooms); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, [pgId]);

  const deleteRoom = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try { await ownerService.deleteRoom(id); toast.success('Room deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/owner/pgs" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Room Management</h1>
          <p className="text-gray-400 text-sm">{rooms.length} rooms</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus size={16} /> Add Room</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-primary-600"></div></div>
      ) : rooms.length === 0 ? (
        <div className="card text-center py-16">
          <BedDouble size={48} className="mx-auto text-gray-200 mb-3" />
          <h3 className="font-semibold text-gray-500">No rooms added yet</h3>
          <button onClick={() => setShowAdd(true)} className="btn-primary mt-4"><Plus size={16} /> Add First Room</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <div key={room._id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-gray-900 text-lg">Room {room.roomNumber}</div>
                  <div className="text-sm text-gray-400">{room.floor} Floor • {room.isAC ? 'AC' : 'Non-AC'}</div>
                </div>
                <span className={ROOM_STATUS_CLASS[room.status]}>{room.status}</span>
              </div>
              <div className="text-sm text-gray-600 capitalize mb-1">{room.type} Room</div>
              <div className="text-primary-600 font-bold text-lg mb-3">₹{room.rent.toLocaleString()}<span className="text-gray-400 text-xs font-normal">/mo</span></div>
              {room.currentTenant && (
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                  👤 {room.currentTenant.name}
                </div>
              )}
              <button onClick={() => deleteRoom(room._id)} className="w-full text-red-500 hover:bg-red-50 text-xs py-1.5 rounded-lg border border-red-100 transition-all flex items-center justify-center gap-1.5">
                <Trash2 size={12} /> Delete Room
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddRoomModal pgId={pgId} onClose={() => setShowAdd(false)} onAdded={load} />}
    </div>
  );
}
