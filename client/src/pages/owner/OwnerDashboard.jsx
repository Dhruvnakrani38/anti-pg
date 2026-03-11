import { useState, useEffect } from 'react';
import { Building2, Users, BedDouble, DollarSign, TrendingUp, Bell, Plus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ownerService } from '../../services/services';
import { useAuth } from '../../context/AuthContext';

function StatCard({ icon: Icon, label, value, sub, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}><Icon size={22} /></div>
      <div className="min-w-0">
        <div className="text-2xl font-extrabold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ownerService.getDashboard().then(r => { setData(r.data.dashboard); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' });

  if (loading) return <div className="p-8 flex items-center justify-center h-full"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-primary-600"></div></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-400 text-sm mt-0.5">Here's what's happening with your PGs today</p>
        </div>
        <Link to="/owner/pgs/add" className="btn-primary">
          <Plus size={16} /> Add PG
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Building2} label="Total PGs" value={data?.totalPGs ?? 0} sub={`${data?.activePGs ?? 0} active`} color="primary" />
        <StatCard icon={BedDouble} label="Rooms" value={data?.totalRooms ?? 0} sub={`${data?.vacantRooms ?? 0} vacant`} color="orange" />
        <StatCard icon={Users} label="Tenants" value={data?.totalTenants ?? 0} sub="Active tenants" color="purple" />
        <StatCard icon={DollarSign} label={`${monthName} Revenue`} value={`₹${(data?.monthlyRevenue ?? 0).toLocaleString()}`} sub={`${data?.pendingPayments ?? 0} pending`} color="green" />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { to: '/owner/pgs', label: 'Manage PGs', desc: 'Add, edit your PG listings', icon: Building2, color: 'border-primary-200 hover:border-primary-400' },
          { to: '/owner/tenants', label: 'Tenants', desc: 'Add and manage tenants', icon: Users, color: 'border-green-200 hover:border-green-400' },
          { to: '/owner/finance', label: 'Finance', desc: 'Track rent and expenses', icon: TrendingUp, color: 'border-orange-200 hover:border-orange-400' },
        ].map(({ to, label, desc, icon: Icon, color }) => (
          <Link key={to} to={to} className={`card border-2 ${color} transition-all hover:shadow-card-hover hover:-translate-y-0.5 flex items-center gap-3`}>
            <Icon size={20} className="text-gray-400" />
            <div>
              <div className="font-semibold text-gray-800 text-sm">{label}</div>
              <div className="text-xs text-gray-400">{desc}</div>
            </div>
            <ChevronRight size={16} className="ml-auto text-gray-300" />
          </Link>
        ))}
      </div>

      {/* Notifications */}
      {(data?.pendingPayments > 0 || data?.unreadEnquiries > 0) && (
        <div className="card border-l-4 border-l-amber-400">
          <div className="flex items-center gap-2 text-amber-700 font-semibold mb-2"><Bell size={16} /> Notifications</div>
          <ul className="space-y-1">
            {data?.pendingPayments > 0 && <li className="text-sm text-gray-600">📋 <strong>{data.pendingPayments}</strong> pending rent payments for {monthName}</li>}
            {data?.unreadEnquiries > 0 && <li className="text-sm text-gray-600">💬 <strong>{data.unreadEnquiries}</strong> new unread enquiries from tenants</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
