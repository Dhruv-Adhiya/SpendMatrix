import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PublicRoute } from './routes/PublicRoute';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';
import { AuthProvider } from './context/AuthContext';

import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

// Mock Pages for Phase 1
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>{title}</h1>
    <p>This page is a placeholder and will be implemented in future phases.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      {/* Toast notifications container */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-glass)',
          }
        }} 
      />
      
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
          <Route path="/verify-email" element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />

          {/* Protected User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><PlaceholderPage title="Dashboard" /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><PlaceholderPage title="Transactions" /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><PlaceholderPage title="Categories" /></ProtectedRoute>} />
          <Route path="/budgets" element={<ProtectedRoute><PlaceholderPage title="Budgets" /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><PlaceholderPage title="Analytics" /></ProtectedRoute>} />
          <Route path="/recurring" element={<ProtectedRoute><PlaceholderPage title="Recurring Transactions" /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><PlaceholderPage title="Notifications" /></ProtectedRoute>} />
          <Route path="/export" element={<ProtectedRoute><PlaceholderPage title="Export Data" /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><PlaceholderPage title="Settings" /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><PlaceholderPage title="Profile" /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminRoute><PlaceholderPage title="Admin Dashboard" /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><PlaceholderPage title="Manage Users" /></AdminRoute>} />
          <Route path="/admin/transactions" element={<AdminRoute><PlaceholderPage title="All System Transactions" /></AdminRoute>} />
          <Route path="/admin/recurring" element={<AdminRoute><PlaceholderPage title="System Recurring Rules" /></AdminRoute>} />
          <Route path="/admin/logs" element={<AdminRoute><PlaceholderPage title="System Logs" /></AdminRoute>} />

          {/* Catch-all 404 */}
          <Route path="*" element={<PlaceholderPage title="404 - Not Found" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
