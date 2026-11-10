import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PatientsPage from './pages/PatientsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import DepartmentsPage from './pages/DepartmentsPage';
import ModulePlaceholder from './pages/ModulePlaceholder';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
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
            <Route path="departments" element={<DepartmentsPage />} />
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
            <Route path="login" element={<LoginPage />} />
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
    </AuthProvider>
  );
}

