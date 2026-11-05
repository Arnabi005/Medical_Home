# MediCore Hospital Management System - System Architecture

## 1. Overview & Architecture Pattern

MediCore is engineered as a **modular monolith** with a decoupled web frontend and an Express.js backend powered by PostgreSQL and Prisma ORM.

```
                    ┌────────────────────────┐
                    │      React + Vite      │
                    │   (Tailwind, Router)   │
                    └───────────┬────────────┘
                                │ HTTP / REST (Axios)
                                ▼
                    ┌────────────────────────┐
                    │   Node.js + Express    │
                    │     (ES Modules)       │
                    └───────────┬────────────┘
                                │ Prisma ORM
                                ▼
                    ┌────────────────────────┐
                    │  PostgreSQL Database   │
                    └────────────────────────┘
```

## 2. Team Ownership & Responsibilities

| Role | Responsibility Area | Key Deliverables |
| :--- | :--- | :--- |
| **Member 1 (Lead Infra)** | Core Infrastructure & Architecture | Shared Prisma schema, DB migrations, Auth/JWT, API envelope contracts |
| **Member 2 (Our Role)** | **Patient & Appointment Management** | Patient profiles, directory, appointment scheduling, double-booking prevention, queue tracking |
| **Member 3** | Clinical & Medical Records | Consultations, diagnoses, prescriptions, lab results |
| **Member 4** | Billing & Administration | Invoices, insurance claims, pharmacy inventory |

## 3. Directory Layout

```
Medical_Home/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma         # Single shared Prisma schema (Member 1)
│   ├── src/
│   │   ├── config/               # Prisma client, environment configs
│   │   ├── middleware/           # Centralized errors, logging, auth guards
│   │   ├── routes/               # API Router mounts (/api/v1/...)
│   │   ├── modules/
│   │   │   ├── patients/         # Patient module (Member 2)
│   │   │   └── scheduling/       # Appointments & slots (Member 2)
│   │   ├── app.js                # Express app configuration & middleware
│   │   └── server.js             # Server entry point & graceful shutdown
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                  # Pre-configured Axios client & services
│   │   ├── components/           # Reusable UI widgets
│   │   ├── layouts/              # MainLayout, navigation drawer, headers
│   │   ├── pages/                # Routed views (Dashboard, Patients, Appointments)
│   │   ├── App.jsx               # React Router configuration
│   │   ├── main.jsx              # Vite React entry point
│   │   └── index.css             # Tailwind CSS directives
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├── docs/                         # Team contracts & architectural documentation
│   ├── architecture/
│   ├── database/
│   ├── api/
│   └── security/
│
└── README.md
```

## 4. Preserved Artifacts

Existing files created for the mobile application in `src/`, `assets/`, `app.json`, and root configuration files are strictly preserved and isolated from the web modular monolith.

