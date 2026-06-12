import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, alpha, Grid2 as Grid,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Warning, AccessTime, LocalShipping, Timer } from '@mui/icons-material';
import { shipmentsApi } from '@/api/endpoints';

// Detention threshold in minutes
const DETENTION_THRESHOLD = 120;

export default function DetentionMonitorPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['detention-shipments'],
    queryFn: () => shipmentsApi.list({
      status__in: 'ARRIVED_AT_WAREHOUSE,WAITING_FOR_DOCK,DOCK_ASSIGNED,UNLOADING',
      page_size: 50,
    }),
    refetchInterval: 15000,
  });

  const shipments = data?.data?.results ?? [];

  // Calculate wait times (mock — in production this comes from timeline events)
  const detentionData = shipments.map((s: any) => {
    const arrivedAt = s.arrived_at ? new Date(s.arrived_at) : null;
    const now = new Date();
    const waitMinutes = arrivedAt ? Math.round((now.getTime() - arrivedAt.getTime()) / 60000) : 0;
    const isAtRisk = waitMinutes > DETENTION_THRESHOLD * 0.7;
    const isViolation = waitMinutes > DETENTION_THRESHOLD;
    return { ...s, waitMinutes, isAtRisk, isViolation };
  });

  const violations = detentionData.filter(d => d.isViolation).length;
  const atRisk = detentionData.filter(d => d.isAtRisk && !d.isViolation).length;
  const avgWait = detentionData.length > 0
    ? Math.round(detentionData.reduce((sum, d) => sum + d.waitMinutes, 0) / detentionData.length)
    : 0;

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card sx={{ border: `2px solid ${alpha('#EF4444', 0.2)}` }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2, '&:last-child': { pb: 2 } }}>
              <Warning sx={{ color: '#EF4444', fontSize: 28 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#EF4444' }}>{violations}</Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>SLA Violations</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card sx={{ border: `2px solid ${alpha('#F59E0B', 0.2)}` }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2, '&:last-child': { pb: 2 } }}>
              <AccessTime sx={{ color: '#F59E0B', fontSize: 28 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#F59E0B' }}>{atRisk}</Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>At Risk</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2, '&:last-child': { pb: 2 } }}>
              <Timer sx={{ color: '#8B3A0E', fontSize: 28 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#8B3A0E' }}>{avgWait} min</Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>Avg Wait Time</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2, '&:last-child': { pb: 2 } }}>
              <LocalShipping sx={{ color: '#3B82F6', fontSize: 28 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#3B82F6' }}>{detentionData.length}</Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>At Warehouse</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detention Threshold */}
      <Card sx={{ p: 2, mb: 2, bgcolor: alpha('#F59E0B', 0.05), border: '1px solid', borderColor: alpha('#F59E0B', 0.2) }}>
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#92400E' }}>
          <Warning sx={{ fontSize: 18 }} />
          Detention SLA Threshold: <strong>{DETENTION_THRESHOLD} minutes</strong>. Trucks waiting beyond this incur penalties.
        </Typography>
      </Card>

      {/* Detention Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Shipment #</TableCell>
                <TableCell>Truck</TableCell>
                <TableCell>Factory</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Wait Time</TableCell>
                <TableCell>Risk Level</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}>Loading...</TableCell></TableRow>
              ) : detentionData.length === 0 ? (
                <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}>No trucks at warehouse</TableCell></TableRow>
              ) : detentionData.map((s: any) => (
                <TableRow key={s.id} sx={{ bgcolor: s.isViolation ? alpha('#EF4444', 0.03) : s.isAtRisk ? alpha('#F59E0B', 0.03) : 'transparent' }}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.shipment_number}</Typography>
                  </TableCell>
                  <TableCell>{s.truck_registration || '—'}</TableCell>
                  <TableCell>{s.factory_name || '—'}</TableCell>
                  <TableCell>
                    <Chip label={s.status?.replace(/_/g, ' ')} size="small"
                      sx={{ bgcolor: alpha('#8B3A0E', 0.1), color: '#8B3A0E' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700, color: s.isViolation ? '#EF4444' : s.isAtRisk ? '#F59E0B' : '#1A1A1A' }}>
                      {s.waitMinutes} min
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {s.isViolation ? (
                      <Chip label="VIOLATION" size="small" sx={{ bgcolor: alpha('#EF4444', 0.1), color: '#EF4444', fontWeight: 700 }} />
                    ) : s.isAtRisk ? (
                      <Chip label="AT RISK" size="small" sx={{ bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B', fontWeight: 700 }} />
                    ) : (
                      <Chip label="OK" size="small" sx={{ bgcolor: alpha('#22C55E', 0.1), color: '#22C55E', fontWeight: 700 }} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
