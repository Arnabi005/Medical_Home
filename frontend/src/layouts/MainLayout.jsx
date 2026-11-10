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
  Activity,
  Heart,
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
        return 'bg-lightblue-100 text-lightblue-800 border-lightblue-300';
      case 'ADMIN':
        return 'bg-neonrose-50 text-neonrose-700 border-neonrose-200';
      case 'RECEPTIONIST':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'NURSE':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'PATIENT':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
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
    <div className="min-h-screen bg-lightblue-50 flex flex-col font-sans text-slate-800 selection:bg-neonrose-500 selection:text-white">
      
      {/* Main Navbar: Modern Glassmorphic Medical Aesthetic */}
      <header className="glass-nav sticky top-0 z-30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px] py-2 gap-2">
            
            {/* Left Side: Mobile Menu Button (Mobile) & Navigation Menu (Desktop) */}
            <div className="flex items-center">
              <div className="flex items-center lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="glass-pill inline-flex items-center justify-center p-2 rounded-xl text-slate-700 hover:text-sky-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6 text-neonrose-500" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>

              <nav className="hidden lg:flex items-center space-x-1.5 xl:space-x-2">
                {navigation.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                        active
                          ? 'glass-pill-active text-sky-950 font-bold'
                          : 'glass-pill text-slate-700 hover:text-sky-800 hover:bg-white/80'
                      }`}
                    >
                      <Icon className={`h-4 w-4 mr-2 ${active ? 'text-sky-600' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Middle: MediCore Logo and Branding */}
            <div className="flex items-center justify-center">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
                {/* Modern Hospital/Healthcare Medical Cross & Neon Rose Pulse Emblem */}
                <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-lightblue-600 via-lightblue-500 to-sky-400 text-white shadow-md shadow-lightblue-500/25 ring-1 ring-lightblue-300/40 group-hover:scale-105 transition-transform duration-200 shrink-0">
                  <svg
                    viewBox="0 0 32 32"
                    fill="none"
                    className="w-6 h-6 sm:w-7 sm:h-7"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="crossWhiteGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#ffffff" stopOpacity="0.45" />
                        <stop offset="1" stopColor="#ffffff" stopOpacity="0.2" />
                      </linearGradient>
                      <filter id="neonRosePulseGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#ff1464" floodOpacity="0.75" />
                      </filter>
                    </defs>
                    {/* Medical Cross Motif */}
                    <rect x="13" y="5" width="6" height="22" rx="2.5" fill="url(#crossWhiteGrad)" />
                    <rect x="5" y="13" width="22" height="6" rx="2.5" fill="url(#crossWhiteGrad)" />
                    {/* Neon Rose Pulse Beat Line */}
                    <path
                      d="M5 16H10.5L13 10.5L16.5 21.5L19.5 12.5L22 16H27"
                      stroke="#ff1464"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#neonRosePulseGlow)"
                    />
                  </svg>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-lightblue-700 transition-colors leading-none">
                    Medi<span className="text-lightblue-600">Core</span>
                  </span>
                  <span className="text-[10px] tracking-widest font-extrabold uppercase text-neonrose-500 mt-0.5 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-neonrose-500 mr-1 animate-pulse"></span>
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
                    className="glass-pill flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-white/90 transition-all focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-xs"
                    aria-expanded={userMenuOpen}
                    aria-label="User profile menu"
                  >
                    {/* User Avatar Circle with Initials */}
                    <div
                      className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0"
                      style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
                    >
                      {getUserInitials(user.name, user.email)}
                    </div>

                    {/* Name & Role */}
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
                        userMenuOpen ? 'rotate-180 text-sky-600' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu Panel with Glassmorphism */}
                  {userMenuOpen && (
                    <div className="glass-dropdown absolute right-0 mt-2 w-64 rounded-2xl py-2 z-50 animate-fade-in">
                      {/* User Summary Card */}
                      <div className="px-4 py-3 border-b border-sky-100/70 bg-sky-50/50">
                        <div className="flex items-center space-x-2.5">
                          <div
                            className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0"
                            style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
                          >
                            {getUserInitials(user.name, user.email)}
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-bold text-slate-900 truncate">{user.name || 'Hospital User'}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-lightblue-200/60">
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
                            <span className="text-lightblue-700 font-semibold truncate max-w-[130px]">{user.department}</span>
                          </div>
                        )}

                        {user.patientId && (
                          <div className="mt-1 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">Patient ID:</span>
                            <span className="text-neonrose-600 font-mono font-semibold">{user.patientId}</span>
                          </div>
                        )}

                        <div className="mt-2 flex items-center text-[10px] text-lightblue-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-lightblue-500 mr-1.5 animate-pulse"></span>
                          <span>Active MediCore Session</span>
                        </div>
                      </div>

                      {/* Quick Profile/Portal Links */}
                      <div className="px-2 py-1">
                        <Link
                          to={user.role === 'PATIENT' ? '/patients' : '/appointments'}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:text-lightblue-700 hover:bg-lightblue-50 rounded-xl transition-colors"
                        >
                          <User className="w-3.5 h-3.5 mr-2 text-lightblue-600" />
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
                          className="flex items-center w-full px-3 py-2 text-xs font-bold text-neonrose-600 hover:bg-neonrose-50 rounded-xl transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5 mr-2 text-neonrose-500" />
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
                  style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
                  className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-xl shadow-md shadow-sky-600/25 transition-all duration-150 ease-in-out border border-sky-400/30 focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 text-white" />
                  <span className="text-white font-bold">Login</span>
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Drawer Menu with Glassmorphism */}
        {mobileMenuOpen && (
          <div className="lg:hidden glass-dropdown border-t border-sky-100/70 px-4 pt-3 pb-4 space-y-2 shadow-2xl">
            {isAuthenticated && user && (
              <div className="p-3 bg-white/70 rounded-xl border border-sky-200/60 mb-2 shadow-xs">
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-xs"
                    style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
                  >
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
                  className={`flex items-center px-3.5 py-2.5 rounded-xl text-base font-semibold transition-all ${
                    active
                      ? 'glass-pill-active text-sky-950 font-bold'
                      : 'glass-pill text-slate-700 hover:text-sky-800 hover:bg-white/90'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 ${active ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Mobile Auth Button */}
            <div className="pt-2 border-t border-lightblue-200">
              {isAuthenticated && user ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-bold text-neonrose-700 bg-neonrose-50 hover:bg-neonrose-100 transition-colors border border-neonrose-200"
                >
                  <LogOut className="h-4 w-4 mr-2.5 text-neonrose-500" />
                  <span>Sign Out ({user.name || user.email})</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
                  className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md transition-colors"
                >
                  <LogIn className="h-4 w-4 mr-2 text-white" />
                  <span className="text-white font-bold">Login</span>
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

      {/* Hospital Footer: Clean Light Blue */}
      <footer className="bg-white border-t border-lightblue-200 py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:justify-between sm:items-center text-xs text-slate-500">
          <p className="flex items-center justify-center sm:justify-start">
            <span className="w-2 h-2 rounded-full bg-lightblue-500 mr-2"></span>
            &copy; 2026 MediCore Hospital Management System. All rights reserved.
          </p>
          <p className="mt-2 sm:mt-0 text-slate-700 flex items-center justify-center">
            Emergency Helpline: <span className="font-extrabold text-neonrose-600 ml-1.5 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-neonrose-500 animate-ping mr-1"></span>
              1800-MEDICORE
            </span> &bull; <span className="text-lightblue-700 font-semibold ml-1">24/7 Patient Care</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
