import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ModulePlaceholder from './pages/ModulePlaceholder';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route
            path="patients"
            element={
              <ModulePlaceholder
                title="Patient Management"
                description="Patient registration, profile viewing, address handling, and emergency contact management."
                stage="Stage 2 &amp; Stage 3"
              />
            }
          />
          <Route
            path="appointments"
            element={
              <ModulePlaceholder
                title="Appointment Management"
                description="Consultation booking, doctor schedule filtering, conflict-free slot booking, and cancellations."
                stage="Stage 4 &amp; Stage 5"
              />
            }
          />
          <Route
            path="doctors"
            element={
              <ModulePlaceholder
                title="Doctor &amp; Staff Directory"
                description="Doctor profiles, specializations, consultation hours, and department listings."
                stage="Stage 4"
              />
            }
          />
          <Route
            path="departments"
            element={
              <ModulePlaceholder
                title="Hospital Departments"
                description="Overview of Cardiology, Neurology, Pediatrics, General Medicine, and other units."
                stage="Stage 4"
              />
            }
          />
          <Route
            path="queue"
            element={
              <ModulePlaceholder
                title="Reception &amp; Queue Management"
                description="Token allocation, walk-in management, and live waiting room status for receptionists."
                stage="Stage 4 &amp; Stage 5"
              />
            }
          />
          <Route
            path="*"
            element={
              <ModulePlaceholder
                title="Page Not Found"
                description="The requested section does not exist or has been moved."
                stage="MediCore 404"
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

