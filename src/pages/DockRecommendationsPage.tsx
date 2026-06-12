import {
  Box, Card, CardContent, Typography, Chip, Button, alpha, Grid2 as Grid, Divider,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Recommend, CheckCircle, Cancel, SwapHoriz, AccessTime } from '@mui/icons-material';
import { recommendationsApi } from '@/api/endpoints';

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DOCK_ASSIGNMENT: { label: 'Dock Assignment', color: '#8B3A0E', icon: <Recommend /> },
  DOCK_SWAP: { label: 'Dock Swap', color: '#F97316', icon: <SwapHoriz /> },
  DELAY_ALERT: { label: 'Delay Alert', color: '#EF4444', icon: <AccessTime /> },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: '#F59E0B' },
  APPROVED: { label: 'Approved', color: '#22C55E' },
  REJECTED: { label: 'Rejected', color: '#EF4444' },
};

export default function DockRecommendationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dock-recommendations'],
    queryFn: () => recommendationsApi.list(),
    refetchInterval: 15000,
  });

  const approveMut = useMutation({
    mutationFn: (id: number) => recommendationsApi.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dock-recommendations'] }),
  });

  const rejectMut = useMutation({
    mutationFn: (id: number) => recommendationsApi.reject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dock-recommendations'] }),
  });

  const recommendations = data?.data?.results ?? [];
  const pending = recommendations.filter((r: any) => r.status === 'PENDING');
  const resolved = recommendations.filter((r: any) => r.status !== 'PENDING');

  return (
    <Box>
      {/* Pending Section */}
      <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Recommend sx={{ color: '#8B3A0E' }} />
        Pending Recommendations
        {pending.length > 0 && (
          <Chip label={pending.length} size="small" sx={{ bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B', fontWeight: 700 }} />
        )}
      </Typography>

      {pending.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', mb: 3 }}>
          <CheckCircle sx={{ fontSize: 48, color: '#D1D5DB', mb: 1 }} />
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>No pending recommendations</Typography>
        </Card>
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {pending.map((rec: any) => {
            const typeConf = TYPE_CONFIG[rec.recommendation_type] ?? TYPE_CONFIG.DOCK_ASSIGNMENT;
            return (
              <Grid key={rec.id} size={{ xs: 12, md: 6 }}>
                <Card sx={{ border: `2px solid ${alpha(typeConf.color, 0.2)}`, '&:hover': { borderColor: typeConf.color } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: typeConf.color }}>{typeConf.icon}</Box>
                        <Chip label={typeConf.label} size="small" sx={{ bgcolor: alpha(typeConf.color, 0.1), color: typeConf.color }} />
                      </Box>
                      <Chip label="PENDING" size="small" sx={{ bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B' }} />
                    </Box>

                    <Typography variant="body2" sx={{ color: '#1A1A1A', mb: 1, fontWeight: 500 }}>
                      {rec.reason}
                    </Typography>

                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      Warehouse: {rec.warehouse_name || `ID ${rec.warehouse}`} • {new Date(rec.created_at).toLocaleString()}
                    </Typography>

                    {rec.affected_shipments?.length > 0 && (
                      <Box sx={{ mt: 1.5 }}>
                        <Typography variant="caption" sx={{ color: '#6B7280' }}>Affected Shipments:</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                          {rec.affected_shipments.map((sid: number) => (
                            <Chip key={sid} label={`SHP-${sid}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                          ))}
                        </Box>
                      </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained" fullWidth
                        startIcon={<CheckCircle />}
                        onClick={() => approveMut.mutate(rec.id)}
                        disabled={approveMut.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined" fullWidth color="error"
                        startIcon={<Cancel />}
                        onClick={() => rejectMut.mutate(rec.id)}
                        disabled={rejectMut.isPending}
                      >
                        Reject
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Resolved Section */}
      {resolved.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 2, color: '#6B7280' }}>Resolved</Typography>
          {resolved.map((rec: any) => {
            const typeConf = TYPE_CONFIG[rec.recommendation_type] ?? TYPE_CONFIG.DOCK_ASSIGNMENT;
            const statusConf = STATUS_CONFIG[rec.status] ?? STATUS_CONFIG.PENDING;
            return (
              <Card key={rec.id} sx={{ mb: 1, opacity: 0.7 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ color: typeConf.color }}>{typeConf.icon}</Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{rec.reason}</Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>{new Date(rec.created_at).toLocaleString()}</Typography>
                  </Box>
                  <Chip label={statusConf.label} size="small" sx={{ bgcolor: alpha(statusConf.color, 0.1), color: statusConf.color }} />
                </CardContent>
              </Card>
            );
          })}
        </>
      )}
    </Box>
  );
}
