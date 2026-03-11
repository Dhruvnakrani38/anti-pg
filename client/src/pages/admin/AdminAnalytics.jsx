import { useState, useEffect } from 'react';
import { adminService } from '../../services/services';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAnalytics().then(r => { setData(r.data.analytics); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-primary-600"></div></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-400 text-sm mt-0.5">Search trends and PG views (last 30 days)</p>
      </div>

      <div className="grid gap-6">
        {data?.dailySearches?.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Daily Searches (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.dailySearches}>
                <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {data?.topCities?.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">🔍 Top Search Cities</h3>
              <div className="space-y-3">
                {data.topCities.map((c, i) => (
                  <div key={c._id} className="flex items-center gap-3">
                    <div className="text-xs font-bold text-gray-400 w-6">#{i + 1}</div>
                    <div className="flex-1 text-sm font-medium text-gray-700">{c._id}</div>
                    <div className="text-xs text-gray-400 font-semibold">{c.searches} searches</div>
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100, (c.searches / data.topCities[0].searches) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data?.topPGViews?.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">👁 Most Viewed PGs</h3>
              <div className="space-y-3">
                {data.topPGViews.slice(0, 10).map((pg, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-xs font-bold text-gray-400 w-6">#{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700 truncate">{pg.pgName}</div>
                      <div className="text-xs text-gray-400">{pg.city}</div>
                    </div>
                    <div className="text-xs text-gray-400 font-semibold flex-shrink-0">{pg.views} views</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {(!data?.dailySearches?.length && !data?.topCities?.length) && (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-500">Analytics will appear here once users start searching</h3>
          </div>
        )}
      </div>
    </div>
  );
}
