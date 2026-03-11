import { useState, useEffect } from 'react';
import { adminService } from '../../services/services';
import { format } from 'date-fns';
import { Phone, MessageSquare } from 'lucide-react';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAllEnquiries().then(r => { setEnquiries(r.data.enquiries); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">All Enquiries</h1>
        <p className="text-gray-400 text-sm mt-0.5">{enquiries.length} total enquiries</p>
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-primary-600"></div></div>
        : enquiries.length === 0 ? (
          <div className="card text-center py-16">
            <MessageSquare size={48} className="mx-auto text-gray-200 mb-3" />
            <h3 className="font-semibold text-gray-500">No enquiries yet</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Name', 'Contact', 'PG', 'Owner', 'Message', 'Date', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {enquiries.map(e => (
                  <tr key={e._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-sm text-gray-900">{e.name}</td>
                    <td className="py-3 pr-4">
                      <a href={`tel:${e.phone}`} className="flex items-center gap-1 text-xs text-primary-600 hover:underline"><Phone size={11} />{e.phone}</a>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-600">{e.pg?.name}</td>
                    <td className="py-3 pr-4 text-sm text-gray-500">{e.owner?.name}</td>
                    <td className="py-3 pr-4 text-sm text-gray-500 max-w-48 truncate">{e.message || '—'}</td>
                    <td className="py-3 pr-4 text-sm text-gray-400">{e.createdAt ? format(new Date(e.createdAt), 'dd MMM yy') : '-'}</td>
                    <td className="py-3"><span className={e.isRead ? 'badge-inactive' : 'badge-pending'}>{e.isRead ? 'Read' : 'Unread'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
