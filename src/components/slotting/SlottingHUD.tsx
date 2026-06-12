import { Box, Typography, ToggleButtonGroup, ToggleButton, Paper, Grid } from '@mui/material';
import { ViewInAr, Edit, FormatListBulleted } from '@mui/icons-material';
import { useSlottingStore } from '@/stores/slottingStore';

export default function SlottingHUD() {
  const { viewMode, setViewMode, layout } = useSlottingStore();

  if (!layout) return null;
  const util = layout.utilization;

  return (
    <>
      {/* Top Bar: View Mode Toggles */}
      <Box sx={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, display: 'flex', gap: 2, alignItems: 'center'
      }}>
        <Paper elevation={4} sx={{ borderRadius: '12px', p: 0.5, bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, val) => val && setViewMode(val)}
            size="small"
          >
            <ToggleButton value="visualization" sx={{ px: 2, py: 1, borderRadius: '8px !important', '&.Mui-selected': { bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } } }}>
              <ViewInAr fontSize="small" sx={{ mr: 1 }} /> 3D View
            </ToggleButton>
            <ToggleButton value="editor" sx={{ px: 2, py: 1, borderRadius: '8px !important', '&.Mui-selected': { bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } } }}>
              <Edit fontSize="small" sx={{ mr: 1 }} /> Layout Editor
            </ToggleButton>
            <ToggleButton value="inventory" sx={{ px: 2, py: 1, borderRadius: '8px !important', '&.Mui-selected': { bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } } }}>
              <FormatListBulleted fontSize="small" sx={{ mr: 1 }} /> Inventory
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>
      </Box>

      {/* Bottom Bar: KPI Metrics */}
      <Box sx={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, width: '90%', maxWidth: 800
      }}>
        <Paper elevation={4} sx={{ 
          borderRadius: '16px', p: 2, 
          bgcolor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
          border: '1px solid', borderColor: 'divider'
        }}>
          <Grid container spacing={2} textAlign="center">
            <Grid item xs>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Space Utilization</Typography>
              <Typography variant="h5" fontWeight={700} color={util.utilization_pct > 85 ? 'error.main' : 'primary.main'}>
                {util.utilization_pct}%
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Volume</Typography>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                {util.occupied_volume.toLocaleString()} <Typography component="span" variant="body2">/ {util.total_volume.toLocaleString()} m³</Typography>
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Stored Parcels</Typography>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                {util.parcel_count}
              </Typography>
            </Grid>
            <Grid item xs>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Racks / Shelves</Typography>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                {util.rack_count} / {util.shelf_count}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </>
  );
}
