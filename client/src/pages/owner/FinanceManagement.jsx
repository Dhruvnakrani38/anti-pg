import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, X, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';
import { ownerService } from '../../services/services';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function FinanceManagement() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [pgs, setPGs] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [tab, setTab] = useState('payments');
  const [showPayModal, setShowPayModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);

  const load = async () => {
    const [sRes, pRes, eRes] = await Promise.all([
      ownerService.getFinanceSummary({ month, year }),
      ownerService.getPayments({ month, year }),
      ownerService.getExpenses({ month, year }),
    ]);
    setSummary(sRes.data.summary);
    setPayments(pRes.data.payments);
    setExpenses(eRes.data.expenses);
  };

  useEffect(() => {
    ownerService.getMyPGs().then(r => setPGs(r.data.pgs));
    ownerService.getTenants({ status: 'active' }).then(r => setTenants(r.data.tenants));
  }, []);
  useEffect(() => { load(); }, [month, year]);

  const markPaid = async (id) => {
    try { await ownerService.updatePayment(id, { status: 'paid', paidDate: new Date() }); toast.success('Marked as paid'); load(); }
    catch { toast.error('Failed'); }
  };

  function AddPaymentModal({ onClose }) {
    const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: { month, year } });
    const onSubmit = async (data) => {
      try { await ownerService.addPayment(data); toast.success('Payment recorded'); load(); onClose(); }
      catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Record Payment</h2><button onClick={onClose}><X size={20} /></button></div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="label">Tenant *</label>
              <select className="input" {...register('tenantId', { required: true })}>
                <option value="">Select Tenant</option>
                {tenants.map(t => <option key={t._id} value={t._id}>{t.name} – {t.pg?.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">PG *</label>
              <select className="input" {...register('pgId', { required: true })}>
                <option value="">Select PG</option>
                {pgs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="label">Month</label>
                <select className="input" {...register('month')}>{MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}</select>
              </div>
              <div>
                <label className="label">Year</label>
                <input type="number" className="input" defaultValue={year} {...register('year')} />
              </div>
              <div>
                <label className="label">Amount ₹</label>
                <input type="number" className="input" {...register('amount', { required: true })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Status</label>
                <select className="input" {...register('status')}><option value="paid">Paid</option><option value="pending">Pending</option></select>
              </div>
              <div>
                <label className="label">Mode</label>
                <select className="input" {...register('mode')}><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank">Bank</option><option value="other">Other</option></select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">Save Payment</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function AddExpenseModal({ onClose }) {
    const { register, handleSubmit, formState: { isSubmitting } } = useForm({ defaultValues: { date: format(new Date(year, month - 1, 1), 'yyyy-MM-dd') } });
    const onSubmit = async (data) => {
      try { await ownerService.addExpense(data); toast.success('Expense added'); load(); onClose(); }
      catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Add Expense</h2><button onClick={onClose}><X size={20} /></button></div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="label">PG *</label>
              <select className="input" {...register('pgId', { required: true })}><option value="">Select PG</option>{pgs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Category *</label>
                <select className="input" {...register('category', { required: true })}>
                  {['electricity','water','maintenance','salary','internet','other'].map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Amount ₹ *</label>
                <input type="number" className="input" {...register('amount', { required: true })} />
              </div>
            </div>
            <div>
              <label className="label">Date *</label>
              <input type="date" className="input" {...register('date', { required: true })} />
            </div>
            <div>
              <label className="label">Description</label>
              <input className="input" placeholder="Optional details" {...register('description')} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">Save Expense</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center gap-3 justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Finance Management</h1>
          <p className="text-gray-400 text-sm mt-0.5">Track rent, expenses and profit</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input w-auto text-sm" value={month} onChange={e => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select className="input w-auto text-sm" value={year} onChange={e => setYear(Number(e.target.value))}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Collected', value: `₹${summary.totalCollected.toLocaleString()}`, icon: TrendingUp, cls: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Expenses', value: `₹${summary.totalExpenses.toLocaleString()}`, icon: TrendingDown, cls: 'text-red-500', bg: 'bg-red-50' },
            { label: 'Net Profit', value: `₹${summary.profit.toLocaleString()}`, icon: DollarSign, cls: summary.profit >= 0 ? 'text-primary-600' : 'text-red-500', bg: 'bg-primary-50' },
            { label: 'Pending Dues', value: `₹${summary.totalPending.toLocaleString()}`, icon: Clock, cls: 'text-orange-500', bg: 'bg-orange-50' },
          ].map(({ label, value, icon: Icon, cls, bg }) => (
            <div key={label} className="card flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} ${cls} flex-shrink-0`}><Icon size={18} /></div>
              <div><div className={`font-bold text-lg ${cls}`}>{value}</div><div className="text-xs text-gray-400">{label}</div></div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[['payments', 'Rent Payments'], ['expenses', 'Expenses']].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === k ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            {label}
          </button>
        ))}
        <div className="ml-auto">
          {tab === 'payments' ? <button onClick={() => setShowPayModal(true)} className="btn-primary py-2 text-sm"><Plus size={14} /> Record Payment</button>
            : <button onClick={() => setShowExpModal(true)} className="btn-primary py-2 text-sm"><Plus size={14} /> Add Expense</button>}
        </div>
      </div>

      {tab === 'payments' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Tenant', 'PG', 'Amount', 'Status', 'Mode', 'Date', ''].map(h => <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium text-sm text-gray-800">{p.tenant?.name}</td>
                  <td className="py-3 pr-4 text-sm text-gray-500">{p.pg?.name}</td>
                  <td className="py-3 pr-4 font-semibold text-sm">₹{p.amount?.toLocaleString()}</td>
                  <td className="py-3 pr-4"><span className={p.status === 'paid' ? 'badge-paid' : 'badge-unpaid'}>{p.status}</span></td>
                  <td className="py-3 pr-4 text-sm text-gray-500 capitalize">{p.mode}</td>
                  <td className="py-3 pr-4 text-sm text-gray-400">{p.paidDate ? format(new Date(p.paidDate), 'dd MMM') : '-'}</td>
                  <td className="py-3">{p.status !== 'paid' && <button onClick={() => markPaid(p._id)} className="text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded-lg border border-green-100 transition-all">Mark Paid</button>}</td>
                </tr>
              ))}
              {payments.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-gray-400 text-sm">No payment records for this period</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'expenses' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['PG', 'Category', 'Amount', 'Date', 'Description'].map(h => <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.map(e => (
                <tr key={e._id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium text-sm">{e.pg?.name}</td>
                  <td className="py-3 pr-4 text-sm text-gray-500 capitalize">{e.category}</td>
                  <td className="py-3 pr-4 font-semibold text-red-500 text-sm">₹{e.amount?.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-sm text-gray-400">{e.date ? format(new Date(e.date), 'dd MMM yyyy') : '-'}</td>
                  <td className="py-3 text-sm text-gray-500">{e.description || '-'}</td>
                </tr>
              ))}
              {expenses.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-gray-400 text-sm">No expenses for this period</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showPayModal && <AddPaymentModal onClose={() => setShowPayModal(false)} />}
      {showExpModal && <AddExpenseModal onClose={() => setShowExpModal(false)} />}
    </div>
  );
}
