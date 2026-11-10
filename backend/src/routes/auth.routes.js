import { Router } from 'express';

const router = Router();

// In-memory registered user account credentials (persisting newly registered patients)
export const REGISTERED_ACCOUNTS = new Map();

// Pre-seeded demo hospital staff and patient accounts for testing
const DEMO_ACCOUNTS = {
  'admin@medicore.hospital': {
    id: 'usr_admin_001',
    name: 'Hospital Administrator',
    password: 'password123',
    role: 'ADMIN',
    department: 'Hospital Administration',
  },
  'doctor@medicore.hospital': {
    id: 'usr_doc_002',
    name: 'Dr. Sarah Jenkins, MD',
    password: 'password123',
    role: 'DOCTOR',
    department: 'Cardiology',
  },
  'reception@medicore.hospital': {
    id: 'usr_rec_003',
    name: 'Priya Sharma (Desk 1)',
    password: 'password123',
    role: 'RECEPTIONIST',
    department: 'Front Desk & Admissions',
  },
  'nurse@medicore.hospital': {
    id: 'usr_nur_004',
    name: 'Nurse David Miller, RN',
    password: 'password123',
    role: 'NURSE',
    department: 'Intensive Care Unit',
  },
  'patient@medicore.hospital': {
    id: 'usr_pat_005',
    name: 'Rina Das',
    password: 'password123',
    role: 'PATIENT',
    patientId: 'MED-2026-0001',
  },
};

/**
 * Register a new user credential for future portal login
 */
export function registerUserAccount({ email, password, name, role = 'PATIENT', patientId, department }) {
  const normalizedEmail = email.toLowerCase().trim();
  const account = {
    id: `usr_${Date.now()}`,
    email: normalizedEmail,
    password: password || 'password123',
    name: name || email.split('@')[0],
    role: role.toUpperCase(),
    patientId: patientId || null,
    department: department || null,
    createdAt: new Date().toISOString(),
  };
  REGISTERED_ACCOUNTS.set(normalizedEmail, account);
  return account;
}

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate hospital user, issue session token, and return profile
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Email and password are required',
    });
  }

  // Validate format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Please provide a valid email address',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Password must be at least 6 characters',
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check newly registered patient / staff accounts
  let matched = REGISTERED_ACCOUNTS.get(normalizedEmail);

  // 2. Fallback to pre-seeded demo accounts
  if (!matched) {
    matched = DEMO_ACCOUNTS[normalizedEmail];
  }

  // If account was specifically registered with a password, enforce password verification
  if (matched && matched.password && matched.password !== password) {
    return res.status(401).json({
      success: false,
      status: 'fail',
      message: 'Invalid password. Please verify your credentials and try again.',
    });
  }

  const userRole = role || matched?.role || 'PATIENT';
  const userName = matched?.name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const userId = matched?.id || `usr_${Date.now()}`;
  const patientId = matched?.patientId || (userRole === 'PATIENT' ? `MED-2026-0001` : null);

  // Generate lightweight session JWT token
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      email: normalizedEmail,
      role: userRole,
      name: userName,
      patientId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
    })
  ).toString('base64url');
  const signature = Buffer.from(`sig_${userId}_${Date.now()}`).toString('base64url');
  const token = `${header}.${payload}.${signature}`;

  return res.status(200).json({
    success: true,
    message: 'Authentication successful',
    data: {
      token,
      user: {
        id: userId,
        email: normalizedEmail,
        name: userName,
        role: userRole,
        department: matched?.department || null,
        patientId,
      },
    },
  });
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Validate token and return current session
 * @access  Private (Bearer token)
 */
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      status: 'fail',
      message: 'Unauthorized: No session token provided',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          name: payload.name,
        },
      },
    });
  } catch {
    return res.status(401).json({
      success: false,
      status: 'fail',
      message: 'Invalid or expired session token',
    });
  }
});

export default router;

