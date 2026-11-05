# MediCore - Member 4 Integration Specification & Contract

## Module Scope: Hospital Operations & Administration
- **Module Owner**: Member 4 (Senior Full-Stack Developer & Software Architect)
- **Domain Responsibilities**:
  1. Hospital Administration Dashboard
  2. Pharmacy Operations & Inventory Control
  3. Laboratory Operations & Sample Workflow
  4. Inpatient Department (IPD) & Bed Management
  5. Billing, Invoicing & Mock Payment Management
  6. Insurance Claims & Policy Tracking
  7. Operational Notifications & Reports

---

## 1. Directory & File Ownership Boundaries

### Backend Owned Namespace:
`backend/src/modules/operations/`
```
operations/
├── pharmacy/
│   ├── pharmacy.routes.js
│   ├── pharmacy.controller.js
│   ├── pharmacy.service.js
│   └── pharmacy.validation.js
├── laboratory/
│   ├── laboratory.routes.js
│   ├── laboratory.controller.js
│   ├── laboratory.service.js
│   └── laboratory.validation.js
├── ipd/
│   ├── ipd.routes.js
│   ├── ipd.controller.js
│   ├── ipd.service.js
│   └── ipd.validation.js
├── billing/
│   ├── billing.routes.js
│   ├── billing.controller.js
│   ├── billing.service.js
│   └── billing.validation.js
├── insurance/
│   ├── insurance.routes.js
│   ├── insurance.controller.js
│   ├── insurance.service.js
│   └── insurance.validation.js
├── notifications/
│   ├── notifications.routes.js
│   ├── notifications.controller.js
│   └── notifications.service.js
├── dashboard/
│   ├── dashboard.routes.js
│   ├── dashboard.controller.js
│   └── dashboard.service.js
└── index.js                         # Root Operations Router export
```

### Frontend Owned Namespace:
`frontend/src/features/operations/`
```
features/
└── operations/
    ├── services/                     # Member 4 Axios API services
    │   ├── pharmacyService.js
    │   ├── labService.js
    │   ├── ipdService.js
    │   ├── billingService.js
    │   ├── insuranceService.js
    │   └── operationsDashboardService.js
    ├── components/                   # Reusable operations widgets & badges
    ├── dashboard/                    # Hospital Admin Dashboard
    ├── pharmacy/                     # Medicine catalog, stock, dispensing
    ├── laboratory/                   # Sample workflow, test processing, results
    ├── ipd/                          # Ward, bed management, admission/discharge
    ├── billing/                      # Invoicing, payments, refunds
    ├── insurance/                    # Providers, policies, claims
    ├── reports/                      # Operations reports & analytics
    ├── routes/
    │   └── OperationsRoutes.jsx      # Child route manifest
    └── index.js
```

---

## 2. Integration & Mounting Specifications (Shared Infrastructure)

### A. Backend Route Mounting (`backend/src/routes/index.js`)
Member 4 exports a single router `operationsRouter` from `backend/src/modules/operations/index.js`.
Mounting requirement:
```javascript
// Proposed single integration hook in backend/src/routes/index.js:
import operationsRouter from '../modules/operations/index.js';

apiRouter.use('/operations', operationsRouter);
```
Sub-routes exposed under `/api/v1/operations`:
- `/api/v1/operations/dashboard`
- `/api/v1/operations/pharmacy`
- `/api/v1/operations/laboratory`
- `/api/v1/operations/ipd`
- `/api/v1/operations/billing`
- `/api/v1/operations/insurance`
- `/api/v1/operations/notifications`

### B. Frontend Route Mounting (`frontend/src/App.jsx`)
Member 4 exports `OperationsRoutes` or child routes mounted under `/operations/*`:
```jsx
// Proposed route mounting in frontend/src/App.jsx:
import OperationsRoutes from './features/operations/routes/OperationsRoutes';

<Route path="operations/*" element={<OperationsRoutes />} />
```

### C. Application Navigation (`frontend/src/layouts/MainLayout.jsx`)
Navigation links added for Hospital Operations:
- Operations Hub / Dashboard (`/operations`)
- Pharmacy (`/operations/pharmacy`)
- Laboratory (`/operations/laboratory`)
- IPD & Beds (`/operations/ipd`)
- Billing & Payments (`/operations/billing`)
- Insurance (`/operations/insurance`)

---

## 3. Database Schema Dependencies & Proposed Models (For Member 1)

Member 4 respects Member 1's ownership of `backend/prisma/schema.prisma`.
The following models and fields are proposed for Member 1's review and approval. Until migrated into the PostgreSQL database, Member 4 services provide fallback in-memory/fictional operational data stores ensuring zero runtime blockers.

