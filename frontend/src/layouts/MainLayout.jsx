import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Users,
  Calendar,
  Building2,
  Menu,
  X,
  LogIn,
} from 'lucide-react';

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Navigation items: Patient, Appointment, Department
  const navigation = [
    { name: 'Patient', href: '/patients', icon: Users },
    { name: 'Appointment', href: '/appointments', icon: Calendar },
    { name: 'Department', href: '/departments', icon: Building2 },
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Main Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-18 py-2">
            
            {/* Left Side: Mobile Menu Button (Mobile only) */}
            <div className="flex items-center lg:hidden z-20">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Left Side: Navigation Menu (Desktop) */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 z-10">
              {navigation.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                      active
                        ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200/80 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className={`h-4 w-4 mr-2 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Middle: MediCore Logo and Branding (Centered) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="pointer-events-auto">
                <Link to="/" className="flex items-center space-x-2.5 group">
                  {/* Modern Hospital/Healthcare Medical Cross & Pulse Emblem */}
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 text-white shadow-md shadow-teal-700/20 ring-1 ring-white/30 group-hover:scale-105 transition-transform duration-200">
                    <svg
                      viewBox="0 0 32 32"
                      fill="none"
                      className="w-6 h-6"
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
                    <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-teal-800 transition-colors leading-none">
                      Medi<span className="text-teal-600">Core</span>
                    </span>
                    <span className="text-[10px] tracking-wider font-semibold uppercase text-slate-400 mt-0.5">
                      Hospital
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Right Side: ONLY Login Button */}
            <div className="flex items-center justify-end z-10">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-sm hover:shadow transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                <span>Login</span>
              </Link>
            </div>

          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-4 space-y-1 shadow-lg">
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
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Reusable Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:justify-between sm:items-center text-xs text-slate-500">
          <p>© 2026 MediCore Hospital Management System. Modular Monolith Architecture.</p>
          <p className="mt-1 sm:mt-0 font-medium text-slate-600">
            Node.js + Express + Prisma + PostgreSQL &bull; React + Vite + Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
