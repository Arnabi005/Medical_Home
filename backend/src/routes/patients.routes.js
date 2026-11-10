import { Router } from 'express';
import { registerUserAccount } from './auth.routes.js';

const router = Router();

// In-memory master patient registry for MediCore
let PATIENTS = [
  {
    id: 'pat_001',
    patientId: 'MED-2026-0001',
    firstName: 'Rina',
    lastName: 'Das',
    gender: 'FEMALE',
    dateOfBirth: '1992-04-15',
    age: 34,
    bloodGroup: 'B+',
    phone: '+91 98765 43210',
    email: 'patient@medicore.hospital',
    address: 'Flat 4B, South City Residency, Prince Anwar Shah Road',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700068',
    emergencyContactName: 'Subhash Das (Spouse)',
    emergencyContactPhone: '+91 98765 11223',
    emergencyContactRelation: 'Spouse',
    assignedDoctor: 'Dr. Sarah Jenkins, MD',
    department: 'Cardiology',
    allergies: ['Penicillin', 'Sulfa Drugs'],
    chronicConditions: ['Mild Hypertension'],
    lastVisitDate: '2026-11-04',
    totalVisits: 4,
    status: 'ACTIVE',
  },
  {
    id: 'pat_002',
    patientId: 'MED-2026-0002',
    firstName: 'Amitabh',
    lastName: 'Chatterjee',
    gender: 'MALE',
    dateOfBirth: '1978-08-22',
    age: 48,
    bloodGroup: 'O+',
    phone: '+91 94330 98124',
    email: 'amitabh.c@gmail.com',
    address: '14/2 Gariahat Road, Ballygunge',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700019',
    emergencyContactName: 'Sunita Chatterjee',
    emergencyContactPhone: '+91 94330 98125',
    emergencyContactRelation: 'Wife',
    assignedDoctor: 'Dr. Rajesh Rao, DM',
    department: 'Neurology & Neurosurgery',
    allergies: ['None reported'],
    chronicConditions: ['Type-2 Diabetes'],
    lastVisitDate: '2026-11-08',
    totalVisits: 2,
    status: 'ACTIVE',
  },
  {
    id: 'pat_003',
    patientId: 'MED-2026-0003',
    firstName: 'Aarav',
    lastName: 'Gupta',
    gender: 'MALE',
    dateOfBirth: '2019-11-05',
    age: 7,
    bloodGroup: 'A+',
    phone: '+91 98301 55443',
    email: 'gupta.family@gmail.com',
    address: 'Block C, Silver Spring, EM Bypass',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700105',
    emergencyContactName: 'Pooja Gupta (Mother)',
    emergencyContactPhone: '+91 98301 55444',
    emergencyContactRelation: 'Mother',
    assignedDoctor: 'Dr. Ananya Mukherjee, MD',
    department: 'Pediatrics & Neonatology',
    allergies: ['Peanuts'],
    chronicConditions: ['None'],
    lastVisitDate: '2026-11-09',
    totalVisits: 6,
    status: 'ACTIVE',
  },
  {
    id: 'pat_004',
    patientId: 'MED-2026-0004',
    firstName: 'Sunita',
    lastName: 'Bose',
    gender: 'FEMALE',
    dateOfBirth: '1965-02-14',
    age: 61,
    bloodGroup: 'AB+',
    phone: '+91 91234 87654',
    email: 'sunita.bose@outlook.com',
    address: '72 Lake Gardens',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700045',
    emergencyContactName: 'Debabrata Bose',
    emergencyContactPhone: '+91 91234 87655',
    emergencyContactRelation: 'Brother',
    assignedDoctor: 'Dr. Vikramaditya Singh, MS',
    department: 'Orthopedics & Joint Replacement',
    allergies: ['NSAIDs'],
    chronicConditions: ['Osteoarthritis (Right Knee)'],
    lastVisitDate: '2026-11-02',
    totalVisits: 3,
    status: 'ACTIVE',
  },
  {
    id: 'pat_005',
    patientId: 'MED-2026-0005',
    firstName: 'Tariq',
    lastName: 'Ahmed',
    gender: 'MALE',
    dateOfBirth: '1995-09-30',
    age: 31,
    bloodGroup: 'O-',
    phone: '+91 98830 11992',
    email: 'tariq.ahmed@gmail.com',
    address: 'Park Circus 7-Point, Park Street',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700017',
    emergencyContactName: 'Farhana Ahmed',
    emergencyContactPhone: '+91 98830 11993',
    emergencyContactRelation: 'Sister',
    assignedDoctor: 'Dr. Meera Iyer, MD',
    department: 'General Medicine & Diabetology',
    allergies: ['None'],
    chronicConditions: ['Seasonal Bronchial Asthma'],
    lastVisitDate: '2026-10-28',
    totalVisits: 1,
    status: 'ACTIVE',
  },
];

let nextSeq = 6;

/**
 * @route   GET /api/v1/patients
 * @desc    Get patient list with role-aware filtering & search
 * @access  Role-Aware
 */
