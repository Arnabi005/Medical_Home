# MediCore - API Contracts & Endpoint Specifications

## Base URL
`/api/v1`

## Response Envelopes

### Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "meta": { "page": 1, "total": 42 }
}
```

### Error Envelope
```json
{
  "success": false,
  "status": "fail | error",
  "message": "Human-readable description of error",
  "details": [ ... ]
}
```

---

## 1. System Health Check

### `GET /api/v1/health`
- **Access**: Public
- **Description**: Returns server uptime, memory usage, and PostgreSQL database connection state.
- **Sample 200 Response**:
```json
{
  "status": "healthy",
  "service": "MediCore Hospital Management System API",
  "version": "1.0.0",
  "timestamp": "2026-11-05T15:00:00.000Z",
  "uptime": "120s",
  "database": {
    "status": "connected",
    "message": "Database connected successfully"
  }
}
```

---

## 2. Proposed Patient Management Endpoints (Member 2 - Stage 2)

- `POST /api/v1/patients` - Register a new patient
- `GET /api/v1/patients` - List patients with search & pagination
- `GET /api/v1/patients/:id` - Retrieve patient details & emergency contacts
- `PATCH /api/v1/patients/:id` - Update patient profile
- `GET /api/v1/patients/:id/appointments` - View patient appointment history

---

## 3. Proposed Appointment Management Endpoints (Member 2 - Stage 4)

- `GET /api/v1/doctors` - Directory of doctors with specialization & availability
- `GET /api/v1/doctors/:id/available-slots?date=YYYY-MM-DD` - Compute open 30-minute booking slots
- `POST /api/v1/appointments` - Book appointment (atomically verified against conflicts)
- `GET /api/v1/appointments` - Filter appointments by doctor, patient, date, status
- `PATCH /api/v1/appointments/:id/reschedule` - Reschedule appointment date/time
- `PATCH /api/v1/appointments/:id/cancel` - Cancel appointment with logged reason
- `GET /api/v1/appointments/queue?departmentId=...` - Reception waiting room queue

