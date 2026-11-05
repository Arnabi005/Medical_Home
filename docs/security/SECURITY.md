# MediCore - Security & Compliance Protocols

## 1. Authentication & Session Management
- Managed by Member 1 using signed JWT tokens with standard Bearer authorization header (`Authorization: Bearer <token>`).
- Sensitive patient health data, passwords, and medical records are **never stored** in local storage or unencrypted browser storage.
- Passwords are encrypted using bcrypt before database insertion.

## 2. Authorization & RBAC
Roles: `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `PATIENT`
- Patient records are protected against unauthorized access: patients may only access their own profile and appointments; receptionists may book and triage; doctors manage clinical records.
- Patient IDs passed in query parameters or request bodies are cross-verified against authenticated sessions.

## 3. Input Validation & Injection Mitigation
- All incoming payload attributes are validated using strict schemas.
- SQL injection is prevented by utilizing Prisma parameterized queries.

## 4. Privacy & Audit Logging
- Medical histories and personally identifiable health information (PHI) are scrubbed from standard Morgan server logs.
- Status changes (appointment cancellations, reschedulings) record the acting user ID and timestamp for auditability.

