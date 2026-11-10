import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  UserPlus,
  CalendarPlus,
  Users,
  Calendar,
  Building2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  PhoneCall,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="space-y-8">
      
      {/* Hero Welcome Banner: Clinical Light Blue with Neon Rose Pulse */}
      <div className="relative rounded-3xl p-6 sm:p-10 shadow-lg border border-sky-200 bg-gradient-to-br from-sky-100/90 via-sky-50 to-white overflow-hidden text-slate-800">
        {/* Soft background atmospheric glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-sky-200/50 pointer-events-none blur-3xl"></div>
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-neonrose-100/40 pointer-events-none blur-3xl"></div>

        <div className="max-w-3xl relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-white text-sky-900 border border-sky-200 shadow-xs">
              <HeartPulse className="w-3.5 h-3.5 mr-1.5 text-neonrose-500 animate-pulse" />
              24/7 Advanced Healthcare &bull; Patient Care Center
            </span>
            {isAuthenticated && user && (
              <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-white text-slate-700 border border-sky-200 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                Active: <strong className="ml-1 text-slate-900">{user.name || user.email}</strong> ({user.role})
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900">
            Comprehensive Hospital &amp; <span className="text-sky-600">Patient Care</span> Center
          </h1>
          <p className="mt-3.5 text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl">
            Welcome to MediCore Hospital. Connecting patients with leading clinical specialists,
            managing conflict-free appointments, in-patient admissions, and round-the-clock emergency care.
          </p>

          <div className="mt-7 flex flex-wrap gap-3.5">
            <Link
              to="/patients"
              style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition-all shadow-md shadow-sky-600/25"
            >
              <UserPlus className="w-4 h-4 mr-2 text-white" />
              <span className="text-white font-bold">Patient Registration</span>
            </Link>
            <Link
              to="/appointments"
              style={{ backgroundColor: '#ff1464', color: '#ffffff' }}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-neonrose-500 hover:bg-neonrose-600 text-white font-bold text-sm transition-all shadow-md shadow-neonrose-600/30"
            >
              <CalendarPlus className="w-4 h-4 mr-2 text-white" />
              <span className="text-white font-bold">Book Appointment</span>
            </Link>
            <Link
              to="/departments"
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-semibold text-sm transition-all border border-sky-200 shadow-xs"
            >
              <Building2 className="w-4 h-4 mr-2 text-sky-600" />
              <span>Specialties &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hospital Key Care Highlights: Light Blue Card System */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-lightblue-200 p-4.5 shadow-sm shadow-lightblue-100/50 flex items-center space-x-3.5 hover:border-lightblue-400 hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-lightblue-100 border border-lightblue-300 text-lightblue-700 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <p className="text-base font-extrabold text-slate-900">50+ Specialists</p>
            <p className="text-xs text-slate-500">Board-Certified Doctors</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neonrose-200 p-4.5 shadow-sm shadow-neonrose-100/40 flex items-center space-x-3.5 hover:border-neonrose-400 hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-neonrose-50 border border-neonrose-200 text-neonrose-600 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <p className="text-base font-extrabold text-slate-900">24/7 Emergency</p>
            <p className="text-xs text-neonrose-600 font-bold">Trauma &amp; Critical ICU</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-lightblue-200 p-4.5 shadow-sm shadow-lightblue-100/50 flex items-center space-x-3.5 hover:border-lightblue-400 hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-lightblue-100 border border-lightblue-300 text-lightblue-700 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-base font-extrabold text-slate-900">6 Special Units</p>
            <p className="text-xs text-slate-500">Cardio, Neuro, Peds</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-lightblue-200 p-4.5 shadow-sm shadow-lightblue-100/50 flex items-center space-x-3.5 hover:border-lightblue-400 hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-lightblue-100 border border-lightblue-300 text-lightblue-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-base font-extrabold text-slate-900">Verified Care</p>
            <p className="text-xs text-slate-500">HIPAA &amp; RBAC Protected</p>
          </div>
        </div>
      </div>

      {/* Hospital Portal Navigation Cards */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-lightblue-500 mr-2"></span>
              Healthcare Services &amp; Portals
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Access patient management, appointment scheduling, and department directories</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Patient Management */}
          <div className="bg-white rounded-2xl border border-lightblue-200 p-6 shadow-sm shadow-lightblue-100/60 hover:border-lightblue-400 hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-11 h-11 rounded-xl bg-lightblue-100 text-lightblue-700 border border-lightblue-300 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-lightblue-700 transition-colors">Patient Management</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Register patients, view medical IDs, demographic records, emergency contacts, and vital clinical notes with role-based privacy protection.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-lightblue-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-lightblue-700">Patient Care Registry</span>
              <Link
                to="/patients"
                className="inline-flex items-center text-xs font-bold text-lightblue-600 hover:text-lightblue-800 transition-colors"
              >
                Open Portal <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* Card 2: Appointment Management */}
          <div className="bg-white rounded-2xl border border-lightblue-200 p-6 shadow-sm shadow-lightblue-100/60 hover:border-neonrose-300 hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-11 h-11 rounded-xl bg-neonrose-50 text-neonrose-600 border border-neonrose-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-neonrose-600 transition-colors">Appointment Scheduling</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Book consultations, manage doctor schedules, accept/approve appointments, check queue statuses, and record clinical visit notes.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-lightblue-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-neonrose-600">Scheduling Hub</span>
              <Link
                to="/appointments"
                className="inline-flex items-center text-xs font-bold text-neonrose-600 hover:text-neonrose-800 transition-colors"
              >
                Open Portal <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* Card 3: Department Directory */}
          <div className="bg-white rounded-2xl border border-lightblue-200 p-6 shadow-sm shadow-lightblue-100/60 hover:border-lightblue-400 hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-11 h-11 rounded-xl bg-lightblue-100 text-lightblue-700 border border-lightblue-300 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-lightblue-700 transition-colors">Hospital Departments</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Explore specialized medical units, bed capacities, ward locations, department contact extensions, and clinical leadership.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-lightblue-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-lightblue-700">Specialty Directory</span>
              <Link
                to="/departments"
                className="inline-flex items-center text-xs font-bold text-lightblue-600 hover:text-lightblue-800 transition-colors"
              >
                Open Portal <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
