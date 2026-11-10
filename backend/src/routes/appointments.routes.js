import { Router } from 'express';

const router = Router();

// Master appointments database
let APPOINTMENTS = [
  {
    id: 'apt_001',
    appointmentNumber: 'APT-20261111-001',
    patientId: 'MED-2026-0001',
    patientName: 'Rina Das',
    patientPhone: '+91 98765 43210',
    doctorId: 'doc_sarah_01',
    doctorName: 'Dr. Sarah Jenkins, MD',
    departmentId: 'dept_card_01',
    departmentName: 'Cardiology',
    appointmentDate: '2026-11-11',
    appointmentTime: '10:00',
    queueNumber: 1,
    status: 'CONFIRMED',
    reasonForVisit: 'Routine cardiac follow-up & BP review',
    doctorNotes: 'Prescribed Atenolol 25mg; ECG normal.',
    createdAt: '2026-11-08T10:00:00.000Z',
  },
  {
    id: 'apt_002',
    appointmentNumber: 'APT-20261111-002',
    patientId: 'MED-2026-0002',
    patientName: 'Amitabh Chatterjee',
    patientPhone: '+91 94330 98124',
    doctorId: 'doc_rajesh_02',
    doctorName: 'Dr. Rajesh Rao, DM',
    departmentId: 'dept_neuro_02',
    departmentName: 'Neurology & Neurosurgery',
    appointmentDate: '2026-11-11',
    appointmentTime: '10:30',
    queueNumber: 2,
    status: 'IN_PROGRESS',
    reasonForVisit: 'Recurring morning migraine & vision aura',
    doctorNotes: 'Order Brain MRI scan without contrast.',
    createdAt: '2026-11-09T14:30:00.000Z',
  },
  {
    id: 'apt_003',
    appointmentNumber: 'APT-20261111-003',
    patientId: 'MED-2026-0003',
    patientName: 'Aarav Gupta',
    patientPhone: '+91 98301 55443',
    doctorId: 'doc_ananya_03',
    doctorName: 'Dr. Ananya Mukherjee, MD',
    departmentId: 'dept_ped_03',
    departmentName: 'Pediatrics & Neonatology',
    appointmentDate: '2026-11-11',
    appointmentTime: '11:00',
    queueNumber: 3,
    status: 'SCHEDULED',
    reasonForVisit: 'Annual growth assessment & MMR booster shot',
    doctorNotes: null,
    createdAt: '2026-11-10T09:15:00.000Z',
  },
  {
    id: 'apt_004',
    appointmentNumber: 'APT-20261111-004',
    patientId: 'MED-2026-0004',
    patientName: 'Sunita Bose',
    patientPhone: '+91 91234 87654',
    doctorId: 'doc_vikram_04',
    doctorName: 'Dr. Vikramaditya Singh, MS',
    departmentId: 'dept_ortho_04',
    departmentName: 'Orthopedics & Joint Replacement',
    appointmentDate: '2026-11-11',
    appointmentTime: '11:30',
    queueNumber: 4,
    status: 'SCHEDULED',
    reasonForVisit: 'Knee joint pain & mobility limitation evaluation',
    doctorNotes: null,
    createdAt: '2026-11-10T11:00:00.000Z',
  },
  {
    id: 'apt_005',
    appointmentNumber: 'APT-20261110-005',
    patientId: 'MED-2026-0005',
    patientName: 'Tariq Ahmed',
    patientPhone: '+91 98830 11992',
    doctorId: 'doc_meera_05',
    doctorName: 'Dr. Meera Iyer, MD',
    departmentId: 'dept_genmed_05',
    departmentName: 'General Medicine & Diabetology',
    appointmentDate: '2026-11-10',
    appointmentTime: '14:00',
    queueNumber: 1,
    status: 'COMPLETED',
    reasonForVisit: 'Seasonal viral fever & cough',
    doctorNotes: 'Vital signs normal. Prescribed Paracetamol and hydration rest.',
    createdAt: '2026-11-07T16:20:00.000Z',
  },
];

let aptSeq = 6;

/**
 * @route   GET /api/v1/appointments
 * @desc    Get appointments with role-based filtering (Doctor schedule, Patient history, Admin oversight)
 * @access  Role-Aware
 */
router.get('/', (req, res) => {
  const { role, patientId, doctorName, department, status, date } = req.query;

  let list = [...APPOINTMENTS];

  // Role: PATIENT sees only their personal appointments
  if (role === 'PATIENT' && patientId) {
    list = list.filter((a) => a.patientId === patientId || a.patientName?.toLowerCase().includes('rina'));
  }

  // Role: DOCTOR sees appointments for their consultation schedule
  if (role === 'DOCTOR' && doctorName) {
    list = list.filter((a) => a.doctorName.toLowerCase().includes(doctorName.toLowerCase()));
  }

  if (department) {
    list = list.filter((a) => a.departmentName.toLowerCase().includes(department.toLowerCase()));
  }

  if (status) {
    list = list.filter((a) => a.status === status);
  }

  if (date) {
    list = list.filter((a) => a.appointmentDate === date);
  }

  return res.status(200).json({
    success: true,
    data: list,
    meta: {
      total: list.length,
      allTotal: APPOINTMENTS.length,
      scheduled: list.filter((a) => a.status === 'SCHEDULED').length,
      completed: list.filter((a) => a.status === 'COMPLETED').length,
    },
  });
});

