import { useState, useEffect } from 'react';
import { MessageSquare, Phone, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { ownerService } from '../../services/services';
import { format } from 'date-fns';

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => ownerService.getEnquiries().then(r => { setEnquiries(r.data.enquiries); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await ownerService.markEnquiryRead(id);
    load();
  };

  const unread = enquiries.filter(e => !e.isRead).length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Enquiries</h1>
        <p className="text-gray-400 text-sm mt-0.5">{unread > 0 ? `${unread} unread enquiries` : 'All caught up!'}</p>
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-primary-600"></div></div>
        : enquiries.length === 0 ? (
          <div className="card text-center py-16">
            <MessageSquare size={48} className="mx-auto text-gray-200 mb-3" />
            <h3 className="font-semibold text-gray-500">No enquiries yet</h3>
            <p className="text-xs text-gray-400 mt-1">Enquiries from potential tenants will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {enquiries.map(e => (
              <div key={e._id} className={`card transition-all ${!e.isRead ? 'border-l-4 border-l-primary-500' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{e.name}</span>
                      {!e.isRead && <span className="badge-active text-xs">New</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{e.pg?.name} • {format(new Date(e.createdAt), 'dd MMM yyyy, hh:mm a')}</div>
                    {e.message && <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-xl px-3 py-2">{e.message}</p>}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <a href={`tel:${e.phone}`} className="flex items-center gap-1 text-xs text-primary-600 font-medium bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-all">
                      <Phone size={12} /> {e.phone}
                    </a>
                    {!e.isRead && (
                      <button onClick={() => markRead(e._id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 border border-gray-200 px-3 py-1.5 rounded-lg transition-all">
                        <Check size={12} /> Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
