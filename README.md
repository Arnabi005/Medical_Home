# MediCore Hospital Management System

MediCore is a comprehensive, modular-monolith hospital management system built with **React + Vite** (frontend) and **Node.js + Express + Prisma + PostgreSQL** (backend).

This repository houses the shared modular monolith for the four-member development team, along with preserved native mobile configurations.

---

## 🏛 Team Roles & Architecture

| Team Member | Module Scope | Responsibilities |
| :--- | :--- | :--- |
| **Member 1** | Shared Infrastructure & Auth | PostgreSQL schema, Prisma migrations, JWT Auth, API contracts, centralized error handling |
| **Member 2 (Current Focus)** | **Patient & Appointment Management** | Patient registration & profiles, emergency contacts, doctor directory, appointment booking, slot generation, double-booking prevention, queue tracking |
| **Member 3** | Clinical & EHR Module | Medical history, vitals, prescriptions, doctor consultation notes |
| **Member 4** | Billing & Administration | Invoices, insurance processing, pharmacy management |

---

## 🚀 Technology Stack

- **Frontend**: React 18, Vite, JavaScript ES6+ (JSX), Tailwind CSS, React Router v6, Axios, Lucide Icons.
- **Backend**: Node.js, Express.js (ES Modules), Prisma ORM, PostgreSQL, Morgan logger, CORS.
- **Mobile Assets**: Preserved Expo React Native mobile project files.

---

## 📁 Repository Structure

```
Medical_Home/
├── backend/                  # Node.js + Express + Prisma API
│   ├── prisma/
│   │   └── schema.prisma     # Shared database models
│   ├── src/
│   │   ├── config/           # Database & Prisma client
│   │   ├── middleware/       # Centralized error handler, request logger
│   │   ├── routes/           # REST endpoints (/api/v1/health, etc.)
│   │   ├── modules/
│   │   │   ├── patients/     # Member 2: Patient management
│   │   │   └── scheduling/   # Member 2: Appointments & queues
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/                 # React + Vite Web Application
│   ├── src/
│   │   ├── api/client.js     # Shared Axios client
│   │   ├── layouts/          # Responsive application layout
│   │   ├── pages/            # Dashboard, Patients, Appointments
│   │   ├── App.jsx           # React Router
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├── docs/                     # Architectural & API Contracts
│   ├── architecture/ARCHITECTURE.md
│   ├── database/DATABASE_DESIGN.md
│   ├── api/API_CONTRACTS.md
│   └── security/SECURITY.md
│
└── src/                      # Preserved Expo Mobile Application Files
```

---

## ⚙️ Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
npx prisma generate

# Create local .env from example
cp .env.example .env

# Start development server
npm run dev
```
Backend will start on `http://localhost:5000`. Test the health check endpoint:
```bash
curl http://localhost:5000/api/v1/health
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start Vite dev server
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

---

## 🔒 Security & Medical Data Guidelines

1. **Patient Data Privacy**: Never store passwords or sensitive patient health data (PHI) in `localStorage`.
2. **Access Control**: All endpoints enforce role-based access checks on the backend.
3. **Double-Booking Prevention**: Enforced at both the service validation layer and database unique index level (`@@unique([doctorId, appointmentDate, appointmentTime])`).