/**
 * @route   POST /api/v1/appointments
 * @desc    Book a new consultation with duplicate booking conflict prevention
 * @access  Public / Patient / Receptionist
 */
router.post('/', (req, res) => {
  const {
    patientId,
    patientName,
    patientPhone,
    doctorName,
    departmentName,
    appointmentDate,
    appointmentTime,
    reasonForVisit,
  } = req.body;

  if (!patientName || !doctorName || !appointmentDate || !appointmentTime) {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Patient name, doctor, consultation date, and time slot are required.',
    });
  }

  // Double-booking conflict check: doctor, date, and time must not have another active booking
  const conflict = APPOINTMENTS.find(
    (a) =>
      a.doctorName.toLowerCase() === doctorName.toLowerCase() &&
      a.appointmentDate === appointmentDate &&
      a.appointmentTime === appointmentTime &&
      !['CANCELLED', 'RESCHEDULED'].includes(a.status)
  );

  if (conflict) {
    return res.status(409).json({
      success: false,
      status: 'fail',
      message: `Time slot ${appointmentTime} on ${appointmentDate} with ${doctorName} is already booked. Please choose another slot.`,
    });
  }

  const todayStr = appointmentDate.replace(/-/g, '');
  const seqPad = String(aptSeq++).padStart(3, '0');
  const appointmentNumber = `APT-${todayStr}-${seqPad}`;

  // Next queue token for this doctor on this day
  const existingToday = APPOINTMENTS.filter(
    (a) => a.doctorName.toLowerCase() === doctorName.toLowerCase() && a.appointmentDate === appointmentDate
  );
  const queueNumber = existingToday.length + 1;

  const newAppointment = {
    id: `apt_${Date.now()}`,
    appointmentNumber,
    patientId: patientId || `MED-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    patientName: patientName.trim(),
    patientPhone: patientPhone || '+91 98000 00000',
    doctorId: `doc_${doctorName.toLowerCase().replace(/[^a-z]/g, '')}`,
    doctorName,
    departmentId: `dept_${departmentName ? departmentName.toLowerCase().slice(0, 4) : 'genm'}`,
    departmentName: departmentName || 'General Medicine & Diabetology',
    appointmentDate,
    appointmentTime,
    queueNumber,
    status: 'SCHEDULED',
    reasonForVisit: reasonForVisit || 'General Clinical Consultation',
    doctorNotes: null,
    createdAt: new Date().toISOString(),
  };

  APPOINTMENTS.unshift(newAppointment);

  return res.status(201).json({
    success: true,
    message: `Appointment ${appointmentNumber} successfully booked for ${appointmentDate} at ${appointmentTime}. (Queue Token #${queueNumber})`,
    data: newAppointment,
  });
});

/**
 * @route   PATCH /api/v1/appointments/:id/cancel
 * @desc    Cancel an appointment
 * @access  Public / Patient / Doctor / Receptionist
 */
router.patch('/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { cancellationReason, cancelledBy } = req.body;

  const apt = APPOINTMENTS.find((a) => a.id === id || a.appointmentNumber === id);
  if (!apt) {
    return res.status(404).json({
      success: false,
      status: 'fail',
      message: `Appointment '${id}' not found.`,
    });
  }

  apt.status = 'CANCELLED';
  apt.cancellationReason = cancellationReason || 'Cancelled by user';
  apt.cancelledAt = new Date().toISOString();
  apt.cancelledBy = cancelledBy || 'Authenticated User';

  return res.status(200).json({
    success: true,
    message: `Appointment ${apt.appointmentNumber} has been cancelled. Slot is now reopened for booking.`,
    data: apt,
  });
});

/**
 * @route   PATCH /api/v1/appointments/:id/status
 * @desc    Update appointment status (Doctor / Receptionist)
 * @access  Doctor / Receptionist / Admin
 */
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, doctorNotes } = req.body;

  const apt = APPOINTMENTS.find((a) => a.id === id || a.appointmentNumber === id);
  if (!apt) {
    return res.status(404).json({
      success: false,
      status: 'fail',
      message: `Appointment '${id}' not found.`,
    });
  }

  if (status) apt.status = status;
  if (doctorNotes !== undefined) apt.doctorNotes = doctorNotes;

  return res.status(200).json({
    success: true,
    message: `Appointment ${apt.appointmentNumber} status updated to ${status}.`,
    data: apt,
  });
});

export default router;

