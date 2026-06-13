import { Box, Card, CardContent, Typography, Grid2 as Grid, Skeleton, alpha, Chip, IconButton, LinearProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
  LocalShipping, Anchor, HourglassEmpty, CheckCircle, Warning,
  TrendingUp, ArrowForward, ViewInAr, Radar, Inventory2, Gavel,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { dashboardApi, shipmentsApi } from '@/api/endpoints';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const ORANGE = '#E8700A';
const BROWN = '#8B3A0E';

const MOCK_ARRIVALS = [
  { hour: '8 AM', count: 2 }, { hour: '9 AM', count: 5 }, { hour: '10 AM', count: 3 },
  { hour: '11 AM', count: 4 }, { hour: '12 PM', count: 2 }, { hour: '1 PM', count: 6 },
  { hour: '2 PM', count: 3 }, { hour: '3 PM', count: 4 }, { hour: '4 PM', count: 1 },
];

const MOCK_DOCK_UTIL = [
  { time: '6 AM', utilization: 20 }, { time: '8 AM', utilization: 45 }, { time: '10 AM', utilization: 75 },
  { time: '12 PM', utilization: 90 }, { time: '2 PM', utilization: 65 }, { time: '4 PM', utilization: 50 },
  { time: '6 PM', utilization: 30 },
];

interface KpiProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  trend?: string;
  index: number;
}

