import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Building2,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Search,
  Filter,
  Ban,
  Check,
  FileText,
  UserCheck,
  Phone,
  ShieldCheck,
  CheckCheck,
  XCircle,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchAppointments,
  bookAppointment,
  cancelAppointment,
  updateAppointmentStatus,
  approveAppointment,
  deleteAppointment,
} from '../api/client';

const TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
];

const DOCTOR_OPTIONS = [
  { name: 'Dr. Sarah Jenkins, MD', dept: 'Cardiology' },
  { name: 'Dr. Rajesh Rao, DM', dept: 'Neurology & Neurosurgery' },
  { name: 'Dr. Ananya Mukherjee, MD', dept: 'Pediatrics & Neonatology' },
  { name: 'Dr. Vikramaditya Singh, MS', dept: 'Orthopedics & Joint Replacement' },
  { name: 'Dr. Meera Iyer, MD', dept: 'General Medicine & Diabetology' },
  { name: 'Dr. Robert Chen, MD', dept: 'Emergency & Trauma Care Unit' },
];

export default function AppointmentsPage() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Read URL query params (e.g. ?department=Cardiology or ?patientId=MED-2026-0001)
  const queryParams = new URLSearchParams(location.search);
  const initialDept = queryParams.get('department') || '';
  const initialPatientId = queryParams.get('patientId') || '';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showBookModal, setShowBookModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Notes Modal state (Doctor specific)
  const [selectedAptForNotes, setSelectedAptForNotes] = useState(null);
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Role detection
  const isAdmin = user?.role === 'ADMIN';
  const isDoctor = user?.role === 'DOCTOR';
  const isReceptionist = user?.role === 'RECEPTIONIST';
  const isPatientUser = user?.role === 'PATIENT';

  // Booking Form State
  const [formData, setFormData] = useState({
    patientName: isPatientUser ? user.name || 'Rina Das' : '',
    patientId: isPatientUser ? user.patientId || 'MED-2026-0001' : initialPatientId,
    patientPhone: '+91 98765 43210',
    doctorName: DOCTOR_OPTIONS[0].name,
    departmentName: initialDept || DOCTOR_OPTIONS[0].dept,
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:00',
    reasonForVisit: '',
  });

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const params = {
        role: user?.role,
        patientId: isPatientUser ? user.patientId || 'MED-2026-0001' : initialPatientId || undefined,
        doctorName: isDoctor ? user.name : undefined,
        status: statusFilter || undefined,
      };
      const res = await fetchAppointments(params);
      setAppointments(res.data || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user, statusFilter]);

  const handleDoctorChange = (e) => {
    const docName = e.target.value;
    const doc = DOCTOR_OPTIONS.find((d) => d.name === docName);
    setFormData((prev) => ({
      ...prev,
      doctorName: docName,
      departmentName: doc ? doc.dept : prev.departmentName,
    }));
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    try {
      // Patient bookings default to PENDING for admin review; Admin/Receptionist bookings are immediately confirmed
      const bookingPayload = {
        ...formData,
        status: isPatientUser ? 'PENDING' : 'CONFIRMED',
      };
      const res = await bookAppointment(bookingPayload);
      setStatusMessage({
        type: 'success',
        text: isPatientUser
          ? `Appointment request submitted! Status is PENDING approval by Hospital Administrator.`
          : res.message || 'Consultation successfully booked!',
      });
      setShowBookModal(false);
      loadAppointments();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Double-booking conflict: This time slot is already taken.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ADMIN: Accept / Approve Pending Appointment
  const handleAdminApprove = async (apt) => {
    try {
      const res = await approveAppointment(apt.id, user?.name || 'Administrator');
      setStatusMessage({ type: 'success', text: `Appointment ${apt.appointmentNumber} approved and confirmed!` });
      loadAppointments();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to approve appointment.' });
    }
  };

  // ADMIN / PATIENT: Cancel / Reject Appointment
  const handleCancel = async (apt, reason = 'Cancelled by user') => {
    const promptMsg = isAdmin
      ? `Reject and cancel appointment ${apt.appointmentNumber} for ${apt.patientName}?`
      : `Are you sure you want to cancel your consultation ${apt.appointmentNumber}?`;
    if (!window.confirm(promptMsg)) {
      return;
    }
    try {
      const res = await cancelAppointment(apt.id, reason, user?.name || (isAdmin ? 'Admin' : 'Patient'));
      setStatusMessage({ type: 'success', text: res.message });
      loadAppointments();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to cancel appointment.' });
    }
  };

  // ADMIN: Delete Appointment permanently
  const handleAdminDelete = async (apt) => {
    if (!window.confirm(`ADMIN ACTION: Permanently delete appointment record ${apt.appointmentNumber}? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await deleteAppointment(apt.id);
      setStatusMessage({ type: 'success', text: res.message });
      loadAppointments();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete appointment.' });
    }
  };

  // DOCTOR / RECEPTIONIST: Status progression
  const handleStatusUpdate = async (apt, newStatus) => {
    try {
      const res = await updateAppointmentStatus(apt.id, newStatus);
      setStatusMessage({ type: 'success', text: res.message });
      loadAppointments();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update status.' });
    }
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    if (!selectedAptForNotes) return;
    try {
      await updateAppointmentStatus(selectedAptForNotes.id, selectedAptForNotes.status, clinicalNotes);
      setStatusMessage({ type: 'success', text: `Clinical notes updated for ${selectedAptForNotes.patientName}.` });
      setSelectedAptForNotes(null);
      loadAppointments();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update notes.' });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-neonrose-50 text-neonrose-700 border-neonrose-300 animate-pulse';
      case 'CONFIRMED':
        return 'bg-lightblue-100 text-lightblue-800 border-lightblue-300';
      case 'IN_PROGRESS':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-500 border-slate-300 line-through';
      case 'SCHEDULED':
      default:
        return 'bg-lightblue-50 text-lightblue-800 border-lightblue-200';
    }
  };

  // Calculated counts for Admin & Staff metrics
  const pendingCount = appointments.filter((a) => a.status === 'PENDING').length;
  const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'SCHEDULED').length;
  const inProgressCount = appointments.filter((a) => a.status === 'IN_PROGRESS').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-lightblue-200">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-lightblue-100 border border-lightblue-300 text-lightblue-700 flex items-center justify-center font-bold shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {isAdmin
                ? 'Appointment Administration & Oversight'
                : isDoctor
                ? 'Doctor Consultation Queue'
                : isReceptionist
                ? 'Reception Waiting Room Desk'
                : 'My Health Appointments & Visits'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isAdmin
              ? 'Accept pending patient bookings, triage consultation statuses, reassign slots, or cancel conflicts'
              : isDoctor
              ? 'Patient queue assigned to you, consultation chamber triage, and medical notes'
              : isReceptionist
              ? 'Front desk triage, walk-in tokens, and patient check-in management'
              : 'View your booked appointments, check approval status, and schedule consultation visits'}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowBookModal(true)}
            style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/25 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5 text-white" />
            <span className="text-white font-bold">{isPatientUser ? 'Book Consultation' : 'New Appointment'}</span>
          </button>
        </div>
      </div>

      {/* Role-Specific Banner & Metrics */}
      {isAuthenticated && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-white border border-lightblue-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs shadow-xs">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-neonrose-500' : 'bg-lightblue-500'}`}></span>
              <span className="text-slate-600">
                Logged in as <strong className="text-slate-900">{user.name}</strong> ({user.role})
              </span>
            </div>
            <div className="text-slate-500 text-[11px] font-medium">
              {isAdmin && '🛡️ Administrator Access: Full authority to Accept, Approve, Cancel, or Delete appointments'}
              {isDoctor && '🩺 Clinician Mode: Advance consultations to chamber and record clinical advice'}
              {isReceptionist && '📋 Receptionist Mode: Manage walk-in tokens and check in arriving patients'}
              {isPatientUser && '👤 Patient Mode: Showing only your personal consultations and doctors advice'}
            </div>
          </div>

          {/* Admin Command Dashboard Stats */}
          {isAdmin && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-neonrose-50/80 rounded-xl border border-neonrose-200 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-[11px] font-bold uppercase text-neonrose-700 tracking-wider">Pending Review</p>
                  <p className="text-2xl font-black text-neonrose-900 mt-0.5">{pendingCount}</p>
                </div>
                <Clock className="w-6 h-6 text-neonrose-500 opacity-90 animate-pulse" />
              </div>

              <div className="p-3.5 bg-lightblue-50/80 rounded-xl border border-lightblue-200 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-[11px] font-bold uppercase text-lightblue-800 tracking-wider">Confirmed</p>
                  <p className="text-2xl font-black text-lightblue-950 mt-0.5">{confirmedCount}</p>
                </div>
                <CheckCircle2 className="w-6 h-6 text-lightblue-600 opacity-90" />
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-lightblue-200 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-[11px] font-bold uppercase text-sky-800 tracking-wider">In Chamber</p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">{inProgressCount}</p>
                </div>
                <Stethoscope className="w-6 h-6 text-sky-600 opacity-80" />
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-lightblue-200 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider">Completed</p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">{completedCount}</p>
                </div>
                <CheckCheck className="w-6 h-6 text-emerald-600 opacity-80" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alert Notification */}
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

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {['', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => {
            const isTabActive = statusFilter === st;
            const isPendingTab = st === 'PENDING';
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={isTabActive && !isPendingTab ? { backgroundColor: '#0284c7', color: '#ffffff' } : {}}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  isTabActive
                    ? isPendingTab
                      ? 'bg-neonrose-500 text-white shadow-xs'
                      : 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-lightblue-200 hover:bg-lightblue-50 hover:text-lightblue-800'
                }`}
              >
                <span>{st === '' ? 'All Appointments' : st.replace('_', ' ')}</span>
                {isPendingTab && pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white text-neonrose-600 animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Showing {appointments.length} Consultations
        </span>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="space-y-3" aria-label="Loading appointments">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-sky-100 p-4 sm:p-5 shadow-xs animate-pulse flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-12 h-12 rounded-xl skeleton-shimmer shrink-0"></div>
                <div className="space-y-2">
                  <div className="w-36 h-4 rounded-md skeleton-shimmer"></div>
                  <div className="w-24 h-3 rounded-md skeleton-shimmer"></div>
                  <div className="w-48 h-3 rounded-md skeleton-shimmer"></div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-7 rounded-lg skeleton-shimmer"></div>
                <div className="w-24 h-7 rounded-lg skeleton-shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-lightblue-200 text-slate-500">
          <Calendar className="w-8 h-8 text-lightblue-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">No appointments found matching this view.</p>
          <button
            onClick={() => setStatusFilter('')}
            className="mt-3 text-xs font-semibold text-lightblue-600 hover:text-lightblue-800"
          >
            Show All Consultations
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                apt.status === 'PENDING'
                  ? 'border-neonrose-300 bg-neonrose-50/20 ring-1 ring-neonrose-300/30'
                  : apt.status === 'IN_PROGRESS'
                  ? 'border-lightblue-400 ring-1 ring-lightblue-400/40 bg-lightblue-50/30'
                  : 'border-lightblue-200 hover:border-lightblue-400 hover:shadow-sm'
              }`}
            >
              {/* Left Column: Token, Patient, Doctor, Details */}
              <div className="flex items-start space-x-3.5">
                {/* Queue Token Badge */}
                <div
                  className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center shrink-0 ${
                    apt.status === 'PENDING'
                      ? 'bg-neonrose-50 border-neonrose-200 text-neonrose-700'
                      : 'bg-lightblue-50 border-lightblue-200 text-lightblue-800'
                  }`}
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-75 leading-none">Token</span>
                  <span className="text-base font-black leading-none mt-0.5">#{apt.queueNumber || '1'}</span>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-lightblue-50 text-lightblue-800 border border-lightblue-200">
                      {apt.appointmentNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusBadge(apt.status)}`}>
                      {apt.status === 'PENDING' ? '⏳ Pending Approval' : apt.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {apt.patientName}{' '}
                    <span className="text-xs font-normal text-slate-400 font-mono">({apt.patientId})</span>
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600">
                    <span className="flex items-center text-lightblue-700 font-semibold">
                      <Stethoscope className="w-3.5 h-3.5 mr-1 text-lightblue-600" />
                      {apt.doctorName}
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-500">{apt.departmentName}</span>
                  </div>

                  {apt.reasonForVisit && (
                    <p className="text-xs text-slate-600 mt-1">
                      <strong className="text-slate-700">Reason:</strong> {apt.reasonForVisit}
                    </p>
                  )}

                  {apt.doctorNotes && (
                    <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                      <strong>🩺 Doctor Clinical Note:</strong> {apt.doctorNotes}
                    </div>
                  )}

                  {apt.cancellationReason && (
                    <p className="text-xs text-neonrose-600 italic mt-1">
                      Cancellation reason: {apt.cancellationReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Time Slot & Role Actions */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-lightblue-100">
                <div className="text-left md:text-right">
                  <p className="text-xs font-bold text-slate-900 flex items-center md:justify-end">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-lightblue-600" />
                    {apt.appointmentDate}
                  </p>
                  <p className="text-xs font-semibold text-lightblue-700 flex items-center md:justify-end mt-0.5">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Slot: {apt.appointmentTime}
                  </p>
                </div>

                {/* ROLE-SPECIFIC ACTION BUTTONS */}
                <div className="flex flex-wrap items-center gap-1.5">
                  
                  {/* ==================== 1. ADMIN ACTIONS ==================== */}
                  {isAdmin && (
                    <>
                      {/* Admin Accept / Approve Pending Booking */}
                      {apt.status === 'PENDING' && (
                        <button
                          onClick={() => handleAdminApprove(apt)}
                          style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-all"
                          title="Accept and confirm this appointment"
                        >
                          <Check className="w-3.5 h-3.5 mr-1 text-white" />
                          <span className="text-white font-bold">Accept &amp; Approve</span>
                        </button>
                      )}

                      {/* Admin Reject / Cancel */}
                      {apt.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancel(apt, 'Rejected by Administrator')}
                          className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-neonrose-50 hover:bg-neonrose-100 text-neonrose-700 border border-neonrose-200 transition-colors"
                          title="Cancel / Reject appointment"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          {apt.status === 'PENDING' ? 'Reject' : 'Cancel'}
                        </button>
                      )}

                      {/* Admin Delete Record */}
                      <button
                        onClick={() => handleAdminDelete(apt)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-neonrose-600 hover:bg-neonrose-50 transition-colors"
                        title="Delete record from system (Admin only)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* ==================== 2. DOCTOR ACTIONS ==================== */}
                  {isDoctor && (
                    <>
                      {(apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') && (
                        <button
                          onClick={() => handleStatusUpdate(apt, 'IN_PROGRESS')}
                          style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-xs"
                        >
                          <Stethoscope className="w-3.5 h-3.5 mr-1 text-white" />
                          <span className="text-white font-bold">Call to Chamber</span>
                        </button>
                      )}
                      {apt.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStatusUpdate(apt, 'COMPLETED')}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                        >
                          <CheckCheck className="w-3.5 h-3.5 mr-1" />
                          Complete Visit
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedAptForNotes(apt);
                          setClinicalNotes(apt.doctorNotes || '');
                        }}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-lightblue-50 hover:bg-lightblue-100 text-lightblue-800 border border-lightblue-200"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1 text-lightblue-600" />
                        Clinical Notes
                      </button>
                    </>
                  )}

                  {/* ==================== 3. RECEPTIONIST ACTIONS ==================== */}
                  {isReceptionist && (
                    <>
                      {apt.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleStatusUpdate(apt, 'IN_PROGRESS')}
                          style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white"
                        >
                          <span className="text-white font-bold">Check In Patient</span>
                        </button>
                      )}
                      {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleCancel(apt, 'Cancelled at reception')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-neonrose-50 hover:bg-neonrose-100 text-neonrose-700 border border-neonrose-200"
                        >
                          Cancel
                        </button>
                      )}
                    </>
                  )}

                  {/* ==================== 4. PATIENT ACTIONS ==================== */}
                  {isPatientUser && (
                    <>
                      {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleCancel(apt, 'Patient cancelled online')}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neonrose-50 hover:bg-neonrose-100 text-neonrose-700 border border-neonrose-200 transition-colors"
                        >
                          Cancel My Booking
                        </button>
                      )}
                      {apt.status === 'COMPLETED' && apt.doctorNotes && (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          Prescription Ready
                        </span>
                      )}
                    </>
                  )}

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book New Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-lightblue-200 my-8 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-lightblue-100">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-lightblue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {isPatientUser ? 'Book Your Doctor Consultation' : 'Schedule Patient Appointment'}
                </h3>
              </div>
              <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="mt-4 space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="e.g. Rina Das"
                    className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500 focus:ring-1 focus:ring-lightblue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Patient Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500 focus:ring-1 focus:ring-lightblue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Consulting Specialist *
                </label>
                <select
                  value={formData.doctorName}
                  onChange={handleDoctorChange}
                  className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500 focus:ring-1 focus:ring-lightblue-400"
                >
                  {DOCTOR_OPTIONS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name} ({d.dept})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Consultation Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Available Time Slot *
                  </label>
                  <select
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500 font-semibold"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Reason for Consultation / Medical Symptoms
                </label>
                <textarea
                  rows="2"
                  value={formData.reasonForVisit}
                  onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
                  placeholder="Describe your symptoms or reason for visit..."
                  className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500"
                />
              </div>

              {isPatientUser && (
                <div className="p-2.5 rounded-xl bg-lightblue-50 border border-lightblue-200 text-xs text-lightblue-800 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-lightblue-600 shrink-0" />
                  <span>Your booking will be placed in PENDING status for immediate Administrator acceptance.</span>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-lightblue-100">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm shadow-sky-600/30 disabled:opacity-50"
                >
                  <span className="text-white font-bold">{submitting ? 'Booking Slot...' : isPatientUser ? 'Submit Appointment Request' : 'Confirm Booking'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Clinical Notes Modal */}
      {selectedAptForNotes && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-lightblue-200 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-lightblue-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-lightblue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Clinical Examination &amp; Notes
                </h3>
              </div>
              <button onClick={() => setSelectedAptForNotes(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotes} className="mt-4 space-y-3.5">
              <p className="text-xs text-slate-500">
                Recording advice for: <strong className="text-slate-900">{selectedAptForNotes.patientName}</strong> ({selectedAptForNotes.patientId})
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Vitals, Diagnosis, &amp; Prescription Summary
                </label>
                <textarea
                  rows="4"
                  required
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Record blood pressure, diagnosis, prescribed medication, and next follow-up date..."
                  className="w-full px-3 py-2 bg-lightblue-50/50 border border-lightblue-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-lightblue-500 text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-lightblue-100">
                <button
                  type="button"
                  onClick={() => setSelectedAptForNotes(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs"
                >
                  <span className="text-white font-bold">Save Clinical Notes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
