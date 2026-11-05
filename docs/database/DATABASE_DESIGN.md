# MediCore - Database Design & Schema Specification

## 1. Relational Entity Overview

The single PostgreSQL database is accessed via Prisma ORM.

### Key Entities

1. **`User`** (`users` table)
   - Managed by Member 1 for Auth/Security.
   - Fields: `id`, `email`, `password`, `role` (`ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `PATIENT`), `isActive`, `createdAt`, `updatedAt`.

2. **`Department`** (`departments` table)
   - Medical departments (e.g. Cardiology, Neurology, General Medicine).
   - Fields: `id`, `name`, `code`, `description`, `isActive`.

3. **`DoctorProfile`** (`doctor_profiles` table)
   - Doctor credentials, consultation fees, working days, and time ranges.
   - Relations: One-to-One with `User`, Many-to-One with `Department`.

4. **`Patient`** (`patients` table)
   - Core patient demographics, MRN/patientId, emergency contacts.
   - Relations: Optional One-to-One with `User` (for patient self-service portal).

5. **`Appointment`** (`appointments` table)
   - Scheduled visits connecting Patient, Doctor, and Department.
   - Fields: `id`, `appointmentNumber`, `appointmentDate`, `appointmentTime`, `status`, `queueNumber`, `reasonForVisit`, `doctorNotes`, `cancellationReason`.

## 2. Concurrency & Double-Booking Prevention

To guarantee database-level conflict prevention, the `Appointment` entity enforces a composite unique constraint:

```prisma
@@unique([doctorId, appointmentDate, appointmentTime])
```

Any concurrent attempt to schedule an overlapping consultation for the same doctor at the same slot results in a database-level unique constraint violation (`P2002`), which is caught and transformed by the centralized backend error handler into an HTTP 409 Conflict response.

