import { Box, Typography, TextField, Button, Divider, Alert, Stack } from '@mui/material';
import { Save } from '@mui/icons-material';
import { useSlottingStore } from '@/stores/slottingStore';
import { useState, useEffect } from 'react';
import { slottingApi, docksApi } from '@/api/endpoints';

export default function WarehouseEditor() {
  const { layout, setLayout, selectedRackId } = useSlottingStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [dims, setDims] = useState({ width: 40, depth: 30, height: 6 });
  const [gates, setGates] = useState<any[]>([]);
  const [rackCfg, setRackCfg] = useState<any>(null);

  useEffect(() => {
    if (layout) {
      setDims({ width: layout.width, depth: layout.depth, height: layout.height });
      setGates(JSON.parse(JSON.stringify(layout.dock_bays)));
      
      if (selectedRackId) {
        const r = layout.racks.find(rack => rack.rack_id === selectedRackId);
        if (r) setRackCfg(JSON.parse(JSON.stringify(r)));
      } else {
        setRackCfg(null);
      }
    }
  }, [layout, selectedRackId]);

  const handleSaveAll = async () => {
    if (!layout) return;
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Save warehouse dimensions
      await slottingApi.updateLayout({ id: layout.id, ...dims });

      // Save Gate positions
      await Promise.all(gates.map(gate => 
        docksApi.update(gate.id, { x_position: gate.x_position, z_position: gate.z_position })
      ));

      // Save all Racks (positions and selected rack dims)
      await Promise.all(layout.racks.map(rack => {
        const isSelected = rackCfg && rack.rack_id === rackCfg.rack_id;
        return slottingApi.updateRack(rack.id, {
          x_position: rack.x_position,
          z_position: rack.z_position,
          ...(isSelected ? {
            num_shelves: rackCfg.num_shelves,
            shelf_width: rackCfg.shelf_width,
            shelf_height: rackCfg.shelf_height,
            shelf_depth: rackCfg.shelf_depth,
          } : {})
        });
      }));

      // Reload layout
      const res = await slottingApi.getLayout();
      setLayout(res.data);
      setSuccess('All changes saved successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  const updateGate = (index: number, field: string, val: string) => {
    const newGates = [...gates];
    newGates[index][field] = Number(val);
    setGates(newGates);
  };

  return (
    <Box sx={{
      width: 340, height: '100%', bgcolor: 'background.paper',
      borderLeft: '1px solid', borderColor: 'divider',
      display: 'flex', flexDirection: 'column', zIndex: 10, position: 'relative'
    }}>
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>Layout Editor</Typography>
      </Box>
      <Divider />
      
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
        {error && <Alert severity="error" sx={{ py: 0 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ py: 0 }}>{success}</Alert>}

        {/* Global Dims */}
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="primary" mb={1}>Building Size</Typography>
          <Stack direction="row" spacing={1}>
            <TextField label="W" type="number" size="small" value={dims.width} onChange={(e) => setDims({ ...dims, width: Number(e.target.value) })} />
            <TextField label="D" type="number" size="small" value={dims.depth} onChange={(e) => setDims({ ...dims, depth: Number(e.target.value) })} />
            <TextField label="H" type="number" size="small" value={dims.height} onChange={(e) => setDims({ ...dims, height: Number(e.target.value) })} />
          </Stack>
        </Box>

        <Divider />

        {/* Selected Rack Config */}
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="primary" mb={1}>
            Rack Config {rackCfg ? `(${rackCfg.rack_id})` : '(Select a rack in 3D)'}
          </Typography>
          {rackCfg ? (
            <Stack spacing={1.5}>
              <TextField label="Number of Shelves" type="number" size="small" value={rackCfg.num_shelves} onChange={(e) => setRackCfg({ ...rackCfg, num_shelves: Number(e.target.value) })} />
              <Stack direction="row" spacing={1}>
                <TextField label="Width" type="number" size="small" value={rackCfg.shelf_width} onChange={(e) => setRackCfg({ ...rackCfg, shelf_width: Number(e.target.value) })} />
                <TextField label="Depth" type="number" size="small" value={rackCfg.shelf_depth} onChange={(e) => setRackCfg({ ...rackCfg, shelf_depth: Number(e.target.value) })} />
                <TextField label="Height" type="number" size="small" value={rackCfg.shelf_height} onChange={(e) => setRackCfg({ ...rackCfg, shelf_height: Number(e.target.value) })} />
              </Stack>
            </Stack>
          ) : (
            <Typography variant="caption" color="text.secondary">Click on a rack in the 3D view to configure its shelves.</Typography>
          )}
        </Box>

        <Divider />

        {/* Gates */}
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="primary" mb={1}>Gate Positions</Typography>
          <Stack spacing={1.5}>
            {gates.map((g, i) => (
              <Box key={g.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ width: 40, fontWeight: 700 }}>{g.dock_number}</Typography>
                <TextField label="X" type="number" size="small" sx={{ width: 80 }} value={g.x_position || 0} onChange={(e) => updateGate(i, 'x_position', e.target.value)} />
                <TextField label="Z" type="number" size="small" sx={{ width: 80 }} value={g.z_position || 0} onChange={(e) => updateGate(i, 'z_position', e.target.value)} />
              </Box>
            ))}
          </Stack>
        </Box>

        <Button 
          variant="contained" color="primary" startIcon={<Save />}
          onClick={handleSaveAll} disabled={loading} sx={{ mt: 1 }}
        >
          {loading ? 'Saving...' : 'Save All Changes'}
        </Button>
      </Box>
    </Box>
  );
}
