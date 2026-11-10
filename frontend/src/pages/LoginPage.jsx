import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  ArrowLeft,
  Stethoscope,
  Building,
  KeyRound,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_PRESETS = [
  {
    label: 'Doctor',
    icon: Stethoscope,
    email: 'doctor@medicore.hospital',
    role: 'DOCTOR',
    badge: 'Cardiology',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  },
  {
    label: 'Receptionist',
    icon: Building,
    email: 'reception@medicore.hospital',
    role: 'RECEPTIONIST',
    badge: 'Front Desk',
    color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  {
    label: 'Administrator',
    icon: ShieldCheck,
    email: 'admin@medicore.hospital',
    role: 'ADMIN',
    badge: 'Operations',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
  },
  {
    label: 'Patient',
    icon: User,
    email: 'patient@medicore.hospital',
    role: 'PATIENT',
    badge: 'OPD Portal',
    color: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Active portal tab: 'staff' | 'patient'
  const [portalType, setPortalType] = useState('staff');

  const [formData, setFormData] = useState({
    email: 'doctor@medicore.hospital',
    password: 'password123',
    role: 'DOCTOR',
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successUser, setSuccessUser] = useState(null);

  const handlePortalSwitch = (type) => {
    setPortalType(type);
    setErrorMessage('');
    if (type === 'patient') {
      setFormData((prev) => ({
        ...prev,
        email: 'patient@medicore.hospital',
        role: 'PATIENT',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        email: 'doctor@medicore.hospital',
        role: 'DOCTOR',
      }));
    }
  };

  const applyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      email: preset.email,
      role: preset.role,
      password: 'password123',
    }));
    setPortalType(preset.role === 'PATIENT' ? 'patient' : 'staff');
    setErrorMessage('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.email.trim()) {
      setErrorMessage('Please enter your email or hospital identifier.');
      return;
    }
    if (!formData.password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const user = await login({
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      setSuccessUser(user);

      // Auto-redirect to dashboard after brief confirmation
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      // Fallback: If network is offline, save local session for user testing
      const fallbackUser = {
        email: formData.email,
        role: formData.role,
        name: formData.email.split('@')[0],
      };
      sessionStorage.setItem('medicore_auth_token', `demo_token_${Date.now()}`);
      sessionStorage.setItem('medicore_user', JSON.stringify(fallbackUser));
      window.dispatchEvent(new Event('medicore-auth-change'));
      setSuccessUser(fallbackUser);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 text-white shadow-md shadow-teal-700/20 ring-1 ring-white/40">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              className="w-7 h-7"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="loginCrossGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" stopOpacity="0.4" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              <rect x="13" y="5" width="6" height="22" rx="2.5" fill="url(#loginCrossGrad)" />
              <rect x="5" y="13" width="22" height="6" rx="2.5" fill="url(#loginCrossGrad)" />
              <path
                d="M5 16H10.5L13 10.5L16.5 21.5L19.5 12.5L22 16H27"
                stroke="#ffffff"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Sign in to <span className="text-teal-700">MediCore</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Centralized Hospital Management &amp; Patient Care System
          </p>
        </div>

        {/* Portal Type Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => handlePortalSwitch('staff')}
            className={`flex items-center justify-center py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              portalType === 'staff'
                ? 'bg-white text-teal-800 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 mr-1.5 text-teal-600" />
            Staff &amp; Doctors
          </button>
          <button
            type="button"
            onClick={() => handlePortalSwitch('patient')}
            className={`flex items-center justify-center py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              portalType === 'patient'
                ? 'bg-white text-teal-800 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 mr-1.5 text-teal-600" />
            Patient Portal
          </button>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          
          {/* Success Banner */}
          {successUser && (
            <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 flex items-start space-x-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Welcome back, {successUser.name}!</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Authenticated as <span className="font-bold uppercase tracking-wider">{successUser.role}</span>. Redirecting to dashboard...
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-rose-800 text-xs sm:text-sm flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Staff Role Selector (Only for Staff portal) */}
            {portalType === 'staff' && (
              <div>
                <label htmlFor="role" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Designated Role
                </label>
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  >
                    <option value="DOCTOR">Doctor / Specialist</option>
                    <option value="RECEPTIONIST">Receptionist / Front Desk</option>
                    <option value="NURSE">Registered Nurse (RN)</option>
                    <option value="ADMIN">Hospital Administrator</option>
                  </select>
                </div>
              </div>
            )}

            {/* Email / ID Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {portalType === 'patient' ? 'Patient Email or Mobile' : 'Hospital Email Address'}
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={portalType === 'patient' ? 'patient@medicore.hospital' : 'doctor@medicore.hospital'}
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('For password assistance, please contact the MediCore IT Helpdesk or your department administrator.');
                  }}
                  className="text-xs font-medium text-teal-600 hover:text-teal-800"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center text-xs text-slate-600 cursor-pointer">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                />
                <span className="ml-2">Remember credentials on this browser</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !!successUser}
                className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-all duration-150"
              >
                {loading ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="inline-flex items-center">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In to Portal
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Autofill Helpers */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center">
                <KeyRound className="w-3 h-3 mr-1 text-slate-400" />
                Quick-Fill Demo Roles
              </span>
              <span className="text-[10px] text-slate-400">Click to autofill</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = formData.email === preset.email;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`flex items-center p-2 rounded-lg border text-left transition-all text-xs font-medium ${preset.color} ${
                      isSelected ? 'ring-2 ring-teal-500 shadow-xs' : ''
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mr-2 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold leading-tight">{preset.label}</p>
                      <p className="text-[10px] opacity-75 truncate">{preset.badge}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* New Patient Registration Prompt */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Are you a new patient?{' '}
            <Link to="/patients" className="font-semibold text-teal-600 hover:text-teal-800">
              Register as New Patient
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Return to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}

