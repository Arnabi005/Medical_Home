import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  HeartPulse,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Stethoscope,
  X,
  Plus,
  ArrowRight,
  User,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Trash2,
  Sparkles,
  LogIn,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchPatients, registerPatient, deletePatient } from '../api/client';

export default function PatientsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [doctorOnlyFilter, setDoctorOnlyFilter] = useState(false);

  // Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  // Post-Registration Success Modal State
  const [newlyRegisteredAccount, setNewlyRegisteredAccount] = useState(null);
  const [autoLoggingIn, setAutoLoggingIn] = useState(false);

  // New Patient Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'FEMALE',
    dateOfBirth: '1995-05-20',
    bloodGroup: 'B+',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700020',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'Spouse',
    allergies: '',
    chronicConditions: '',
    department: 'Cardiology',
    assignedDoctor: 'Dr. Sarah Jenkins, MD',
  });

  const isPatientUser = user?.role === 'PATIENT';
  const isDoctor = user?.role === 'DOCTOR';
  const isAdmin = user?.role === 'ADMIN';
  const isReceptionist = user?.role === 'RECEPTIONIST';
  const isAdminOrReception = isAdmin || isReceptionist;

  const loadPatients = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        bloodGroup: bloodGroupFilter,
        role: user?.role,
        patientId: user?.patientId,
        email: user?.email,
        doctorName: isDoctor && doctorOnlyFilter ? user.name : undefined,
      };
      const response = await fetchPatients(params);
      setPatients(response.data || []);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [search, bloodGroupFilter, doctorOnlyFilter, user]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Form Validations
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setFormError('Please enter both First Name and Last Name.');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Contact phone number is required.');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('A valid Email address is required for future portal login.');
      return;
    }
    if (!formData.password) {
      setFormError('Please create a password for the patient account.');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match. Please re-enter identical passwords.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
        allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
        chronicConditions: formData.chronicConditions ? formData.chronicConditions.split(',').map((s) => s.trim()) : [],
      };

      const res = await registerPatient(payload);
      const registeredPatient = res.data;

      // Close input form and show the Success Account Credential Modal
      setShowRegisterModal(false);
      setNewlyRegisteredAccount({
        patient: registeredPatient,
        email: formData.email.trim(),
        password: formData.password,
        patientId: registeredPatient?.patientId || res.account?.patientId,
      });

      setStatusMessage({
        type: 'success',
        text: `Patient ${formData.firstName} ${formData.lastName} registered successfully with ID ${registeredPatient?.patientId}!`,
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        gender: 'FEMALE',
        dateOfBirth: '1995-05-20',
        bloodGroup: 'B+',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        address: '',
        city: 'Kolkata',
        state: 'West Bengal',
        postalCode: '700020',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: 'Spouse',
        allergies: '',
        chronicConditions: '',
        department: 'Cardiology',
        assignedDoctor: 'Dr. Sarah Jenkins, MD',
      });

      loadPatients();
    } catch (err) {
      console.error('Registration failed:', err);
      setFormError(err.message || 'Failed to register patient.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImmediateLoginAsPatient = async () => {
    if (!newlyRegisteredAccount) return;
    setAutoLoggingIn(true);
    try {
      await login({
        email: newlyRegisteredAccount.email,
        password: newlyRegisteredAccount.password,
        role: 'PATIENT',
      });
      setNewlyRegisteredAccount(null);
      setStatusMessage({
        type: 'success',
        text: `Logged in as ${newlyRegisteredAccount.patient?.firstName} ${newlyRegisteredAccount.patient?.lastName}!`,
      });
    } catch (err) {
      console.error('Auto login failed:', err);
      navigate('/login');
    } finally {
      setAutoLoggingIn(false);
    }
  };

  const handleDeletePatient = async (id, name, patientId) => {
    if (!isAdmin) return;
    if (!window.confirm(`Are you sure you want to permanently delete record for ${name} (${patientId})? This action cannot be undone.`)) {
      return;
    }

    try {
      await deletePatient(id);
      setStatusMessage({
        type: 'success',
        text: `Patient record ${name} (${patientId}) was successfully deleted.`,
      });
      loadPatients();
    } catch (err) {
      console.error('Failed to delete patient:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to delete patient record.',
      });
    }
  };

  // Metrics for Admin & Staff
  const totalPatientsCount = patients.length;
  const allergyAlertCount = patients.filter(
    (p) => p.allergies && p.allergies.length > 0 && p.allergies[0] !== 'None' && p.allergies[0] !== 'None reported'
  ).length;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-lightblue-200">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-lightblue-100 border border-lightblue-300 text-lightblue-700 flex items-center justify-center font-bold shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {isPatientUser ? 'My Medical Profile & Records' : 'Patient Management Portal'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isPatientUser
              ? 'View your personal patient health ID, emergency contacts, blood group, and care records'
              : 'Hospital directory for patient admissions, medical histories, demographics, and clinical care'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Register Patient Button: Available to Admin, Receptionist, or Guest/Visitors */}
          {!isPatientUser && (
            <button
              onClick={() => {
                setFormError('');
                setShowRegisterModal(true);
              }}
              style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/25 transition-all"
            >
              <UserPlus className="w-4 h-4 mr-1.5 text-white" />
              <span className="text-white font-bold">Register New Patient</span>
            </button>
          )}

          <Link
            to="/appointments"
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-lightblue-200 hover:bg-lightblue-50 hover:text-lightblue-700 transition-all shadow-xs"
          >
            <Calendar className="w-4 h-4 mr-1.5 text-lightblue-600" />
            {isPatientUser ? 'My Appointments' : 'All Appointments'}
          </Link>
        </div>
      </div>

      {/* Role-Specific Context Notice */}
      {isAuthenticated ? (
        <div className="p-3.5 rounded-xl bg-white border border-lightblue-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs shadow-xs">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${
              isAdmin ? 'bg-neonrose-500' : isDoctor ? 'bg-lightblue-500' : isReceptionist ? 'bg-sky-500' : 'bg-teal-500'
            }`}></span>
            <span className="text-slate-600">
              Signed in as <strong className="text-slate-900">{user.name}</strong> ({user.role})
            </span>
          </div>
          <div className="text-slate-500 text-[11px] font-medium">
            {isAdmin && '🛡️ Administrator Access: Full hospital patient master records, admission control & delete permissions'}
            {isReceptionist && '📋 Reception Desk: Walk-in patient admission, demographics verification & appointment scheduling'}
            {isDoctor && '🩺 Doctor Clinical View: Consulting patients, allergies, vitals & chronic medical alerts'}
            {isPatientUser && '🔒 Privacy Protected: Displaying your verified patient digital health ID and personal history'}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-lightblue-100 via-sky-50 to-white border border-lightblue-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs"
              style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">New to MediCore Hospital?</p>
              <p className="text-slate-600">
                Register as a new patient with your email and password to book appointments and access digital medical records.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                setFormError('');
                setShowRegisterModal(true);
              }}
              style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-xs"
            >
              <span className="text-white font-bold">Register Now</span>
            </button>
            <Link
              to="/login"
              className="px-3.5 py-2 bg-white border border-lightblue-200 text-slate-700 hover:bg-lightblue-50 font-semibold rounded-xl text-xs"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* Admin KPI Summary Cards: Light Blue */}
      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white border border-lightblue-200 shadow-xs">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Patients</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalPatientsCount}</div>
            <span className="text-[11px] text-lightblue-600 font-medium">Active Hospital Directory</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-neonrose-200 shadow-xs">
            <span className="text-neonrose-600 text-xs font-semibold uppercase tracking-wider">Allergy Alerts</span>
            <div className="text-2xl font-black text-neonrose-600 mt-1">{allergyAlertCount}</div>
            <span className="text-[11px] text-slate-500 font-medium">Flagged for Clinical Caution</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-lightblue-200 shadow-xs">
            <span className="text-lightblue-600 text-xs font-semibold uppercase tracking-wider">Registration Mode</span>
            <div className="text-sm font-bold text-slate-900 mt-2 flex items-center">
              <KeyRound className="w-4 h-4 mr-1.5 text-lightblue-600" />
              Auto-Portal Login
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Credentials generated</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-lightblue-200 shadow-xs">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Data Ownership</span>
            <div className="text-sm font-bold text-emerald-600 mt-2 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
              HIPAA &amp; RBAC Safe
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Admin &amp; Doctor Enforced</span>
          </div>
        </div>
      )}

      {/* Status Alert Notification */}
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
              <AlertTriangle className="w-4 h-4 text-neonrose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)}>
            <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar (For Staff & General views) */}
      {!isPatientUser && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className={`${isDoctor ? 'md:col-span-2' : 'md:col-span-3'} relative`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Patient Name, ID (MED-2026-...), phone number, or email..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-lightblue-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lightblue-500 focus:ring-1 focus:ring-lightblue-400 shadow-xs"
            />
          </div>

          <div>
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-lightblue-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-lightblue-500 shadow-xs"
            >
              <option value="">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>

          {/* Doctor filter toggle: My Assigned Patients */}
          {isDoctor && (
            <div>
              <button
                type="button"
                onClick={() => setDoctorOnlyFilter(!doctorOnlyFilter)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center transition-all ${
                  doctorOnlyFilter
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-white text-slate-700 border-lightblue-200 hover:bg-lightblue-50'
                }`}
                style={doctorOnlyFilter ? { backgroundColor: '#0284c7', color: '#ffffff' } : {}}
              >
                <Stethoscope className="w-3.5 h-3.5 mr-1.5 text-lightblue-600" />
                {doctorOnlyFilter ? 'Showing My Patients' : 'My Patients Only'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Patient Cards / Master List */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" aria-label="Loading patient records">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-sky-100 p-5 shadow-xs flex flex-col justify-between space-y-4 animate-pulse"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl skeleton-shimmer shrink-0"></div>
                  <div className="space-y-1.5">
                    <div className="w-24 h-4 rounded-md skeleton-shimmer"></div>
                    <div className="w-16 h-3 rounded-md skeleton-shimmer"></div>
                  </div>
                </div>
                <div className="w-12 h-6 rounded-full skeleton-shimmer"></div>
              </div>
              <div className="space-y-2">
                <div className="w-3/4 h-5 rounded-md skeleton-shimmer"></div>
                <div className="w-1/2 h-3.5 rounded-md skeleton-shimmer"></div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                <div className="h-4 rounded-md skeleton-shimmer"></div>
                <div className="h-4 rounded-md skeleton-shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-lightblue-200 text-slate-500">
          <Users className="w-8 h-8 text-lightblue-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">No patient records found.</p>
          <button
            onClick={() => {
              setSearch('');
              setBloodGroupFilter('');
              setDoctorOnlyFilter(false);
            }}
            className="mt-3 text-xs font-semibold text-lightblue-600 hover:text-lightblue-800"
          >
            Clear Filters
          </button>
        </div>
      ) : isPatientUser ? (
        /* PATIENT EXCLUSIVE VIEW: Verified Digital Health Identity Card */
        <div className="max-w-2xl mx-auto">
          {patients.slice(0, 1).map((pat) => (
            <div
              key={pat.id}
              className="bg-white rounded-3xl border-2 border-lightblue-300 p-6 shadow-xl overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-lightblue-500 via-sky-400 to-neonrose-400"></div>

              {/* ID Header */}
              <div className="flex items-center justify-between pb-4 border-b border-lightblue-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-lightblue-100 text-lightblue-700 border border-lightblue-200 flex items-center justify-center font-black text-lg shadow-xs">
                    {pat.firstName[0]}
                    {pat.lastName[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      {pat.firstName} {pat.lastName}
                    </h2>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-lightblue-50 text-lightblue-800 border border-lightblue-200">
                      ID: {pat.patientId}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-neonrose-50 text-neonrose-700 border border-neonrose-200">
                    🩸 Blood: {pat.bloodGroup}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">{pat.gender} &bull; {pat.age} Years</p>
                </div>
              </div>

              {/* Contact Details */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-center p-2.5 rounded-xl bg-lightblue-50/50 border border-lightblue-100">
                  <Phone className="w-4 h-4 mr-2 text-lightblue-600 shrink-0" />
                  <span>{pat.phone}</span>
                </div>
                <div className="flex items-center p-2.5 rounded-xl bg-lightblue-50/50 border border-lightblue-100">
                  <Mail className="w-4 h-4 mr-2 text-lightblue-600 shrink-0" />
                  <span className="truncate">{pat.email}</span>
                </div>
                <div className="flex items-center sm:col-span-2 p-2.5 rounded-xl bg-lightblue-50/50 border border-lightblue-100">
                  <MapPin className="w-4 h-4 mr-2 text-lightblue-600 shrink-0" />
                  <span>{pat.address}, {pat.city}, {pat.state} - {pat.postalCode}</span>
                </div>
              </div>

              {/* Clinical Details */}
              <div className="mt-5 pt-4 border-t border-lightblue-100 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-neonrose-700 uppercase tracking-wider mb-1.5 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1 text-neonrose-600" />
                    Known Drug Allergies
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {pat.allergies && pat.allergies.length > 0 && pat.allergies[0] !== 'None' ? (
                      pat.allergies.map((all, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-neonrose-50 text-neonrose-800 border border-neonrose-200 text-xs font-semibold">
                          ⚠️ {all}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No drug allergies recorded.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-lightblue-800 uppercase tracking-wider mb-1.5 flex items-center">
                    <Activity className="w-3.5 h-3.5 mr-1 text-lightblue-600" />
                    Chronic Health Conditions
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {pat.chronicConditions && pat.chronicConditions.map((cond, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-medium">
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-lightblue-50 border border-lightblue-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-lightblue-800 font-semibold">Assigned Care Team:</span>
                    <p className="text-slate-700">{pat.assignedDoctor} ({pat.department})</p>
                  </div>
                  <span className="text-lightblue-700 font-bold">{pat.totalVisits} Consultations</span>
                </div>
              </div>

              {/* Action Buttons for Patient */}
              <div className="mt-6 pt-4 border-t border-lightblue-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Last visit recorded: {pat.lastVisitDate}
                </span>
                <Link
                  to="/appointments"
                  style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center shadow-md shadow-sky-600/25"
                >
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-white" />
                  <span className="text-white font-bold">Book / View Appointments</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* MASTER PATIENT LIST FOR ADMIN, DOCTOR, RECEPTIONIST */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {patients.map((pat) => (
            <div
              key={pat.id}
              className="bg-white rounded-2xl border border-lightblue-200 p-5 shadow-xs hover:border-lightblue-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: ID, Gender, Blood Group */}
                <div className="flex items-center justify-between pb-3 border-b border-lightblue-100">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-lightblue-50 text-lightblue-800 border border-lightblue-200">
                      {pat.patientId}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {pat.gender} &bull; {pat.age} yrs
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-neonrose-50 text-neonrose-700 border border-neonrose-200">
                    🩸 {pat.bloodGroup}
                  </span>
                </div>

                {/* Patient Name & Primary Department */}
                <div className="mt-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    {pat.firstName} {pat.lastName}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center mt-0.5">
                    <Stethoscope className="w-3.5 h-3.5 mr-1 text-lightblue-600" />
                    <span>
                      Doctor: <strong className="text-slate-800">{pat.assignedDoctor}</strong> ({pat.department})
                    </span>
                  </p>
                </div>

                {/* Contact & Demographics */}
                <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1.5 text-lightblue-600 shrink-0" />
                    <span className="truncate">{pat.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1.5 text-lightblue-600 shrink-0" />
                    <span className="truncate">{pat.email}</span>
                  </div>
                  <div className="flex items-center sm:col-span-2">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-lightblue-600 shrink-0" />
                    <span className="truncate">{pat.address}, {pat.city}</span>
                  </div>
                </div>

                {/* Medical & Allergy Alerts */}
                <div className="mt-4 pt-3 border-t border-lightblue-100 space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] font-semibold text-slate-500">Known Allergies:</span>
                    {pat.allergies && pat.allergies.length > 0 && pat.allergies[0] !== 'None reported' && pat.allergies[0] !== 'None' ? (
                      pat.allergies.map((all, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-neonrose-50 text-neonrose-800 border border-neonrose-200 text-[10px] font-bold">
                          ⚠️ {all}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-[11px]">None reported</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] font-semibold text-slate-500">Chronic Conditions:</span>
                    {pat.chronicConditions && pat.chronicConditions.map((cond, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-medium">
                        {cond}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-600 bg-lightblue-50/50 p-2 rounded-xl border border-lightblue-100 flex items-center justify-between">
                    <span>
                      Emergency: <strong className="text-slate-800">{pat.emergencyContactName}</strong> ({pat.emergencyContactPhone})
                    </span>
                    <span className="text-lightblue-700 font-semibold">{pat.totalVisits} Consultations</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Role Specific */}
              <div className="mt-4 pt-3 border-t border-lightblue-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Last visit: {pat.lastVisitDate}
                </span>

                <div className="flex items-center space-x-2">
                  {/* ADMIN EXCLUSIVE: Delete Patient Record */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeletePatient(pat.id, `${pat.firstName} ${pat.lastName}`, pat.patientId)}
                      title="Permanently Delete Patient Record (Admin only)"
                      className="p-1.5 text-slate-400 hover:text-neonrose-600 rounded-lg hover:bg-neonrose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <Link
                    to={`/appointments?patientId=${pat.patientId}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold text-lightblue-700 bg-lightblue-50 hover:bg-lightblue-100 border border-lightblue-200 transition-colors shadow-xs"
                  >
                    Appointments <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NEW PATIENT REGISTRATION MODAL WITH PASSWORD & ACCOUNT CREATION */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-lightblue-200 my-8 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-lightblue-100">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-lightblue-100 text-lightblue-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">New Patient Admission &amp; Portal Account</h3>
                  <p className="text-[11px] text-slate-500">Demographics + Login Credentials for future sign-in</p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-neonrose-50 border border-neonrose-200 text-neonrose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-neonrose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3.5 text-xs sm:text-sm">
              
              {/* Personal Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="e.g. Ramesh"
                    className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="e.g. Sen"
                    className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-2.5 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500"
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-2 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-2 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-neonrose-700 font-bold focus:bg-white focus:outline-none focus:border-lightblue-500"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              {/* Phone & Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Residential City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Kolkata"
                    className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500"
                  />
                </div>
              </div>

              {/* SECURITY & PORTAL LOGIN CREDENTIALS SECTION */}
              <div className="p-3.5 rounded-xl bg-lightblue-50 border border-lightblue-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-lightblue-600" />
                  <span className="text-xs font-bold text-lightblue-900 uppercase tracking-wide">
                    Portal Login Credentials (Required for Future Sign In)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  This email and password will allow the patient to sign into the MediCore Patient Portal in the future to view prescriptions and book appointments.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Login Email *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. patient@example.com"
                      className="w-full pl-3 pr-8 py-2 bg-white border border-lightblue-300 rounded-xl text-slate-900 focus:outline-none focus:border-lightblue-500"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Create Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Min 6 characters"
                        className="w-full pl-3 pr-8 py-2 bg-white border border-lightblue-300 rounded-xl text-slate-900 focus:outline-none focus:border-lightblue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Re-enter password"
                        className="w-full pl-3 pr-8 py-2 bg-white border border-lightblue-300 rounded-xl text-slate-900 focus:outline-none focus:border-lightblue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical History & Emergency Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Known Drug Allergies</label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="e.g. Penicillin, Sulfa"
                    className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Chronic Conditions</label>
                  <input
                    type="text"
                    value={formData.chronicConditions}
                    onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                    placeholder="e.g. Hypertension, Asthma"
                    className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    placeholder="e.g. Suman Sen"
                    className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500"
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-lightblue-100">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm shadow-sky-600/30 disabled:opacity-50 flex items-center"
                >
                  <span className="text-white font-bold">{submitting ? 'Registering & Creating Account...' : 'Register Patient & Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST-REGISTRATION SUCCESS MODAL: PROMPT WITH GENERATED CREDENTIALS & LOGIN OPTION */}
      {newlyRegisteredAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-lightblue-200 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Patient Account Created!</h3>
            <p className="text-xs text-slate-500 mt-1">
              The patient has been registered and their secure login credentials are now active.
            </p>

            {/* Credential Card */}
            <div className="mt-4 p-4 rounded-xl bg-lightblue-50/50 border border-lightblue-200 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-lightblue-200">
                <span className="text-slate-500 font-semibold">Patient Name:</span>
                <span className="font-bold text-slate-900">
                  {newlyRegisteredAccount.patient?.firstName} {newlyRegisteredAccount.patient?.lastName}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-lightblue-200">
                <span className="text-slate-500 font-semibold">Assigned Medical ID:</span>
                <span className="font-mono font-bold text-lightblue-900 bg-white px-2 py-0.5 rounded border border-lightblue-200">
                  {newlyRegisteredAccount.patientId}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-lightblue-200">
                <span className="text-slate-500 font-semibold">Login Email:</span>
                <span className="font-medium text-slate-900">{newlyRegisteredAccount.email}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Password:</span>
                <span className="font-mono text-neonrose-700 bg-white px-2 py-0.5 rounded border border-lightblue-200">
                  {newlyRegisteredAccount.password}
                </span>
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded-xl bg-lightblue-50 border border-lightblue-200 text-[11px] text-lightblue-800 text-left">
              💡 <strong>Future Login Access:</strong> This patient can log into MediCore at any time using their Login Email and Password on the <strong>/login</strong> page.
            </div>

            {/* Action buttons */}
            <div className="mt-5 space-y-2">
              <button
                type="button"
                disabled={autoLoggingIn}
                onClick={handleImmediateLoginAsPatient}
                style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-sky-600/25 transition-all"
              >
                <LogIn className="w-4 h-4 mr-1.5 text-white" />
                <span className="text-white font-bold">{autoLoggingIn ? 'Signing in...' : 'Sign In as This Patient Now'}</span>
              </button>

              <button
                type="button"
                onClick={() => setNewlyRegisteredAccount(null)}
                className="w-full py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                Continue to Patient Directory
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
