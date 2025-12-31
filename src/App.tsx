import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import VerifyEmail from '@/pages/VerifyEmail';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Home from '@/pages/Home';
import BrowseBusinesses from '@/pages/BrowseBusinesses';
import BusinessDetails from '@/pages/BusinessDetails';
import CustomerDashboard from '@/pages/CustomerDashboard';
import BusinessDashboard from '@/pages/BusinessDashboard';
import ServiceManagement from '@/pages/ServiceManagement';
import EmployeeManagement from '@/pages/EmployeeManagement';
import BusinessProfile from '@/pages/BusinessProfile';
import AcceptInvitation from '@/pages/AcceptInvitation';
import StaffDashboard from '@/pages/StaffDashboard';
import AppointmentDetails from '@/pages/AppointmentDetails';
import CreateReview from '@/pages/CreateReview';
import UserProfile from '@/pages/UserProfile';
import Favorites from '@/pages/Favorites';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/businesses" element={<BrowseBusinesses />} />
      <Route path="/businesses/:id" element={<BusinessDetails />} />
      
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/accept-invitation" element={<AcceptInvitation />} />
      
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['CUSTOMER']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/:id"
        element={
          <ProtectedRoute>
            <AppointmentDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments/:id/review"
        element={
          <ProtectedRoute roles={['CUSTOMER']}>
            <CreateReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute roles={['CUSTOMER']}>
            <Favorites />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/dashboard"
        element={
          <ProtectedRoute roles={['STAFF']}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/dashboard"
        element={
          <ProtectedRoute roles={['BUSINESS_OWNER']}>
            <BusinessDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/services"
        element={
          <ProtectedRoute roles={['BUSINESS_OWNER']}>
            <ServiceManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/employees"
        element={
          <ProtectedRoute roles={['BUSINESS_OWNER']}>
            <EmployeeManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/profile"
        element={
          <ProtectedRoute roles={['BUSINESS_OWNER']}>
            <BusinessProfile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;


