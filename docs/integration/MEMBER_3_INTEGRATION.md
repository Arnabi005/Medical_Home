# MediCore - Member 3 Integration Specification & Contract

## Module Scope: Clinical & Medical Management
- **Module Owner**: Member 3 (Senior Full-Stack Developer & Clinical Systems Architect)
- **Domain Responsibilities**:
  1. Doctor Dashboard (Today's queue, active consultations, pending clinical tasks)
  2. Nurse Dashboard (Assigned ward patients, vitals entry, observations, care tasks)
  3. Electronic Medical Records (EMR) & Clinical Encounters (SOAP notes, diagnoses, allergies)
  4. Vitals & Patient Observations Tracking
  5. Prescription Management (Drug selection, dosage, route, frequency, duration)
  6. Clinical Laboratory Orders (Test requisition, status tracking, result review & acknowledgement)
  7. Clinical Radiology Orders (Imaging requests, report review, clinician sign-off)

---

## 1. Directory & File Ownership Boundaries

### Backend Owned Namespace:
`backend/src/modules/clinical/`
```
clinical/
├── dashboard/
│   ├── dashboard.routes.js
│   ├── dashboard.controller.js
│   └── dashboard.service.js
├── encounters/
│   ├── encounter.routes.js
│   ├── encounter.controller.js
│   ├── encounter.service.js
│   └── encounter.validation.js
├── notes/
│   ├── notes.routes.js
│   ├── notes.controller.js
│   └── notes.service.js
├── vitals/
│   ├── vitals.routes.js
│   ├── vitals.controller.js
│   └── vitals.service.js
├── diagnoses/
│   ├── diagnosis.routes.js
│   ├── diagnosis.controller.js
│   └── diagnosis.service.js
├── allergies/
│   ├── allergy.routes.js
│   ├── allergy.controller.js
│   └── allergy.service.js
├── prescriptions/
│   ├── prescription.routes.js
│   ├── prescription.controller.js
│   └── prescription.service.js
├── laboratory/
│   ├── labOrder.routes.js
│   ├── labOrder.controller.js
│   └── labOrder.service.js
├── radiology/
│   ├── radiology.routes.js
│   ├── radiology.controller.js
│   └── radiology.service.js
├── clinical.validation.js
└── index.js                         # Root Clinical Router export
```

### Frontend Owned Namespace:
`frontend/src/features/clinical/`
```
features/
└── clinical/
    ├── services/                     # Member 3 Axios API services
    │   ├── clinicalService.js
    │   ├── emrService.js
    │   ├── vitalsService.js
    │   └── prescriptionService.js
    ├── components/                   # VitalsBadge, SoapEditor, AllergyTag, EncounterCard
    ├── dashboard/                    # Doctor & Nurse workstation pages
    ├── encounters/                   # Encounter consultation workflows
    ├── emr/                          # Patient longitudinal clinical chart
    ├── prescriptions/                # Drug prescription builder
    ├── laboratory/                   # Clinical lab requisition & review
    ├── radiology/                    # Imaging order & report viewer
    ├── routes/
    │   └── ClinicalRoutes.jsx        # Clinical child route manifest
    └── index.js
```

---

## 2. Integration & Mounting Specifications (Shared Infrastructure)

### A. Backend Route Mounting (`backend/src/routes/index.js`)
Member 3 exports a single router `clinicalRouter` from `backend/src/modules/clinical/index.js`.
Mounting requirement:
```javascript
// Proposed single integration hook in backend/src/routes/index.js:
import clinicalRouter from '../modules/clinical/index.js';

apiRouter.use('/clinical', clinicalRouter);
```
Sub-routes exposed under `/api/v1/clinical`:
- `/api/v1/clinical/dashboard/doctor`
- `/api/v1/clinical/dashboard/nurse`
- `/api/v1/clinical/encounters`
- `/api/v1/clinical/notes`
- `/api/v1/clinical/vitals`
- `/api/v1/clinical/diagnoses`
- `/api/v1/clinical/allergies`
- `/api/v1/clinical/prescriptions`
- `/api/v1/clinical/laboratory/orders`
- `/api/v1/clinical/radiology/orders`

### B. Frontend Route Mounting (`frontend/src/App.jsx`)
Member 3 exports `ClinicalRoutes` mounted under `/clinical/*`:
```jsx
// Proposed route mounting in frontend/src/App.jsx:
import ClinicalRoutes from './features/clinical/routes/ClinicalRoutes';

<Route path="clinical/*" element={<ClinicalRoutes />} />
```

### C. Application Navigation (`frontend/src/layouts/MainLayout.jsx`)
Navigation links for clinical workflows:
- Doctor Station (`/clinical/doctor-dashboard`)
- Nurse Station (`/clinical/nurse-dashboard`)
- Patient EMR Chart (`/clinical/emr`)

---

## 3. Database Schema Dependencies & Proposed Models (For Member 1)

Member 3 strictly respects Member 1's ownership of `backend/prisma/schema.prisma`.
The following models and enums are proposed for Member 1's review and approval. Until migrated into the PostgreSQL database, Member 3 services utilize dual-mode execution (Prisma query when model exists, with resilient in-memory clinical fallback).

### Proposed Enums
```prisma
enum EncounterType {
  OPD
  IPD
  EMERGENCY
  FOLLOW_UP
}

enum EncounterStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum AllergySeverity {
  MILD
  MODERATE
  SEVERE
  LIFE_THREATENING
}

enum DiagnosisType {
  PROVISIONAL
  CONFIRMED
  DIFFERENTIAL
  CHRONIC
}

enum PrescriptionStatus {
  DRAFT
  ACTIVE
  DISPENSED
  CANCELLED
  EXPIRED
}

enum ClinicalOrderStatus {
  ORDERED
  SAMPLE_COLLECTED
  PROCESSING
  RESULTED
  REVIEWED
  CANCELLED
}
```

### Proposed Models Summary
1. **`ClinicalEncounter`**: Encapsulates clinical visit, links `patientId` (Member 2), `doctorId` (DoctorProfile), `appointmentId` (Appointment), type, status, and chief complaints.
2. **`VitalSign`**: Longitudinal vitals records (temp, systolic/diastolic BP, pulse, SpO2, respiratory rate, weight, height, BMI, recorded by Nurse/Doctor).
3. **`ClinicalNote`**: SOAP notes (Subjective, Objective, Assessment, Plan), progress notes, and clinician discharge summaries.
4. **`Diagnosis`**: ICD-10 coded or free-text diagnoses, primary/secondary indicator, acute vs chronic.
5. **`PatientAllergy`**: Documented drug, food, or environmental allergies with severity and adverse reaction details.
6. **`Prescription` & `PrescriptionItem`**: Prescription metadata and items (medication, dosage, route, frequency, duration, special instructions).
7. **`ClinicalLabOrder`**: Clinical laboratory requisition linking ordered test, clinical indications, urgency (`STAT` vs `ROUTINE`), and doctor result sign-off.
8. **`ClinicalRadiologyOrder`**: Imaging request (X-Ray, CT, MRI, Ultrasound), anatomical site, clinical notes, and finalized radiologist report viewing.

---

## 4. Cross-Member Collaboration Boundaries

| Team Member | Boundary & Interface |
| :--- | :--- |
| **Member 1 (Infra/Auth)** | Consumes JWT authentication (`req.user`), user ID, role guards (`DOCTOR`, `NURSE`), and centralized `AppError` handler. |
| **Member 2 (Patients/Scheduling)** | Queries `Patient` demographic profile and appointment queue. Member 3 does **not** create duplicate patient identity tables or appointment booking logic. |
| **Member 4 (Operations)** | **Prescriptions**: Member 3 creates prescriptions; Member 4 dispenses and deducts inventory stock. Member 3 does not touch inventory.<br>**Laboratory**: Member 3 creates test requisitions and reviews results; Member 4 processes samples, barcodes, and technician logs. Member 3 does not duplicate lab operational workflows. |

---

## 5. Security & Clinical Data Integrity
1. **Clinician Authorization**: Only authenticated clinicians (`DOCTOR`, `NURSE`) can create or modify encounters, vitals, and SOAP notes.
2. **Immutable Record Principle**: Finalized clinical notes and signed prescriptions cannot be silently mutated or hard-deleted; addendums must be appended.
3. **Zero Local Storage of PHI**: Sensitive clinical data, medical histories, and vitals are never cached in unencrypted `localStorage`.
4. **Log Sanitization**: Patient diagnoses and clinical notes are scrubbed from Morgan HTTP request logs.

