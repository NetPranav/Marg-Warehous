import { Box, Card, CardContent, Typography, Grid2 as Grid, Skeleton, alpha } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { LocalShipping, Anchor, HourglassEmpty, CheckCircle, Warning, TrendingUp } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { dashboardApi, shipmentsApi } from '@/api/endpoints';

const MOCK_ARRIVALS = [
  { hour: '8AM', count: 2 }, { hour: '9AM', count: 5 }, { hour: '10AM', count: 3 },
  { hour: '11AM', count: 4 }, { hour: '12PM', count: 2 }, { hour: '1PM', count: 6 },
  { hour: '2PM', count: 3 }, { hour: '3PM', count: 4 }, { hour: '4PM', count: 1 },
];

const MOCK_DOCK_UTIL = [
  { time: '6AM', utilization: 20 }, { time: '8AM', utilization: 45 }, { time: '10AM', utilization: 75 },
  { time: '12PM', utilization: 90 }, { time: '2PM', utilization: 65 }, { time: '4PM', utilization: 50 },
  { time: '6PM', utilization: 30 },
];

interface KpiProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
}

function KpiCard({ icon, label, value, color, bgColor }: KpiProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{
          width: 48, height: 48, borderRadius: '14px', bgcolor: bgColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color,
        }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#6B7280' }}>{label}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A1A', mt: 0.3 }}>{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['warehouse-dashboard'],
    queryFn: () => dashboardApi.warehouse(),
    refetchInterval: 30000,
  });

  const { data: shipmentsData } = useQuery({
    queryKey: ['incoming-shipments'],
    queryFn: () => shipmentsApi.list({ status: 'IN_TRANSIT', page_size: 5 }),
  });

  const d = data?.data?.data;
  const incomingShipments = shipmentsData?.data?.results ?? [];

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[1,2,3,4,5,6].map(i => (
          <Grid key={i} size={{ xs: 6, md: 4, lg: 2 }}>
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 4 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
          <KpiCard icon={<LocalShipping />} label="Incoming Shipments" value={d?.incoming_shipments ?? 0} color="#8B3A0E" bgColor={alpha('#8B3A0E', 0.08)} />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
          <KpiCard icon={<HourglassEmpty />} label="Waiting Trucks" value={d?.waiting_trucks ?? 0} color="#F59E0B" bgColor={alpha('#F59E0B', 0.1)} />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
          <KpiCard icon={<Anchor />} label="Occupied Docks" value={d?.occupied_docks ?? 0} color="#EF4444" bgColor={alpha('#EF4444', 0.1)} />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
          <KpiCard icon={<CheckCircle />} label="Available Docks" value={d?.available_docks ?? 0} color="#22C55E" bgColor={alpha('#22C55E', 0.1)} />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
          <KpiCard icon={<Warning />} label="Reserved Docks" value={d?.reserved_docks ?? 0} color="#3B82F6" bgColor={alpha('#3B82F6', 0.1)} />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
          <KpiCard icon={<TrendingUp />} label="Total Docks" value={d?.total_docks ?? 0} color="#8B5CF6" bgColor={alpha('#8B5CF6', 0.1)} />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ p: 3, height: 340 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Shipment Arrival Timeline (Today)</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={MOCK_ARRIVALS}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B3A0E" radius={[6, 6, 0, 0]} name="Shipments" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ p: 3, height: 340 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Dock Utilization Trend</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={MOCK_DOCK_UTIL}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} unit="%" />
                <Tooltip />
                <Area type="monotone" dataKey="utilization" stroke="#E8700A" fill={alpha('#E8700A', 0.12)} name="Utilization %" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Incoming Shipments Preview */}
      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Latest Incoming Shipments</Typography>
        {incomingShipments.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#9CA3AF', py: 3, textAlign: 'center' }}>No incoming shipments right now</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {incomingShipments.map((s: any) => (
              <Box key={s.id} sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
              }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A1A1A', fontFamily: 'monospace' }}>{s.shipment_number}</Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>{s.factory_name} → {s.warehouse_name}</Typography>
                </Box>
                <Box sx={{
                  px: 1.5, py: 0.5, borderRadius: 1.5,
                  bgcolor: alpha('#8B3A0E', 0.08), color: '#8B3A0E',
                  fontWeight: 600, fontSize: '0.7rem',
                }}>
                  {s.status?.replace(/_/g, ' ')}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Card>
    </Box>
  );
}
