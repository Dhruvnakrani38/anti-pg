import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/services';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = email, 2 = otp+pass
  const [email, setEmail] = useState('');
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const sendOTP = async (data) => {
    try {
      await authService.forgotPassword(data.email);
      setEmail(data.email);
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const resetPass = async (data) => {
    try {
      await authService.resetPassword({ email, otp: data.otp, newPassword: data.newPassword });
      toast.success('Password reset successful! Please login.');
      window.location.href = '/login';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-white">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-black">PG</div>
            <span className="font-bold text-xl">PG Management</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <Link to="/login" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5">
            <ArrowLeft size={14} /> Back to Login
          </Link>
          <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
          <p className="text-sm text-gray-500 mb-6">{step === 1 ? 'Enter your email to receive an OTP.' : `Enter the OTP sent to ${email}`}</p>

          {step === 1 ? (
            <form onSubmit={handleSubmit(sendOTP)} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input type="email" className="input" placeholder="you@example.com"
                  {...register('email', { required: 'Email is required' })} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" className="btn-primary w-full justify-center" disabled={isSubmitting}>
                <Mail size={16} /> {isSubmitting ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit(resetPass)} className="space-y-4">
              <div>
                <label className="label">OTP Code</label>
                <input className="input" placeholder="6-digit OTP" {...register('otp', { required: 'OTP is required' })} />
              </div>
              <div>
                <label className="label">New Password</label>
                <input type="password" className="input" placeholder="Min. 6 characters"
                  {...register('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} />
              </div>
              <button type="submit" className="btn-primary w-full justify-center" disabled={isSubmitting}>
                <KeyRound size={16} /> {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
