import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import Home from './pages/public/Home';
import SearchPage from './pages/public/SearchPage';
import PGDetail from './pages/public/PGDetail';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';

// Owner Pages
import OwnerLayout from './components/layout/OwnerLayout';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import MyPGs from './pages/owner/MyPGs';
import AddPG from './pages/owner/AddPG';
import EditPG from './pages/owner/EditPG';
import RoomManagement from './pages/owner/RoomManagement';
import TenantManagement from './pages/owner/TenantManagement';
import FinanceManagement from './pages/owner/FinanceManagement';
import Enquiries from './pages/owner/Enquiries';
import OwnerProfile from './pages/owner/OwnerProfile';

// Admin Pages
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPGs from './pages/admin/AdminPGs';
import AdminOwners from './pages/admin/AdminOwners';
import AdminTenants from './pages/admin/AdminTenants';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminEnquiries from './pages/admin/AdminEnquiries';

// Protected Route wrapper
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/pg/:id" element={<PGDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Owner Panel */}
      <Route path="/owner" element={<ProtectedRoute role="owner"><OwnerLayout /></ProtectedRoute>}>
        <Route index element={<OwnerDashboard />} />
        <Route path="pgs" element={<MyPGs />} />
        <Route path="pgs/add" element={<AddPG />} />
        <Route path="pgs/:id/edit" element={<EditPG />} />
        <Route path="pgs/:id/rooms" element={<RoomManagement />} />
        <Route path="tenants" element={<TenantManagement />} />
        <Route path="finance" element={<FinanceManagement />} />
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="profile" element={<OwnerProfile />} />
      </Route>

      {/* Admin Panel */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="pgs" element={<AdminPGs />} />
        <Route path="owners" element={<AdminOwners />} />
        <Route path="tenants" element={<AdminTenants />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="enquiries" element={<AdminEnquiries />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500, style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif' } }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
