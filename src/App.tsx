import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import AdminLayout from './layouts/AdminLayout';
import MemberLayout from './layouts/MemberLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/admin/Dashboard';
import Payments from './pages/admin/Payments';
import Enrollments from './pages/admin/Enrollments';
import MemberDashboard from './pages/member/Dashboard';
import MembershipStatus from './pages/member/MembershipStatus';
import Attendance from './pages/member/Attendance';
import PersonalTrainer from './pages/member/PersonalTrainer';

function App() {
  const { user, isAdmin } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Route>
        ) : isAdmin ? (
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/payments" element={<Payments />} />
            <Route path="/admin/enrollments" element={<Enrollments />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        ) : (
          <Route element={<MemberLayout />}>
            <Route path="/member" element={<MemberDashboard />} />
            <Route path="/member/status" element={<MembershipStatus />} />
            <Route path="/member/attendance" element={<Attendance />} />
            <Route path="/member/personal" element={<PersonalTrainer />} />
            <Route path="*" element={<Navigate to="/member" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;