import { useState, useEffect } from 'react';
import { Building2, Users, BedDouble, Search, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { adminService } from '../../services/services';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626'];

function StatCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const cls = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', purple: 'bg-purple-50 text-purple-600', orange: 'bg-orange-50 text-orange-600', red: 'bg-red-50 text-red-500' };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cls[color]}`}><Icon size={22} /></div>
      <div>
        <div className="text-2xl font-extrabold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard().then(r => { setData(r.data.dashboard); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 flex justify-center h-full items-center"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-primary-500"></div></div>;

  const cityChartData = data?.cityDistribution?.map(c => ({ name: c._id, value: c.count })) || [];
  const pgGrowthData = data?.pgGrowth?.reverse()?.map(g => ({ name: `${g._id.month}/${g._id.year}`.slice(0, 5), count: g.count })) || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-300 text-sm mt-0.5">Platform-wide overview</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Building2} label="Total PGs" value={data?.totalPGs} sub={`${data?.activePGs} active, ${data?.pendingPGs} pending`} color="blue" />
        <StatCard icon={Users} label="Total Owners" value={data?.totalOwners} sub={`${data?.activeOwners} active`} color="purple" />
        <StatCard icon={Users} label="Active Tenants" value={data?.totalTenants} color="green" />
        <StatCard icon={BedDouble} label="Total Rooms" value={data?.totalRooms} sub={`${data?.occupancyRate}% occupied`} color="orange" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Search} label="Total Searches" value={data?.totalSearches} color="blue" />
        <StatCard icon={TrendingUp} label="This Month" value={data?.recentSearches} color="green" />
        <StatCard icon={Clock} label="Pending Approval" value={data?.pendingPGs} color="orange" />
        <StatCard icon={CheckCircle} label="Enquiries" value={data?.totalEnquiries} color="purple" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {pgGrowthData.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">PG Growth (Monthly)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pgGrowthData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {cityChartData.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">PGs by City</h3>
            <div className="flex items-center">
              <PieChart width={180} height={180}>
                <Pie data={cityChartData} cx={80} cy={80} innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {cityChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
              <div className="flex-1 space-y-2">
                {cityChartData.slice(0, 5).map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600">{c.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Searched Cities */}
      {data?.topSearchedCities?.length > 0 && (
        <div className="card mt-6">
          <h3 className="font-bold text-gray-900 mb-4">🔍 Most Searched Cities</h3>
          <div className="flex flex-wrap gap-3">
            {data.topSearchedCities.map((c, i) => (
              <div key={c._id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2">
                <span className="text-gray-400 text-xs font-bold">#{i + 1}</span>
                <span className="font-semibold text-gray-800">{c._id}</span>
                <span className="text-xs text-gray-400">{c.count} searches</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
