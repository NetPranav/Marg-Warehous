import {
  Box, Card, CardContent, Typography, Grid2 as Grid, Chip, alpha,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, TextField,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Anchor, CheckCircle, Error, Build, Lock } from '@mui/icons-material';
import { useState } from 'react';
import { docksApi } from '@/api/endpoints';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  AVAILABLE: { label: 'Available', color: '#22C55E', icon: <CheckCircle />, bg: alpha('#22C55E', 0.08) },
  RESERVED: { label: 'Reserved', color: '#3B82F6', icon: <Lock />, bg: alpha('#3B82F6', 0.08) },
  OCCUPIED: { label: 'Occupied', color: '#EF4444', icon: <Error />, bg: alpha('#EF4444', 0.08) },
  MAINTENANCE: { label: 'Maintenance', color: '#F59E0B', icon: <Build />, bg: alpha('#F59E0B', 0.08) },
};

export default function DockManagementPage() {
  const queryClient = useQueryClient();
  const [editDock, setEditDock] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['docks'],
    queryFn: () => docksApi.list({ page_size: 50 }),
    refetchInterval: 15000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => docksApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docks'] });
      setEditDock(null);
    },
  });

  const docks = data?.data?.results ?? [];

  const statusCounts = {
    AVAILABLE: docks.filter((d: any) => d.status === 'AVAILABLE').length,
    RESERVED: docks.filter((d: any) => d.status === 'RESERVED').length,
    OCCUPIED: docks.filter((d: any) => d.status === 'OCCUPIED').length,
    MAINTENANCE: docks.filter((d: any) => d.status === 'MAINTENANCE').length,
  };

  return (
    <Box>
      {/* Summary Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <Grid key={key} size={{ xs: 6, md: 3 }}>
            <Card sx={{ border: `2px solid ${alpha(config.color, 0.2)}`, bgcolor: config.bg }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ color: config.color }}>{config.icon}</Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: config.color }}>{statusCounts[key as keyof typeof statusCounts]}</Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>{config.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dock Grid */}
      <Typography variant="subtitle1" sx={{ mb: 2 }}>Dock Bays</Typography>
      <Grid container spacing={2}>
        {isLoading ? (
          <Grid size={{ xs: 12 }}><Typography sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}>Loading docks...</Typography></Grid>
        ) : docks.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Anchor sx={{ fontSize: 48, color: '#D1D5DB', mb: 1 }} />
              <Typography variant="body2" sx={{ color: '#9CA3AF' }}>No dock bays configured</Typography>
            </Card>
          </Grid>
        ) : docks.map((dock: any) => {
          const config = STATUS_CONFIG[dock.status] ?? STATUS_CONFIG.AVAILABLE;
          return (
            <Grid key={dock.id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
              <Card
                sx={{
                  border: `2px solid ${alpha(config.color, 0.3)}`,
                  cursor: 'pointer', transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', borderColor: config.color },
                }}
                onClick={() => { setEditDock(dock); setNewStatus(dock.status); }}
              >
                <CardContent sx={{ textAlign: 'center', py: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: '14px', mx: 'auto', mb: 1,
                    bgcolor: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: config.color,
                  }}>
                    <Anchor />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem' }}>Dock {dock.dock_number}</Typography>
                  <Chip
                    label={config.label} size="small"
                    sx={{ mt: 1, bgcolor: alpha(config.color, 0.1), color: config.color }}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 0.5, color: '#9CA3AF' }}>
                    {dock.dock_type?.replace(/_/g, ' ')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={!!editDock} onClose={() => setEditDock(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Update Dock {editDock?.dock_number}</DialogTitle>
        <DialogContent>
          <TextField
            select fullWidth label="Status" value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)} sx={{ mt: 2 }}
          >
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v.label}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDock(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => updateMutation.mutate({ id: editDock.id, status: newStatus })}
            disabled={updateMutation.isPending}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
