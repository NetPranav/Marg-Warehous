import {
  Box, Typography, IconButton, alpha, Chip,
} from '@mui/material';
import {
  Layers, Thermostat, Route,
  Close, Warehouse, Anchor, TrendingUp, Speed, Assessment, PrecisionManufacturing,
} from '@mui/icons-material';
import { RackConfig, DockConfig } from './warehouseConfig';

interface HUDProps {
  racks: RackConfig[];
  docks: DockConfig[];
  showDensity: boolean;
  showHeatmap: boolean;
  showPickPath: boolean;
  showForklifts: boolean;
  onToggleDensity: () => void;
  onToggleHeatmap: () => void;
  onTogglePickPath: () => void;
  onToggleForklifts: () => void;
  selectedRack: string | null;
  onClearSelection: () => void;
}

interface KpiItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

function KpiItem({ icon, label, value, color }: KpiItemProps) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1, p: 1,
      borderRadius: 2, bgcolor: alpha(color, 0.08),
    }}>
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
      <Box>
        <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', lineHeight: 1.2 }}>{label}</Typography>
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{value}</Typography>
      </Box>
    </Box>
  );
}

export default function HUD({
  racks, docks,
  showDensity, showHeatmap, showPickPath, showForklifts,
  onToggleDensity, onToggleHeatmap, onTogglePickPath, onToggleForklifts,
  selectedRack, onClearSelection,
}: HUDProps) {
  // Calculate KPIs
  const avgUtilization = racks.length > 0
    ? Math.round((racks.reduce((sum, r) => sum + r.utilization, 0) / racks.length) * 100)
    : 0;
  const totalInventory = racks.reduce((sum, r) => sum + r.inventory, 0);
  const totalCapacity = racks.reduce((sum, r) => sum + r.capacity, 0);
  const activeDocks = docks.filter(d => d.status === 'OCCUPIED').length;
  const availDocks = docks.filter(d => d.status === 'AVAILABLE').length;

  const congestionIndex = avgUtilization > 80 ? 'HIGH' : avgUtilization > 50 ? 'MEDIUM' : 'LOW';
  const congestionColor = congestionIndex === 'HIGH' ? '#EF4444' : congestionIndex === 'MEDIUM' ? '#F59E0B' : '#22C55E';

  const selectedRackData = selectedRack ? racks.find(r => r.id === selectedRack) : null;

  return (
    <Box sx={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 10,
    }}>
      {/* Top bar */}
      <Box sx={{
        position: 'absolute', top: 16, left: 16, right: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        pointerEvents: 'auto',
      }}>
        {/* Title */}
        <Box sx={{
          bgcolor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)',
          borderRadius: 3, px: 2.5, py: 1.5,
          border: '1px solid rgba(13,148,136,0.2)',
        }}>
          <Typography sx={{ color: '#14B8A6', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
            🏭 Digital Twin
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.7rem' }}>
            Real-time warehouse intelligence
          </Typography>
        </Box>

        {/* Layer toggles */}
        <Box sx={{
          bgcolor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)',
          borderRadius: 3, p: 1.5,
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', gap: 0.5,
        }}>
          <Typography sx={{ color: '#94A3B8', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', px: 1 }}>
            Layers
          </Typography>
          {[
            { label: 'Density', active: showDensity, onClick: onToggleDensity, icon: <Layers sx={{ fontSize: 16 }} />, color: '#22C55E' },
            { label: 'Heatmap', active: showHeatmap, onClick: onToggleHeatmap, icon: <Thermostat sx={{ fontSize: 16 }} />, color: '#EF4444' },
            { label: 'Pick Path', active: showPickPath, onClick: onTogglePickPath, icon: <Route sx={{ fontSize: 16 }} />, color: '#0D9488' },
            { label: 'Forklifts', active: showForklifts, onClick: onToggleForklifts, icon: <PrecisionManufacturing sx={{ fontSize: 16 }} />, color: '#F59E0B' },
          ].map((layer) => (
            <Box
              key={layer.label}
              onClick={layer.onClick}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                px: 1.5, py: 0.7, borderRadius: 1.5, cursor: 'pointer',
                bgcolor: layer.active ? alpha(layer.color, 0.15) : 'transparent',
                color: layer.active ? layer.color : '#6B7280',
                '&:hover': { bgcolor: alpha(layer.color, 0.1) },
                transition: 'all 0.2s',
              }}
            >
              {layer.icon}
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{layer.label}</Typography>
              <Box sx={{
                width: 8, height: 8, borderRadius: '50%', ml: 'auto',
                bgcolor: layer.active ? layer.color : '#374151',
              }} />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Bottom KPI bar */}
      <Box sx={{
        position: 'absolute', bottom: 16, left: 16, right: 16,
        pointerEvents: 'auto',
      }}>
        <Box sx={{
          bgcolor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)',
          borderRadius: 3, p: 2,
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 1,
        }}>
          <KpiItem icon={<Warehouse sx={{ fontSize: 18 }} />} label="Warehouse Utilization" value={`${avgUtilization}%`} color="#0D9488" />
          <KpiItem icon={<Anchor sx={{ fontSize: 18 }} />} label="Active Docks" value={`${activeDocks}/${docks.length}`} color="#3B82F6" />
          <KpiItem icon={<TrendingUp sx={{ fontSize: 18 }} />} label="Inventory Density" value={`${totalInventory}/${totalCapacity}`} color="#8B5CF6" />
          <KpiItem icon={<Speed sx={{ fontSize: 18 }} />} label="Avg Pick Time" value="4.2 min" color="#F97316" />
          <KpiItem icon={<Assessment sx={{ fontSize: 18 }} />} label="Congestion" value={congestionIndex} color={congestionColor} />
          <KpiItem icon={<PrecisionManufacturing sx={{ fontSize: 18 }} />} label="Forklift Util." value="67%" color="#F59E0B" />
        </Box>
      </Box>

      {/* Selected rack detail panel */}
      {selectedRackData && (
        <Box sx={{
          position: 'absolute', top: 80, left: 16, width: 220,
          bgcolor: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)',
          borderRadius: 3, p: 2,
          border: '1px solid rgba(13,148,136,0.3)',
          pointerEvents: 'auto',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ color: '#14B8A6', fontWeight: 700 }}>{selectedRackData.id}</Typography>
            <IconButton size="small" onClick={onClearSelection} sx={{ color: '#6B7280' }}>
              <Close sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Zone</Typography>
              <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>{selectedRackData.zone}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Inventory</Typography>
              <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>
                {selectedRackData.inventory} / {selectedRackData.capacity}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Utilization</Typography>
              <Chip
                label={`${Math.round(selectedRackData.utilization * 100)}%`}
                size="small"
                sx={{
                  bgcolor: alpha(
                    selectedRackData.utilization > 0.8 ? '#EF4444' :
                    selectedRackData.utilization > 0.6 ? '#F59E0B' : '#22C55E', 0.2
                  ),
                  color: selectedRackData.utilization > 0.8 ? '#EF4444' :
                    selectedRackData.utilization > 0.6 ? '#F59E0B' : '#22C55E',
                  fontWeight: 700, fontSize: '0.7rem',
                }}
              />
            </Box>
            {/* Utilization bar */}
            <Box sx={{ mt: 0.5 }}>
              <Box sx={{ width: '100%', height: 6, bgcolor: '#1E293B', borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{
                  width: `${selectedRackData.utilization * 100}%`, height: '100%', borderRadius: 3,
                  bgcolor: selectedRackData.utilization > 0.8 ? '#EF4444' :
                    selectedRackData.utilization > 0.6 ? '#F59E0B' : '#22C55E',
                  transition: 'width 0.3s',
                }} />
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Density legend */}
      {showDensity && (
        <Box sx={{
          position: 'absolute', bottom: 100, right: 16,
          bgcolor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)',
          borderRadius: 2, p: 1.5,
          border: '1px solid rgba(255,255,255,0.06)',
          pointerEvents: 'auto',
        }}>
          <Typography sx={{ color: '#94A3B8', fontSize: '0.65rem', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
            Density
          </Typography>
          {[
            { color: '#3B82F6', label: '< 30% (Under)' },
            { color: '#22C55E', label: '30-60% (Good)' },
            { color: '#F59E0B', label: '60-80% (High)' },
            { color: '#EF4444', label: '> 80% (Full)' },
          ].map((item) => (
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: item.color }} />
              <Typography sx={{ color: '#9CA3AF', fontSize: '0.65rem' }}>{item.label}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
