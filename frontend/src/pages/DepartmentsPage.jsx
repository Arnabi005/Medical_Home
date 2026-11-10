import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Stethoscope,
  Bed,
  Phone,
  Clock,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  ShieldCheck,
  Activity,
  ArrowRight,
  Filter,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchDepartments, createDepartment } from '../api/client';

export default function DepartmentsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // New Department Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    headOfDepartment: '',
    floor: 'Building A, 1st Floor',
    contactExt: '2100',
    totalBeds: 25,
    description: '',
  });

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const response = await fetchDepartments({ search });
      setDepartments(response.data || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, [search]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    try {
      await createDepartment(formData);
      setStatusMessage({ type: 'success', text: `Department ${formData.name} successfully created!` });
      setShowAddModal(false);
      setFormData({
        name: '',
        code: '',
        headOfDepartment: '',
        floor: 'Building A, 1st Floor',
        contactExt: '2100',
        totalBeds: 25,
        description: '',
      });
      loadDepartments();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to create department.' });
    } finally {
      setSubmitting(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isDoctor = user?.role === 'DOCTOR';
  const userDept = user?.department;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Role Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-lightblue-200">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-lightblue-100 border border-lightblue-300 text-lightblue-700 flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Hospital Departments</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Clinical specialties, inpatient wards, consultation hours, and department staff directories
          </p>
        </div>

        {/* Role-Specific Action Controls */}
        <div className="flex items-center space-x-3">
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/25 transition-all"
            >
              <Plus className="w-4 h-4 mr-1.5 text-white" />
              <span className="text-white font-bold">Add Department</span>
            </button>
          )}

          <Link
            to="/appointments"
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-lightblue-200 hover:bg-lightblue-50 hover:text-lightblue-700 transition-all shadow-xs"
          >
            <Calendar className="w-4 h-4 mr-1.5 text-lightblue-600" />
            Book Consultation
          </Link>
        </div>
      </div>

      {/* Role Context Notification Bar */}
      {isAuthenticated && (
        <div className="p-3.5 rounded-xl bg-white border border-lightblue-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-lightblue-500"></span>
            <span className="text-slate-600">
              Viewing as <strong className="text-slate-900">{user.name}</strong> ({user.role})
            </span>
            {userDept && (
              <span className="px-2 py-0.5 rounded bg-lightblue-100 text-lightblue-800 font-bold text-[11px] border border-lightblue-200">
                Assigned Unit: {userDept}
              </span>
            )}
          </div>
          <div className="text-slate-500 text-[11px]">
            {isAdmin && '🛡️ Administrator Access: Full privileges to add and configure department units'}
            {isDoctor && '🩺 Clinician View: Department colleagues & ward bed occupancy overview'}
            {user.role === 'PATIENT' && '👤 Patient View: Explore specialties and consult with qualified doctors'}
          </div>
        </div>
      )}

      {/* Notification Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl flex items-center justify-between text-xs sm:text-sm ${
            statusMessage.type === 'success'
              ? 'bg-lightblue-50 text-lightblue-900 border border-lightblue-300'
              : 'bg-neonrose-50 text-neonrose-900 border border-neonrose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-lightblue-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-neonrose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)}>
            <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
          </button>
        </div>
      )}

      {/* Search Bar & Metrics Cards: Light Blue */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments by name, code (e.g. CARD), or specialist head..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-lightblue-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lightblue-500 focus:ring-1 focus:ring-lightblue-400 shadow-xs"
          />
        </div>

        {/* Quick Stat 1 */}
        <div className="p-3 bg-white rounded-xl border border-lightblue-200 flex items-center space-x-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-lightblue-100 text-lightblue-700 border border-lightblue-300 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Departments</p>
            <p className="text-sm font-bold text-slate-900">{departments.length} Clinical Units</p>
          </div>
        </div>

        {/* Quick Stat 2: Emergency in Neon Rose */}
        <div className="p-3 bg-white rounded-xl border border-neonrose-200 flex items-center space-x-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-neonrose-50 text-neonrose-600 border border-neonrose-200 flex items-center justify-center font-bold">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-neonrose-700 font-bold">24/7 Trauma Emergency</p>
            <p className="text-sm font-bold text-slate-900">
              {departments.filter((d) => d.emergencyAvailable).length} Active Bays
            </p>
          </div>
        </div>
      </div>

      {/* Departments Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" aria-label="Loading departments">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-sky-100 p-5 shadow-xs flex flex-col justify-between space-y-4 animate-pulse"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl skeleton-shimmer shrink-0"></div>
                  <div className="space-y-1.5">
                    <div className="w-28 h-4 rounded-md skeleton-shimmer"></div>
                    <div className="w-16 h-3 rounded-md skeleton-shimmer"></div>
                  </div>
                </div>
                <div className="w-14 h-5 rounded-full skeleton-shimmer"></div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-3.5 rounded-md skeleton-shimmer"></div>
                <div className="w-4/5 h-3.5 rounded-md skeleton-shimmer"></div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                <div className="h-4 rounded-md skeleton-shimmer"></div>
                <div className="h-4 rounded-md skeleton-shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      ) : departments.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-lightblue-200 text-slate-500">
          <Building2 className="w-8 h-8 text-lightblue-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">No departments found matching "{search}"</p>
          <button
            onClick={() => setSearch('')}
            className="mt-3 text-xs font-semibold text-lightblue-600 hover:text-lightblue-800"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => {
            const isUserDepartment = userDept && dept.name.toLowerCase().includes(userDept.toLowerCase());
            return (
              <div
                key={dept.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs hover:border-lightblue-400 hover:shadow-md transition-all flex flex-col justify-between ${
                  isUserDepartment ? 'border-lightblue-400 ring-1 ring-lightblue-400/40 bg-lightblue-50/20' : 'border-lightblue-200'
                }`}
              >
                <div>
                  {/* Department Code & Status Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider bg-lightblue-50 text-lightblue-800 border border-lightblue-200">
                      {dept.code}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {dept.emergencyAvailable && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-neonrose-50 text-neonrose-700 border border-neonrose-200">
                          24/7 Emergency
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-emerald-600" />
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Name & Special Highlight */}
                  <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
                  {isUserDepartment && (
                    <span className="inline-block mt-1 text-[11px] font-semibold text-lightblue-800 bg-lightblue-100 border border-lightblue-200 px-2 py-0.5 rounded">
                      ★ Your Assigned Clinical Department
                    </span>
                  )}

                  {/* Description */}
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {dept.description}
                  </p>

                  {/* Department Details */}
                  <div className="mt-4 pt-3 border-t border-lightblue-100 space-y-2 text-xs">
                    <div className="flex items-center text-slate-800">
                      <Stethoscope className="w-3.5 h-3.5 mr-2 text-lightblue-600 shrink-0" />
                      <span className="truncate">
                        <strong>HOD:</strong> {dept.headOfDepartment}
                      </span>
                    </div>

                    <div className="flex items-center text-slate-600">
                      <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                      <span className="truncate">{dept.floor}</span>
                    </div>

                    <div className="flex items-center text-slate-600">
                      <Phone className="w-3.5 h-3.5 mr-2 text-slate-400 shrink-0" />
                      <span>Ext: {dept.contactExt}</span>
                      <span className="mx-2 text-slate-300">&bull;</span>
                      <Bed className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                      <span>{dept.availableBeds} / {dept.totalBeds} Beds Free</span>
                    </div>

                    <div className="flex items-center text-slate-500 text-[11px]">
                      <Clock className="w-3 h-3 mr-1.5 text-slate-400 shrink-0" />
                      <span className="truncate">{dept.operatingHours}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3 border-t border-lightblue-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {dept.activeDoctorsCount} Specialists On Duty
                  </span>
                  <Link
                    to={`/appointments?department=${encodeURIComponent(dept.name)}`}
                    className="inline-flex items-center text-xs font-bold text-lightblue-600 hover:text-lightblue-800 transition-colors"
                  >
                    Consult Doctor <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-lightblue-200 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-lightblue-100">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-lightblue-600" />
                <h3 className="text-base font-bold text-slate-900">Add New Hospital Department</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Oncology & Chemotherapy"
                    className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Dept Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. ONCO"
                    className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Head of Department (HOD)
                </label>
                <input
                  type="text"
                  value={formData.headOfDepartment}
                  onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                  placeholder="e.g. Dr. Priya Sen, MD, DM"
                  className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Floor Location
                  </label>
                  <input
                    type="text"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Extension
                  </label>
                  <input
                    type="text"
                    value={formData.contactExt}
                    onChange={(e) => setFormData({ ...formData, contactExt: e.target.value })}
                    className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Total Beds
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalBeds}
                    onChange={(e) => setFormData({ ...formData, totalBeds: e.target.value })}
                    className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Clinical Services &amp; Description
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of treatments, specialized surgical equipment, and OPD schedule..."
                  className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-lightblue-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  <span className="text-white font-bold">{submitting ? 'Saving...' : 'Create Department'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
