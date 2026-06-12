import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, TextField, MenuItem, Typography, InputAdornment, alpha, IconButton, Tooltip,
} from '@mui/material';
import { Search, Visibility, FilterList } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { shipmentsApi } from '@/api/endpoints';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DISPATCHED: { label: 'Dispatched', color: '#4F46E5' },
  IN_TRANSIT: { label: 'In Transit', color: '#F97316' },
  ARRIVED_AT_WAREHOUSE: { label: 'Arrived', color: '#22C55E' },
  WAITING_FOR_DOCK: { label: 'Waiting', color: '#F59E0B' },
  DOCK_ASSIGNED: { label: 'Dock Assigned', color: '#3B82F6' },
  UNLOADING: { label: 'Unloading', color: '#8B5CF6' },
};

const INCOMING_STATUSES = 'DISPATCHED,IN_TRANSIT,ARRIVED_AT_WAREHOUSE,WAITING_FOR_DOCK,DOCK_ASSIGNED,UNLOADING';

export default function IncomingShipmentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['incoming-all', statusFilter],
    queryFn: () => shipmentsApi.list({
      status__in: statusFilter || INCOMING_STATUSES,
      page_size: 50,
    }),
    refetchInterval: 15000,
  });

  const shipments = (data?.data?.results ?? []).filter((s: any) =>
    !search || s.shipment_number?.toLowerCase().includes(search.toLowerCase()) ||
    s.factory_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      {/* Filters */}
      <Card sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small" placeholder="Search shipments..." value={search}
          onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 250 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#9CA3AF' }} /></InputAdornment> }}
        />
        <TextField
          select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          label="Status" sx={{ minWidth: 180 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><FilterList sx={{ color: '#9CA3AF' }} /></InputAdornment> }}
        >
          <MenuItem value="">All Incoming</MenuItem>
          {Object.entries(STATUS_MAP).map(([k, v]) => (
            <MenuItem key={k} value={k}>{v.label}</MenuItem>
          ))}
        </TextField>
        <Typography variant="body2" sx={{ ml: 'auto', color: '#6B7280' }}>
          {shipments.length} shipment{shipments.length !== 1 ? 's' : ''}
        </Typography>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Shipment #</TableCell>
                <TableCell>Factory</TableCell>
                <TableCell>Truck</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}>Loading...</TableCell></TableRow>
              ) : shipments.length === 0 ? (
                <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}>No incoming shipments</TableCell></TableRow>
              ) : shipments.map((s: any) => {
                const st = STATUS_MAP[s.status] ?? { label: s.status, color: '#6B7280' };
                return (
                  <TableRow key={s.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/shipments/${s.id}`)}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.shipment_number}</Typography>
                    </TableCell>
                    <TableCell>{s.factory_name || '—'}</TableCell>
                    <TableCell>{s.truck_registration || '—'}</TableCell>
                    <TableCell>{s.driver_name || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={s.priority} size="small"
                        sx={{
                          bgcolor: s.priority === 'HIGH' || s.priority === 'CRITICAL' ? alpha('#EF4444', 0.1) : alpha('#3B82F6', 0.1),
                          color: s.priority === 'HIGH' || s.priority === 'CRITICAL' ? '#EF4444' : '#3B82F6',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={st.label} size="small" sx={{ bgcolor: alpha(st.color, 0.1), color: st.color }} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/shipments/${s.id}`); }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
