import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import AppLayout from '@/components/AppLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import IncomingShipmentsPage from '@/pages/IncomingShipmentsPage';
import ShipmentDetailPage from '@/pages/ShipmentDetailPage';
import InboundYardPage from '@/pages/InboundYardPage';
import StorageOptimizationPage from '@/pages/StorageOptimizationPage';
import SLALedgerPage from '@/pages/SLALedgerPage';
import { Box, CircularProgress, Typography, alpha } from '@mui/material';

const SlottingPage = lazy(() => import('@/pages/SlottingPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function TwinLoader() {
  return (
    <Box sx={{
      width: '100vw', height: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 2,
      bgcolor: '#0F172A',
    }}>
      <Box sx={{
        width: 56, height: 56, borderRadius: '16px',
        background: 'linear-gradient(135deg, #E8700A 0%, #8B3A0E 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 8px 32px ${alpha('#E8700A', 0.3)}`,
      }}>
        <CircularProgress size={28} sx={{ color: '#fff' }} />
      </Box>
      <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 500 }}>
        Loading 3D Warehouse...
      </Typography>
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
        <Route path="inbound-yard" element={<InboundYardPage />} />
        <Route path="storage-optimization" element={<StorageOptimizationPage />} />
        <Route path="sla-ledger" element={<SLALedgerPage />} />
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
      {/* Redirect old routes to new ones */}
      <Route path="docks" element={<Navigate to="/inbound-yard" replace />} />
      <Route path="recommendations" element={<Navigate to="/inbound-yard" replace />} />
      <Route path="detention" element={<Navigate to="/sla-ledger" replace />} />
    </Routes>
  );
}
