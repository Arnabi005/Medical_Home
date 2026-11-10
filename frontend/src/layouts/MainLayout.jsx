import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Users,
  Calendar,
  Building2,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation items: Patient, Appointment, Department
  const navigation = [
    { name: 'Patient', href: '/patients', icon: Users },
    { name: 'Appointment', href: '/appointments', icon: Calendar },
    { name: 'Department', href: '/departments', icon: Building2 },
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const getRoleBadgeStyle = (role) => {
    switch (role?.toUpperCase()) {
      case 'DOCTOR':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'RECEPTIONIST':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'NURSE':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'PATIENT':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getUserInitials = (name, email) => {
    if (name) {
      const parts = name.replace(/^Dr\.\s*/i, '').trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'MC';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Main Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px] py-2 gap-2">
            
            {/* Left Side: Mobile Menu Button (Mobile) & Navigation Menu (Desktop) */}
            <div className="flex items-center">
              <div className="flex items-center lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>

              <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
                {navigation.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                        active
                          ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200/80 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <Icon className={`h-4 w-4 mr-2 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Middle: MediCore Logo and Branding */}
            <div className="flex items-center justify-center">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-2.5 group">
                {/* Modern Hospital/Healthcare Medical Cross & Pulse Emblem */}
                <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 text-white shadow-md shadow-teal-700/20 ring-1 ring-white/30 group-hover:scale-105 transition-transform duration-200 shrink-0">
                  <svg
                    viewBox="0 0 32 32"
                    fill="none"
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="crossPulseGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#ffffff" stopOpacity="0.35" />
                        <stop offset="1" stopColor="#ffffff" stopOpacity="0.15" />
                      </linearGradient>
                    </defs>
                    {/* Medical Cross Motif */}
                    <rect x="13" y="5" width="6" height="22" rx="2.5" fill="url(#crossPulseGrad)" />
                    <rect x="5" y="13" width="22" height="6" rx="2.5" fill="url(#crossPulseGrad)" />
                    {/* Pulse Beat Line */}
                    <path
                      d="M5 16H10.5L13 10.5L16.5 21.5L19.5 12.5L22 16H27"
                      stroke="#ffffff"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 group-hover:text-teal-800 transition-colors leading-none">
                    Medi<span className="text-teal-600">Core</span>
                  </span>
                  <span className="text-[10px] tracking-wider font-semibold uppercase text-slate-400 mt-0.5 hidden sm:inline">
                    Hospital
                  </span>
                </div>
              </Link>
            </div>

            {/* Right Side: User Account or Login Button */}
            <div className="flex items-center justify-end">
              {isAuthenticated && user ? (
                /* Authenticated User Profile Menu */
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200/90 hover:border-teal-300 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
                    aria-expanded={userMenuOpen}
                    aria-label="User profile menu"
                  >
                    {/* User Avatar Circle with Initials */}
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      {getUserInitials(user.name, user.email)}
                    </div>

                    {/* Name & Role (Hidden on small mobile screens) */}
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px] md:max-w-[160px]">
                        {user.name || user.email}
                      </span>
                      <span className="text-[10px] text-slate-500 capitalize leading-none">
                        {user.role?.toLowerCase() || 'Member'}
                      </span>
                    </div>

                    {/* Role Tag Pill */}
                    <span
                      className={`hidden md:inline-flex px-1.5 py-0.5 text-[10px] font-bold uppercase rounded border tracking-wide ${getRoleBadgeStyle(
                        user.role
                      )}`}
                    >
                      {user.role || 'USER'}
                    </span>

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                        userMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu Panel */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-fade-in">
                      {/* User Summary Card */}
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                            {getUserInitials(user.name, user.email)}
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-bold text-slate-900 truncate">{user.name || 'Hospital User'}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60">
                          <span className="text-slate-500 font-medium">Designated Role:</span>
                          <span
                            className={`px-1.5 py-0.5 font-bold uppercase rounded border text-[10px] ${getRoleBadgeStyle(
                              user.role
                            )}`}
                          >
                            {user.role || 'Member'}
                          </span>
                        </div>

                        {user.department && (
                          <div className="mt-1 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">Department:</span>
                            <span className="text-slate-700 font-semibold truncate max-w-[130px]">{user.department}</span>
                          </div>
                        )}

                        {user.patientId && (
                          <div className="mt-1 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">Patient ID:</span>
                            <span className="text-slate-700 font-mono font-semibold">{user.patientId}</span>
                          </div>
                        )}

                        <div className="mt-2 flex items-center text-[10px] text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                          <span>Active MediCore Session</span>
                        </div>
                      </div>

                      {/* Quick Profile/Help Links */}
                      <div className="px-2 py-1">
                        <Link
                          to={user.role === 'PATIENT' ? '/patients' : '/appointments'}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <User className="w-3.5 h-3.5 mr-2 text-slate-400" />
                          <span>My Healthcare Portal</span>
                        </Link>
                      </div>

                      {/* Sign Out Button */}
                      <div className="px-2 pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5 mr-2 text-rose-600" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Unauthenticated Login Button */
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-sm hover:shadow transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                  <span>Login</span>
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-4 space-y-2 shadow-lg">
            {/* Authenticated User Banner in Mobile Menu */}
            {isAuthenticated && user && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {getUserInitials(user.name, user.email)}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name || user.email}</p>
                    <span
                      className={`inline-block px-1.5 py-0.2 text-[9px] font-bold uppercase rounded border ${getRoleBadgeStyle(
                        user.role
                      )}`}
                    >
                      {user.role || 'USER'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation links */}
            {navigation.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    active
                      ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200/70'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Mobile Auth Button */}
            <div className="pt-2 border-t border-slate-200">
              {isAuthenticated && user ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2.5 text-rose-600" />
                  <span>Sign Out ({user.name || user.email})</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Hospital Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:justify-between sm:items-center text-xs text-slate-500">
          <p>© 2026 MediCore Hospital Management System. All rights reserved.</p>
          <p className="mt-1 sm:mt-0 text-slate-600">
            Emergency Helpline: <span className="font-semibold text-teal-700">1800-MEDICORE</span> &bull; 24/7 Patient Care
          </p>
        </div>
      </footer>
    </div>
  );
}
