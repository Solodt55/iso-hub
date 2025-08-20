import React from 'react';
import Layout from './components/Layout';
import DashboardWidgets from './components/DashboardWidgets';
import Logins from './pages/Logins';
import DocumentCenter from './pages/DocumentCenter';
import VendorDocuments from './pages/VendorDocuments';
import VendorTemplate from './pages/VendorTemplate';
import PreApplications from './pages/PreApplications';
import SecurePortal from './pages/SecurePortal';
import SecureUpload from './pages/SecureUpload';
import SecureUploadUserFiles from './pages/SecureUploadUserFiles';
import JACC from './components/JACC';
import LogIn from './pages/logins/login';
import Users from './pages/users/users';
import AddUsers from './pages/users/addUsers';
import { LayoutDashboard } from 'lucide-react';
import EditUsers from './pages/users/editUser';
import Admin from './pages/admin/admin';
import BirthdayNotify from './pages/BirthdayNotify';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import TeamMember from './pages/team-member/teamMember';
import Vendor from './pages/Vendor/vendor';
import Documents from './pages/Documents/documents';
import Reps from './pages/Reps/reps';
import Notifications from './pages/notifications/notifications';
import Marketing from './pages/Marketing/marketing';
import Forms from './pages/Forms/forms';
import JotForm from './pages/JotForms/JotForm';
import UserReps from './pages/UserReps';
import UserNotification from './components/UserNotification';
import PrivacyPolicy from './pages/PrivacyPolicy';
import LandingPage from './pages/LandingPage';
import Settings from './pages/Settings';
import IsoAiPage from './pages/IsoAiPage';

function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 bg-tracer-green rounded-lg p-6 shadow-lg">
        <div className="flex items-center space-x-3">
          <LayoutDashboard className="h-10 w-10 text-white" />
          <div>
            <h2 className="text-3xl font-bold text-white">Dashboard</h2>
            <p className="text-white/80 mt-1">
              Welcome back! Here's an overview of your ISO Hub.
            </p>
          </div>
        </div>
      </div>
      <DashboardWidgets />
    </div>
  );
}

// Wrapper component for protected pages
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
        {/* <JACC /> */}
      </Layout>
    </ProtectedRoute>
  );
}

// Wrapper component for protected admin pages
function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const isAdmin = authUser?.role_id === 2 || authUser?.role_id === 1;

  // const isAdmin = authUser?.role_id === 2 || authUser?.role_id === 1 || authUser?.role_id === 3 || authUser?.role_id === 4 || authUser?.role_id === 5;

  if (!isAdmin) {
    return <Navigate to="/logins" replace />;
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
        {/* <JACC /> */}
      </Layout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <span className="text-yellow-400 text-2xl">Loading...</span>
      </div>
    );
  }
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <ProtectedLayout><Logins /></ProtectedLayout> : <LandingPage onAuthenticate={() => {}} onNavigate={() => {}} />} />
      <Route path="/login" element={<LogIn />} />
      <Route path="/secure-upload/:user_id/:user_data" element={<SecureUpload />} />

      <Route path="/secure-uploads/:user_data" element={<SecureUploadUserFiles />} />

      <Route path="/iso-forms/:full_name/:user_id" element={<JotForm />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/users" element={<ProtectedLayout><Users /></ProtectedLayout>} />
      <Route path="/documents" element={<ProtectedLayout><DocumentCenter /></ProtectedLayout>} />
      <Route path="/documents/new-vendor" element={<ProtectedLayout><VendorTemplate /></ProtectedLayout>} />
      <Route path="/documents/:vendorId" element={<ProtectedLayout><VendorDocuments vendorId="1" /></ProtectedLayout>} />
      <Route path="/applications" element={<ProtectedLayout><PreApplications /></ProtectedLayout>} />
      <Route path="/secure" element={<ProtectedLayout><SecurePortal /></ProtectedLayout>} />
      <Route path="/marketing" element={<ProtectedLayout><Marketing /></ProtectedLayout>} />
      <Route path="/user-reps" element={<ProtectedLayout><UserReps /></ProtectedLayout>} />
      <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
      <Route path="/user-notification" element={<ProtectedLayout><UserNotification /></ProtectedLayout>} />
      <Route path="/iso-ai" element={<ProtectedLayout><IsoAiPage /></ProtectedLayout>} />
      <Route path="/admin" element={<ProtectedAdminLayout><Admin /></ProtectedAdminLayout>} />
      <Route path="/teammember" element={<ProtectedAdminLayout><TeamMember /></ProtectedAdminLayout>} />
      <Route path="/vendor" element={<ProtectedAdminLayout><Vendor /></ProtectedAdminLayout>} />
      <Route path="/master_database_documents" element={<ProtectedAdminLayout><Documents /></ProtectedAdminLayout>} />
      <Route path="/all_reps" element={<ProtectedAdminLayout><Reps /></ProtectedAdminLayout>} />
      <Route path="/application_notifications" element={<ProtectedAdminLayout><Notifications /></ProtectedAdminLayout>} />
      <Route path="/birthday-notify" element={<ProtectedAdminLayout><BirthdayNotify /></ProtectedAdminLayout>} />
      <Route path="/addusers" element={<ProtectedAdminLayout><AddUsers /></ProtectedAdminLayout>} />
      <Route path="/edituser" element={<ProtectedAdminLayout><EditUsers /></ProtectedAdminLayout>} />
      <Route path="/forms" element={<ProtectedAdminLayout><Forms /></ProtectedAdminLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;