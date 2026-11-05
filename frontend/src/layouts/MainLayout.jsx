import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Activity,
  Users,
  Calendar,
  UserPlus,
  Stethoscope,
  Building2,
  Clock,
  Menu,
  X,
  ShieldCheck,
  Bell,
  HeartPulse,
} from 'lucide-react';

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Activity },
    { name: 'Patients', href: '/patients', icon: Users, badge: 'Member 2' },
    { name: 'Appointments', href: '/appointments', icon: Calendar, badge: 'Member 2' },
    { name: 'Doctor Directory', href: '/doctors', icon: Stethoscope },
    { name: 'Departments', href: '/departments', icon: Building2 },
    { name: 'Reception Queue', href: '/queue', icon: Clock },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-teal-600 text-white p-2 rounded-lg shadow-sm">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-slate-900">MediCore</span>
                  <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full">
                    Hospital OS
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Quick Badges & Header Right */}
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Member 2: Patient &amp; Appointment Module</span>
              </div>
              <button
                type="button"
                className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100 relative"
                aria-label="View notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
                <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
                  M2
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <p className="font-semibold text-slate-800">Hospital Staff</p>
                  <p className="text-slate-500">Member 2 Station</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Bar */}
        <nav className="hidden md:flex border-t border-slate-100 bg-slate-50/50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full flex space-x-1 py-1.5 overflow-x-auto">
            {navigation.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 mr-2 ${active ? 'text-white' : 'text-slate-500'}`} />
                  {item.name}
                  {item.badge && !active && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-semibold bg-teal-100 text-teal-800 rounded">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-3 space-y-1 shadow-md">
          {navigation.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
                  active
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-xs px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

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

