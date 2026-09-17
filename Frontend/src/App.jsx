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
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CategoriesPage } from './pages/categories/CategoriesPage';
import { TransactionsPage } from './pages/transactions/TransactionsPage';
import { BudgetsPage } from './pages/budgets/BudgetsPage';

// Mock Pages for remaining unbuilt phases
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
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><MainLayout><TransactionsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><MainLayout><CategoriesPage /></MainLayout></ProtectedRoute>} />
          <Route path="/budgets" element={<ProtectedRoute><MainLayout><BudgetsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><MainLayout><PlaceholderPage title="Analytics" /></MainLayout></ProtectedRoute>} />
          <Route path="/recurring" element={<ProtectedRoute><MainLayout><PlaceholderPage title="Recurring Transactions" /></MainLayout></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><MainLayout><PlaceholderPage title="Notifications" /></MainLayout></ProtectedRoute>} />
          <Route path="/export" element={<ProtectedRoute><MainLayout><PlaceholderPage title="Export Data" /></MainLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><MainLayout><PlaceholderPage title="Settings" /></MainLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><MainLayout><PlaceholderPage title="Profile" /></MainLayout></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminRoute><MainLayout><PlaceholderPage title="Admin Dashboard" /></MainLayout></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><MainLayout><PlaceholderPage title="Manage Users" /></MainLayout></AdminRoute>} />
          <Route path="/admin/transactions" element={<AdminRoute><MainLayout><PlaceholderPage title="All System Transactions" /></MainLayout></AdminRoute>} />
          <Route path="/admin/recurring" element={<AdminRoute><MainLayout><PlaceholderPage title="System Recurring Rules" /></MainLayout></AdminRoute>} />
          <Route path="/admin/logs" element={<AdminRoute><MainLayout><PlaceholderPage title="System Logs" /></MainLayout></AdminRoute>} />

          {/* Catch-all 404 */}
          <Route path="*" element={<PlaceholderPage title="404 - Not Found" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
