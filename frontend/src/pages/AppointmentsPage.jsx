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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchAppointments, bookAppointment, cancelAppointment, updateAppointmentStatus } from '../api/client';

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

  // Notes Modal state
  const [selectedAptForNotes, setSelectedAptForNotes] = useState(null);
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Booking Form State
  const [formData, setFormData] = useState({
    patientName: user?.role === 'PATIENT' ? user.name || 'Rina Das' : '',
    patientId: user?.role === 'PATIENT' ? user.patientId || 'MED-2026-0001' : initialPatientId,
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
        patientId: user?.role === 'PATIENT' ? user.patientId || 'MED-2026-0001' : initialPatientId || undefined,
        doctorName: user?.role === 'DOCTOR' ? user.name : undefined,
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
      const res = await bookAppointment(formData);
      setStatusMessage({
        type: 'success',
        text: res.message || 'Consultation successfully booked!',
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

  const handleCancel = async (apt) => {
    if (!window.confirm(`Are you sure you want to cancel appointment ${apt.appointmentNumber}?`)) {
      return;
    }
    try {
      const res = await cancelAppointment(apt.id, 'Cancelled upon patient request', user?.name || 'Staff');
      setStatusMessage({ type: 'success', text: res.message });
      loadAppointments();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to cancel appointment.' });
    }
  };

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

  const isPatientUser = user?.role === 'PATIENT';
  const isDoctor = user?.role === 'DOCTOR';
  const isAdminOrReception = user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-300 line-through';
      case 'SCHEDULED':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isPatientUser
                ? 'My Consultations & Appointments'
                : isDoctor
                ? 'Doctor Consultation Schedule'
                : 'Appointment & Queue Management'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isPatientUser
              ? 'View your active consultation bookings, queue tokens, and physician clinical notes'
              : isDoctor
              ? 'Today’s consultation queue, active patient examinations, and clinical records'
              : 'Real-time patient bookings, queue tokens, and double-booking conflict prevention'}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowBookModal(true)}
            className="inline-flex items-center px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Book New Appointment
          </button>
        </div>
      </div>

      {/* Role Notice */}
      {isAuthenticated && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span className="text-slate-600">
              Active User: <strong className="text-slate-900">{user.name}</strong> ({user.role})
            </span>
          </div>
          <div className="text-slate-500 text-[11px]">
            {isDoctor && '🩺 Clinician Mode: Update consultation status and enter prescription notes'}
            {isAdminOrReception && '📋 Reception / Admin Mode: Monitor patient tokens, triage queue, and override bookings'}
            {isPatientUser && '👤 Patient Mode: Manage your medical visits and cancel if unable to attend'}
          </div>
        </div>
      )}

      {/* Alert Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl flex items-center justify-between text-xs sm:text-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
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
          {['', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === '' ? 'All Appointments' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Showing {appointments.length} Consultations
        </span>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span>Loading consultation appointments...</span>
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold">No appointments found matching this filter.</p>
          <button
            onClick={() => setStatusFilter('')}
            className="mt-3 text-xs font-semibold text-teal-600 hover:text-teal-800"
          >
            Show All Consultations
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                apt.status === 'IN_PROGRESS'
                  ? 'border-blue-400 ring-2 ring-blue-400/20 bg-blue-50/10'
                  : 'border-slate-200'
              }`}
            >
              {/* Left Column: Token, Patient, Doctor */}
              <div className="flex items-start space-x-3.5">
                {/* Queue Token Badge */}
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-teal-600 leading-none">Token</span>
                  <span className="text-base font-extrabold leading-none mt-0.5">#{apt.queueNumber || '1'}</span>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {apt.appointmentNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusBadge(apt.status)}`}>
                      {apt.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {apt.patientName}{' '}
                    <span className="text-xs font-normal text-slate-400 font-mono">({apt.patientId})</span>
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600">
                    <span className="flex items-center text-teal-700 font-medium">
                      <Stethoscope className="w-3.5 h-3.5 mr-1" />
                      {apt.doctorName}
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-500">{apt.departmentName}</span>
                  </div>

                  {apt.reasonForVisit && (
                    <p className="text-xs text-slate-500 italic mt-1">
                      Reason: "{apt.reasonForVisit}"
                    </p>
                  )}

                  {apt.doctorNotes && (
                    <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900">
                      <strong>🩺 Doctor Clinical Note:</strong> {apt.doctorNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Time Slot & Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <p className="text-xs font-bold text-slate-900 flex items-center md:justify-end">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-teal-600" />
                    {apt.appointmentDate}
                  </p>
                  <p className="text-xs font-semibold text-teal-700 flex items-center md:justify-end mt-0.5">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Slot: {apt.appointmentTime}
                  </p>
                </div>

                {/* Role-Specific Operation Buttons */}
                <div className="flex items-center space-x-2">
                  {/* Doctor actions: Advance patient to in-progress or completed */}
                  {isDoctor && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                    <>
                      {apt.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleStatusUpdate(apt, 'IN_PROGRESS')}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                        >
                          Call to Chamber
                        </button>
                      )}
                      {apt.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStatusUpdate(apt, 'COMPLETED')}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedAptForNotes(apt);
                          setClinicalNotes(apt.doctorNotes || '');
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        Notes
                      </button>
                    </>
                  )}

                  {/* Cancel Button (Patient or Admin/Reception) */}
                  {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleCancel(apt)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                    >
                      Cancel
                    </button>
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Book Patient Consultation</h3>
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Patient Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Available Time Slot *
                  </label>
                  <select
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
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
                  Reason for Consultation / Symptoms
                </label>
                <textarea
                  rows="2"
                  value={formData.reasonForVisit}
                  onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
                  placeholder="Describe symptoms, follow-up purpose, or required medical checkup..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Booking Slot...' : 'Confirm Consultation Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Clinical Notes Modal */}
      {selectedAptForNotes && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Clinical Notes: {selectedAptForNotes.patientName}
                </h3>
              </div>
              <button onClick={() => setSelectedAptForNotes(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotes} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Examination, Vitals, and Prescription Summary
                </label>
                <textarea
                  rows="4"
                  required
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Record patient vitals, diagnosis, prescribed medicines, and advice..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAptForNotes(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
                >
                  Save Clinical Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

