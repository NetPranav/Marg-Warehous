import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import AppLayout from '@/components/AppLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import IncomingShipmentsPage from '@/pages/IncomingShipmentsPage';
import ShipmentDetailPage from '@/pages/ShipmentDetailPage';
import DockManagementPage from '@/pages/DockManagementPage';
import DockRecommendationsPage from '@/pages/DockRecommendationsPage';
import DetentionMonitorPage from '@/pages/DetentionMonitorPage';
import { Box, CircularProgress } from '@mui/material';

const SlottingPage = lazy(() => import('@/pages/SlottingPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function TwinLoader() {
  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1A1A2E' }}>
      <CircularProgress sx={{ color: '#E8700A' }} />
    </Box>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="shipments" element={<IncomingShipmentsPage />} />
        <Route path="shipments/:id" element={<ShipmentDetailPage />} />
        <Route path="docks" element={<DockManagementPage />} />
        <Route path="recommendations" element={<DockRecommendationsPage />} />
        <Route path="detention" element={<DetentionMonitorPage />} />
      </Route>
      <Route
        path="digital-twin"
        element={
          <ProtectedRoute>
            <Suspense fallback={<TwinLoader />}>
              <SlottingPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