router.get('/', (req, res) => {
  const { search, bloodGroup, department, patientId, role, doctorName } = req.query;

  let list = [...PATIENTS];

  // Role constraint: If requesting user is PATIENT, filter strictly to their own medical card
  if (role === 'PATIENT' && patientId) {
    list = list.filter((p) => p.patientId === patientId || p.email === req.query.email);
  }

  // Doctor filter: show assigned patients
  if (role === 'DOCTOR' && doctorName) {
    list = list.filter((p) => p.assignedDoctor.toLowerCase().includes(doctorName.toLowerCase()));
  }

  if (patientId && role !== 'PATIENT') {
    list = list.filter((p) => p.patientId.toLowerCase() === patientId.toLowerCase());
  }

  if (bloodGroup) {
    list = list.filter((p) => p.bloodGroup === bloodGroup);
  }

  if (department) {
    list = list.filter((p) => p.department.toLowerCase().includes(department.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }

  return res.status(200).json({
    success: true,
    data: list,
    meta: {
      total: list.length,
      allTotal: PATIENTS.length,
    },
  });
});

/**
 * @route   GET /api/v1/patients/:id
 * @desc    Get single patient by ID or patientId
 * @access  Public / Role-Aware
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const patient = PATIENTS.find((p) => p.id === id || p.patientId === id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      status: 'fail',
      message: `Patient record '${id}' was not found.`,
    });
  }

  return res.status(200).json({
    success: true,
    data: patient,
  });
});

/**
 * @route   POST /api/v1/patients
 * @desc    Register a new patient
 * @access  Public / Receptionist / Admin
 */
router.post('/', (req, res) => {
  const {
    firstName,
    lastName,
    gender,
    dateOfBirth,
    bloodGroup,
    phone,
    email,
    password,
    address,
    city,
    state,
    postalCode,
    emergencyContactName,
    emergencyContactPhone,
    emergencyContactRelation,
    allergies,
    chronicConditions,
    department,
    assignedDoctor,
  } = req.body;

  if (!firstName || !lastName || !phone || !gender || !dateOfBirth) {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'First name, last name, gender, date of birth, and contact phone are required.',
    });
  }

  // Ensure password meets standard length if registering credentials
  if (password && password.length < 6) {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Password must be at least 6 characters long.',
    });
  }

  // Format safe sequential Patient ID (MED-2026-XXXX)
  const padSeq = String(nextSeq++).padStart(4, '0');
  const generatedId = `MED-2026-${padSeq}`;

  // Calculate age
  const birthYear = new Date(dateOfBirth).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - birthYear);

  const patientEmail = email ? email.trim() : `${firstName.toLowerCase()}.${lastName.toLowerCase()}@patient.medicore`;

  const newPatient = {
    id: `pat_${Date.now()}`,
    patientId: generatedId,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    gender: gender.toUpperCase(),
    dateOfBirth,
    age,
    bloodGroup: bloodGroup || 'Unknown',
    phone: phone.trim(),
    email: patientEmail,
    address: address || 'Not provided',
    city: city || 'Kolkata',
    state: state || 'West Bengal',
    postalCode: postalCode || '700001',
    emergencyContactName: emergencyContactName || 'None listed',
    emergencyContactPhone: emergencyContactPhone || phone,
    emergencyContactRelation: emergencyContactRelation || 'Relative',
    assignedDoctor: assignedDoctor || 'General OPD Consulting',
    department: department || 'General Medicine & Diabetology',
    allergies: Array.isArray(allergies) ? allergies : allergies ? [allergies] : ['None reported'],
    chronicConditions: Array.isArray(chronicConditions)
      ? chronicConditions
      : chronicConditions
      ? [chronicConditions]
      : ['None'],
    lastVisitDate: new Date().toISOString().split('T')[0],
    totalVisits: 1,
    status: 'ACTIVE',
  };

  PATIENTS.unshift(newPatient);

  // If password was provided (or default password assigned), register portal login account
  const assignedPassword = password || 'password123';
  registerUserAccount({
    email: patientEmail,
    password: assignedPassword,
    name: `${firstName} ${lastName}`,
    role: 'PATIENT',
    patientId: generatedId,
  });

  return res.status(201).json({
    success: true,
    message: `Patient ${firstName} ${lastName} successfully registered with Medical ID ${generatedId}. Portal login account created!`,
    data: newPatient,
    account: {
      email: patientEmail,
      patientId: generatedId,
      canLogin: true,
    },
  });
});

/**
 * @route   DELETE /api/v1/patients/:id
 * @desc    Delete patient record (Admin only)
 * @access  Admin
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = PATIENTS.findIndex((p) => p.id === id || p.patientId === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      status: 'fail',
      message: `Patient with ID '${id}' was not found.`,
    });
  }

  const [removed] = PATIENTS.splice(index, 1);
  return res.status(200).json({
    success: true,
    message: `Patient record '${removed.firstName} ${removed.lastName}' (${removed.patientId}) deleted successfully.`,
    data: removed,
  });
});

export default router;