### Proposed Enums
```prisma
enum WardType {
  GENERAL
  ICU
  PEDIATRIC
  SURGICAL
  MATERNITY
  EMERGENCY
}

enum BedStatus {
  AVAILABLE
  OCCUPIED
  MAINTENANCE
  RESERVED
}

enum AdmissionStatus {
  ADMITTED
  DISCHARGED
  TRANSFERRED
}

enum InventoryTxType {
  PURCHASE
  DISPENSE
  ADJUSTMENT
  RETURN
  EXPIRY_SCRAP
}

enum InvoiceStatus {
  PENDING
  PARTIALLY_PAID
  PAID
  CANCELLED
  REFUNDED
}

enum PaymentMethod {
  CASH
  CREDIT_CARD
  DEBIT_CARD
  UPI
  INSURANCE
  BANK_TRANSFER
}

enum ClaimStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  SETTLED
}

enum LabSampleStatus {
  PENDING_COLLECTION
  COLLECTED
  RECEIVED
  PROCESSING
  COMPLETED
  REJECTED
}
```

### Proposed Models Summary
1. **Pharmacy**:
   - `MedicineCategory` (id, name, description)
   - `Medicine` (id, name, genericName, sku, categoryId, dosageForm, strength, unitPrice, reorderLevel, isActive)
   - `MedicineBatch` (id, medicineId, batchNumber, expiryDate, quantityReceived, currentStock, purchasePrice, sellingPrice)
   - `Supplier` (id, name, code, phone, email, address)
   - `InventoryTransaction` (id, medicineBatchId, type, quantity, balanceAfter, referenceId, reason, performedByUserId)
   - `PrescriptionDispensation` (id, prescriptionId, patientId, totalCost, dispensedByUserId)
2. **Laboratory**:
   - `LabTest` (id, code, name, category, departmentId, cost, turnaroundHours, normalRange, units)
   - `LabSample` (id, orderId, sampleNumber, sampleType, status, collectedAt, collectedByUserId)
   - `LabResult` (id, sampleId, labTestId, value, unit, isAbnormal, notes, performedByUserId, approvedByUserId)
3. **IPD & Beds**:
   - `Ward` (id, name, code, wardType, floor)
   - `Room` (id, wardId, roomNumber)
   - `Bed` (id, roomId, bedNumber, status, dailyRate)
   - `Admission` (id, patientId, bedId, admittingDoctorId, admissionDate, dischargeDate, status, reason)
   - `BedTransfer` (id, admissionId, fromBedId, toBedId, transferDate, reason)
4. **Billing & Invoices**:
   - `Invoice` (id, invoiceNumber, patientId, totalAmount, discountAmount, netAmount, paidAmount, balanceAmount, status)
   - `InvoiceItem` (id, invoiceId, serviceType, description, quantity, unitPrice, totalPrice)
   - `Payment` (id, paymentNumber, invoiceId, amount, paymentMethod, status, referenceNumber, receivedByUserId)
   - `Refund` (id, paymentId, amount, reason, approvedByUserId)
5. **Insurance**:
   - `InsuranceProvider` (id, name, code, contactPhone, contactEmail)
   - `InsurancePolicy` (id, patientId, providerId, policyNumber, coverageAmount, validUntil)
   - `InsuranceClaim` (id, invoiceId, policyId, claimNumber, claimedAmount, approvedAmount, status, notes)
6. **Operations Dashboard & Notifications**:
   - `OperationalNotification` (id, type, message, severity, isRead, createdAt)

---

## 4. Team Dependencies & Contracts

| Team Member | Dependency Type | Interface / Contract |
| :--- | :--- | :--- |
| **Member 1** | Auth, Middleware & DB | JWT authentication middleware (`req.user`), RBAC authorization (`ADMIN`, `PHARMACIST`, `LAB_TECH`, `ACCOUNTANT`), shared Prisma instance |
| **Member 2** | Patient & Staff Records | Patient ID resolution (`patientId`), Doctor profile directory (`DoctorProfile`, `Department`) |
| **Member 3** | Clinical Orders | Prescription ID for pharmacy dispensing, Lab Order ID for sample processing |
| **Member 4** | Operations Provider | Supplies bed occupancy to admissions, generates pharmacy/lab invoices for billing, updates claim statuses |

---

## 5. Security & Data Integrity Requirements
1. **Financial Calculations**: Backend recalculates all invoice items, discounts, and taxes using Decimal-safe math. Frontend totals are never trusted.
2. **Concurrency Safety**:
   - Bed allocation uses atomic transactional checks (`status: 'AVAILABLE'`) to prevent duplicate bed assignment.
   - Pharmacy dispensing executes within transactional blocks (`$transaction`) updating stock balances and generating audit log records.
3. **No Sensitive Medical Data in Logs**: Excludes patient medical diagnosis and raw payment card data from Morgan log formatting.
4. **Mock Payment Safety**: All financial payments use simulated local mock endpoints; no external payment gateway keys are required or exposed.

