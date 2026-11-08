import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  UserPlus,
  CalendarPlus,
  Users,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Database,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { fetchHealthStatus } from '../api/client';

export default function HomePage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealthStatus();
      setHealth(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Health check failed:', err);
      setError(err.message || 'Could not connect to MediCore backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="max-w-3xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-200 border border-teal-400/30 mb-3">
            MediCore Hospital Management System &bull; Initialized
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Patient &amp; Appointment Management Center
          </h1>
          <p className="mt-3 text-sm sm:text-base text-teal-100 leading-relaxed">
            Welcome to the centralized portal for patient registrations, medical profiles, doctor directories,
            and real-time appointment scheduling with conflict-free double-booking prevention.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/patients"
              className="inline-flex items-center px-4 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold text-sm transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Patient Registration
            </Link>
            <Link
              to="/appointments"
              className="inline-flex items-center px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur transition-colors border border-white/20"
            >
              <CalendarPlus className="w-4 h-4 mr-2" />
              Book Appointment
            </Link>
          </div>
        </div>
      </div>

      {/* Backend & Database Health Check Diagnostic Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-teal-600" />
              <h2 className="text-lg font-bold text-slate-800">System &amp; Backend Connectivity</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live status pinging Express backend at <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">/api/v1/health</code>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {lastChecked && (
              <span className="text-xs text-slate-400">Last checked: {lastChecked}</span>
            )}
            <button
              onClick={checkHealth}
              disabled={loading}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Checking...' : 'Ping API'}
            </button>
          </div>
        </div>

        <div className="mt-6">
          {loading && !health && !error && (
            <div className="py-8 text-center text-slate-500 text-sm flex flex-col items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mb-2" />
              <span>Checking connectivity to MediCore API...</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 text-rose-800 text-sm flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Failed to connect to backend server</p>
                <p className="text-xs text-rose-700 mt-1">{error}</p>
                <p className="text-xs text-rose-600 mt-2">
                  Ensure the Express server is running on port 5000 (<code className="bg-rose-100 px-1 py-0.5 rounded">npm run dev --prefix backend</code>).
                </p>
              </div>
            </div>
          )}

          {health && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Express Server Status */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Express Server</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Online
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800">{health.service}</p>
                <p className="text-xs text-slate-500 mt-1">Uptime: {health.uptime}</p>
              </div>

              {/* PostgreSQL & Prisma Status */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PostgreSQL (Prisma)</span>
                  {health.database?.status === 'connected' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800" title="Configure DATABASE_URL with a running PostgreSQL instance">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Pending DB
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {health.database?.status === 'connected' ? 'PostgreSQL Active' : 'Waiting for Database'}
                </p>
                <p className="text-xs text-slate-500 mt-1 truncate" title={health.database?.message}>
                  {health.database?.message}
                </p>
              </div>

              {/* Architecture & Modules */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Modular Architecture</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
                    v1.0.0
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800">Member 2: Ready</p>
                <p className="text-xs text-slate-500 mt-1">
                  Patients &bull; Scheduling &bull; Doctor Directory
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Module Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Patient Management */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Patient Management</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Register patients, manage medical IDs, update demographic information, address records, and
              emergency contact details with role-based access authorization.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-700">Patient Care</span>
            <Link
              to="/patients"
              className="inline-flex items-center text-xs font-semibold text-teal-600 hover:text-teal-800"
            >
              Open <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

        {/* Card 2: Appointment Management */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Appointment Management</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Book patient consultations, filter by department and doctor availability, prevent duplicate slots,
              and manage rescheduling or cancellations with audit trails.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700">Scheduling Service</span>
            <Link
              to="/appointments"
              className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Open <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

        {/* Card 3: Doctor & Staff Directory */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Doctor Directory &amp; Queue</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Browse doctor specializations, consulting schedules, slot durations, and receptionist daily queue
              status monitoring.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700">Shared Catalog</span>
            <Link
              to="/doctors"
              className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Open <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

