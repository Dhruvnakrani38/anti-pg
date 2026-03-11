import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/services';
import { User, Lock } from 'lucide-react';

export default function OwnerProfile() {
  const { user, updateUser } = useAuth();
  const { register: regProfile, handleSubmit: hsProfile, formState: { isSubmitting: isP } } = useForm({ defaultValues: { name: user?.name, phone: user?.phone } });
  const { register: regPass, handleSubmit: hsPass, watch, reset, formState: { isSubmitting: isPa } } = useForm();

  const saveProfile = async (data) => {
    try {
      const res = await authService.updateProfile(data);
      updateUser({ ...user, name: data.name, phone: data.phone });
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
  };

  const changePass = async (data) => {
    try {
      await authService.changePassword(data);
      toast.success('Password changed!');
      reset();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile & Settings</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage your account information</p>
      </div>

      {/* Profile Info */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <User size={18} className="text-primary-600" />
          <h2 className="font-bold text-gray-800">Personal Information</h2>
        </div>
        <form onSubmit={hsProfile(saveProfile)} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" {...regProfile('name', { required: 'Name is required' })} />
          </div>
          <div>
            <label className="label">Email (cannot be changed)</label>
            <input className="input bg-gray-50 text-gray-400 cursor-not-allowed" value={user?.email} readOnly />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" {...regProfile('phone', { required: 'Phone is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid phone' } })} />
          </div>
          <button type="submit" className="btn-primary" disabled={isP}>{isP ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <Lock size={18} className="text-primary-600" />
          <h2 className="font-bold text-gray-800">Change Password</h2>
        </div>
        <form onSubmit={hsPass(changePass)} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" {...regPass('currentPassword', { required: 'Required' })} />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" {...regPass('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" {...regPass('confirmPassword', { validate: v => v === watch('newPassword') || 'Passwords do not match' })} />
          </div>
          <button type="submit" className="btn-primary" disabled={isPa}>{isPa ? 'Updating...' : 'Update Password'}</button>
        </form>
      </div>
    </div>
  );
}