function KpiCard({ icon, label, value, color, trend, index }: KpiProps) {
  return (
    <Card sx={{
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      animation: `fadeInUp 0.4s ease-out ${index * 0.08}s both`,
    }}>
      {/* Accent top border */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.3)} 100%)`,
      }} />
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{
          width: 50, height: 50, borderRadius: '14px',
          background: `linear-gradient(135deg, ${alpha(color, 0.12)} 0%, ${alpha(color, 0.04)} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color,
          border: `1px solid ${alpha(color, 0.1)}`,
        }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.5rem', lineHeight: 1.2, mt: 0.3 }}>
              {value}
            </Typography>
            {trend && (
              <Chip
                label={trend}
                size="small"
                sx={{
                  height: 20, fontSize: '0.6rem', fontWeight: 700,
                  bgcolor: trend.startsWith('+') ? alpha('#22C55E', 0.1) : alpha('#EF4444', 0.1),
                  color: trend.startsWith('+') ? '#22C55E' : '#EF4444',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

const QUICK_LINKS = [
  { label: '3D Digital Twin', icon: <ViewInAr />, path: '/digital-twin', desc: 'Spatial warehouse view', color: ORANGE },
  { label: 'Inbound Yard', icon: <Radar />, path: '/inbound-yard', desc: 'Dock scheduling & radar', color: '#3B82F6' },
  { label: 'Storage Analytics', icon: <Inventory2 />, path: '/storage-optimization', desc: 'Density & space optimizer', color: '#8B5CF6' },
  { label: 'SLA Ledger', icon: <Gavel />, path: '/sla-ledger', desc: 'Detention & workforce', color: '#EF4444' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

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
      <Grid container spacing={2.5}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Grid key={i} size={{ xs: 6, md: 4, lg: 2 }}>
            <Skeleton variant="rounded" height={110} sx={{ borderRadius: 5 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box className="bg-dot-pattern">
      {/* Welcome Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
          Welcome back, {user?.full_name?.split(' ')[0] || 'Manager'} 👋
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.9rem' }}>
          Here's what's happening at your warehouse today.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
          <KpiCard icon={<LocalShipping />} label="Incoming" value={d?.incoming_shipments ?? 0} color={ORANGE} trend="+3" index={0} />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
          <KpiCard icon={<HourglassEmpty />} label="Waiting" value={d?.waiting_trucks ?? 0} color="#F59E0B" index={1} />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
          <KpiCard icon={<Anchor />} label="Occupied Docks" value={d?.occupied_docks ?? 0} color="#EF4444" index={2} />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
          <KpiCard icon={<CheckCircle />} label="Available Docks" value={d?.available_docks ?? 0} color="#22C55E" trend="+1" index={3} />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
          <KpiCard icon={<Warning />} label="Reserved" value={d?.reserved_docks ?? 0} color="#3B82F6" index={4} />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
          <KpiCard icon={<TrendingUp />} label="Total Docks" value={d?.total_docks ?? 0} color="#8B5CF6" index={5} />
        </Grid>
      </Grid>

      {/* Quick Access Cards */}
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: '#0F172A' }}>
        Command Center
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {QUICK_LINKS.map((link, i) => (
          <Grid key={link.path} size={{ xs: 6, md: 3 }}>
            <Card
              onClick={() => navigate(link.path)}
              sx={{
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: `fadeInUp 0.4s ease-out ${i * 0.1}s both`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 32px ${alpha(link.color, 0.15)}`,
                  '& .arrow-icon': { transform: 'translateX(4px)', color: link.color },
                },
              }}
            >
              {/* Background gradient accent */}
              <Box sx={{
                position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(link.color, 0.08)} 0%, transparent 70%)`,
              }} />
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{
                  width: 44, height: 44, borderRadius: '12px', mb: 1.5,
                  background: `linear-gradient(135deg, ${alpha(link.color, 0.12)} 0%, ${alpha(link.color, 0.04)} 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: link.color,
                  border: `1px solid ${alpha(link.color, 0.1)}`,
                }}>
                  {link.icon}
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', mb: 0.3 }}>
                  {link.label}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mb: 1 }}>
                  {link.desc}
                </Typography>
                <ArrowForward
                  className="arrow-icon"
                  sx={{ fontSize: 16, color: '#CBD5E1', transition: 'all 0.3s ease' }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ p: 3, height: 370 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Shipment Arrival Timeline</Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Today's inbound traffic pattern</Typography>
              </Box>
              <Chip label="Live" size="small" sx={{
                bgcolor: alpha('#22C55E', 0.1), color: '#22C55E',
                fontWeight: 700, fontSize: '0.65rem',
                '&::before': {
                  content: '""', display: 'inline-block',
                  width: 6, height: 6, borderRadius: '50%',
                  bgcolor: '#22C55E', mr: 0.5,
                },
              }} />
            </Box>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={MOCK_ARRIVALS} barCategoryGap="25%">
                <XAxis
                  dataKey="hour" axisLine={false} tickLine={false}
                  tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }}
                />
                <YAxis
                  axisLine={false} tickLine={false}
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12, border: 'none',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    fontSize: 12, fontWeight: 600,
                  }}
                />
                <Bar
                  dataKey="count" fill={ORANGE} radius={[8, 8, 4, 4]}
                  name="Shipments"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ p: 3, height: 370 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Dock Utilization</Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>24-hour efficiency trend</Typography>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={MOCK_DOCK_UTIL}>
                <defs>
                  <linearGradient id="dockGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ORANGE} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={ORANGE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time" axisLine={false} tickLine={false}
                  tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }}
                />
                <YAxis
                  axisLine={false} tickLine={false} unit="%"
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12, border: 'none',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    fontSize: 12, fontWeight: 600,
                  }}
                />
                <Area
                  type="monotone" dataKey="utilization"
                  stroke={ORANGE} strokeWidth={2.5}
                  fill="url(#dockGrad)" name="Utilization %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Incoming Shipments Preview */}
      <Card sx={{ overflow: 'hidden' }}>
        <Box sx={{
          px: 3, py: 2,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid rgba(0,0,0,0.04)',
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Latest Incoming Shipments</Typography>
          <Chip
            label="View All →"
            onClick={() => navigate('/shipments')}
            sx={{
              cursor: 'pointer', bgcolor: alpha(ORANGE, 0.08), color: ORANGE,
              fontWeight: 600, fontSize: '0.72rem',
              '&:hover': { bgcolor: alpha(ORANGE, 0.15) },
            }}
          />
        </Box>
        <Box sx={{ p: 2.5 }}>
          {incomingShipments.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#94A3B8', py: 4, textAlign: 'center' }}>
              No incoming shipments right now
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {incomingShipments.map((s: any, i: number) => (
                <Box
                  key={s.id}
                  onClick={() => navigate(`/shipments/${s.id}`)}
                  sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    p: 1.5, borderRadius: '12px', cursor: 'pointer',
                    bgcolor: 'rgba(0,0,0,0.015)',
                    border: '1px solid transparent',
                    transition: 'all 0.2s ease',
                    animation: `fadeInUp 0.3s ease-out ${i * 0.05}s both`,
                    '&:hover': {
                      bgcolor: alpha(ORANGE, 0.03),
                      borderColor: alpha(ORANGE, 0.1),
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 36, height: 36, borderRadius: '10px',
                      bgcolor: alpha(ORANGE, 0.08), display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <LocalShipping sx={{ fontSize: 18, color: ORANGE }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#0F172A', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {s.shipment_number}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        {s.factory_name} → {s.warehouse_name}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={s.status?.replace(/_/g, ' ')}
                    size="small"
                    sx={{
                      bgcolor: alpha(ORANGE, 0.08), color: ORANGE,
                      fontWeight: 600, fontSize: '0.68rem',
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
}
