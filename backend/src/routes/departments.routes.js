import { Router } from 'express';

const router = Router();

// Hospital departments master data
let DEPARTMENTS = [
  {
    id: 'dept_card_01',
    name: 'Cardiology',
    code: 'CARD',
    headOfDepartment: 'Dr. Sarah Jenkins, MD, FACC',
    floor: 'Building A, 3rd Floor',
    contactExt: '2301',
    description: 'Comprehensive cardiovascular care, ECG, echocardiography, cardiac catheterization, and heart disease management.',
    activeDoctorsCount: 6,
    totalBeds: 45,
    availableBeds: 12,
    emergencyAvailable: true,
    operatingHours: '24/7 Emergency & OPD (09:00 - 18:00)',
    isActive: true,
  },
  {
    id: 'dept_neuro_02',
    name: 'Neurology & Neurosurgery',
    code: 'NEUR',
    headOfDepartment: 'Dr. Rajesh Rao, DM, MCh',
    floor: 'Building B, 4th Floor',
    contactExt: '2405',
    description: 'Diagnosis and surgical treatment of nervous system disorders, stroke management, epilepsy, and neuro-rehabilitation.',
    activeDoctorsCount: 5,
    totalBeds: 35,
    availableBeds: 8,
    emergencyAvailable: true,
    operatingHours: '24/7 Stroke Unit & OPD (09:00 - 17:00)',
    isActive: true,
  },
  {
    id: 'dept_ped_03',
    name: 'Pediatrics & Neonatology',
    code: 'PED',
    headOfDepartment: 'Dr. Ananya Mukherjee, MD, DCH',
    floor: 'Building A, 2nd Floor',
    contactExt: '2210',
    description: 'Specialized healthcare for infants, children, and adolescents, featuring a state-of-the-art Level-3 NICU and PICU.',
    activeDoctorsCount: 8,
    totalBeds: 50,
    availableBeds: 18,
    emergencyAvailable: true,
    operatingHours: '24/7 Pediatric Emergency & OPD (08:30 - 17:30)',
    isActive: true,
  },
  {
    id: 'dept_ortho_04',
    name: 'Orthopedics & Joint Replacement',
    code: 'ORTHO',
    headOfDepartment: 'Dr. Vikramaditya Singh, MS, FRCS',
    floor: 'Building C, 1st Floor',
    contactExt: '2150',
    description: 'Joint replacement, trauma care, arthroscopy, sports injury rehabilitation, and spine surgery services.',
    activeDoctorsCount: 7,
    totalBeds: 40,
    availableBeds: 15,
    emergencyAvailable: false,
    operatingHours: 'Mon - Sat (09:00 - 17:00)',
    isActive: true,
  },
  {
    id: 'dept_genmed_05',
    name: 'General Medicine & Diabetology',
    code: 'GENMED',
    headOfDepartment: 'Dr. Meera Iyer, MD (Internal Med)',
    floor: 'Building A, 1st Floor',
    contactExt: '2100',
    description: 'Primary medical consultations, metabolic disease management, infectious disease treatment, and preventive healthcare.',
    activeDoctorsCount: 10,
    totalBeds: 60,
    availableBeds: 22,
    emergencyAvailable: false,
    operatingHours: 'Mon - Sun (08:00 - 20:00)',
    isActive: true,
  },
  {
    id: 'dept_emerg_06',
    name: 'Emergency & Trauma Care Unit',
    code: 'EMERG',
    headOfDepartment: 'Dr. Robert Chen, MD (Emergency Med)',
    floor: 'Ground Floor, Direct Access Bay',
    contactExt: '100 / 2000',
    description: 'Equipped with rapid resuscitation bays, dedicated trauma OT, and mobile critical care ambulances operating non-stop.',
    activeDoctorsCount: 12,
    totalBeds: 30,
    availableBeds: 9,
    emergencyAvailable: true,
    operatingHours: '24/7 Round the Clock Service',
    isActive: true,
  },
];

/**
 * @route   GET /api/v1/departments
 * @desc    Get all hospital departments
 * @access  Public / Role-Aware
 */
router.get('/', (req, res) => {
  const { search, activeOnly } = req.query;

  let result = [...DEPARTMENTS];

  if (activeOnly === 'true') {
    result = result.filter((d) => d.isActive);
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.headOfDepartment.toLowerCase().includes(q)
    );
  }

  return res.status(200).json({
    success: true,
    data: result,
    meta: {
      total: result.length,
      activeCount: result.filter((d) => d.isActive).length,
    },
  });
});

/**
 * @route   POST /api/v1/departments
 * @desc    Create a new department (Admin privilege)
 * @access  Admin
 */
router.post('/', (req, res) => {
  const { name, code, headOfDepartment, floor, contactExt, description, totalBeds } = req.body;

  if (!name || !code) {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Department name and department code are required.',
    });
  }

  const existing = DEPARTMENTS.find((d) => d.code.toUpperCase() === code.toUpperCase());
  if (existing) {
    return res.status(409).json({
      success: false,
      status: 'fail',
      message: `A department with code '${code}' already exists.`,
    });
  }

  const newDept = {
    id: `dept_${code.toLowerCase()}_${Date.now()}`,
    name,
    code: code.toUpperCase(),
    headOfDepartment: headOfDepartment || 'To be appointed',
    floor: floor || 'Main Campus',
    contactExt: contactExt || '2100',
    description: description || 'Specialized clinical hospital department.',
    activeDoctorsCount: 1,
    totalBeds: Number(totalBeds) || 20,
    availableBeds: Number(totalBeds) || 20,
    emergencyAvailable: false,
    operatingHours: 'Mon - Fri (09:00 - 17:00)',
    isActive: true,
  };

  DEPARTMENTS.push(newDept);

  return res.status(201).json({
    success: true,
    message: `Department '${name}' created successfully.`,
    data: newDept,
  });
});

export default router;

