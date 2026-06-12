import { useState, useMemo, useRef } from 'react';
import { Box, Typography, IconButton, alpha, Chip } from '@mui/material';
import {
  Layers, Thermostat, Route, Close, Warehouse, Anchor,
  TrendingUp, Speed, Assessment, PrecisionManufacturing,
} from '@mui/icons-material';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

// ─── CONFIG ──────────────────────────────────────────────
const WAREHOUSE = { width: 40, depth: 30, wallHeight: 6 };

interface RackData {
  id: string; position: [number, number, number]; size: [number, number, number];
  utilization: number; inventory: number; capacity: number; zone: string;
}
interface DockData {
  id: string; position: [number, number, number];
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  truck?: string;
}
interface ForkliftData {
  id: string; position: [number, number, number];
  status: 'ACTIVE' | 'IDLE' | 'CHARGING';
}

function densityColor(u: number) {
  if (u < 0.3) return '#3B82F6';
  if (u < 0.6) return '#22C55E';
  if (u < 0.8) return '#F59E0B';
  return '#EF4444';
}
function dockColor(s: string) {
  return s === 'AVAILABLE' ? '#22C55E' : s === 'OCCUPIED' ? '#EF4444' : s === 'RESERVED' ? '#3B82F6' : '#F59E0B';
}
function flColor(s: string) {
  return s === 'ACTIVE' ? '#22C55E' : s === 'IDLE' ? '#F59E0B' : '#3B82F6';
}

// ─── GENERATE DATA ───────────────────────────────────────
function makeRacks(): RackData[] {
  const rows = [
    { z: -8, zone: 'A' }, { z: -2, zone: 'B' }, { z: 4, zone: 'C' },
  ];
  const racks: RackData[] = [];
  let idx = 1;
  for (const row of rows) {
    for (let col = 0; col < 4; col++) {
      const x = -12 + col * 8;
      const u = +(0.15 + Math.random() * 0.8).toFixed(2);
      const cap = 100 + Math.floor(Math.random() * 200);
      racks.push({
        id: `R-${String(idx).padStart(2, '0')}`, position: [x, 0, row.z],
        size: [3, 4, 1.5], utilization: u, inventory: Math.floor(cap * u), capacity: cap, zone: row.zone,
      });
      idx++;
    }
  }
  return racks;
}
function makeDocks(): DockData[] {
  const sts: DockData['status'][] = ['OCCUPIED', 'AVAILABLE', 'RESERVED', 'AVAILABLE'];
  return sts.map((s, i) => ({
    id: `D-${String(i + 1).padStart(2, '0')}`, position: [-12 + i * 8, 0, -13] as [number, number, number],
    status: s, truck: s === 'OCCUPIED' ? 'MH-12-AB-3456' : undefined,
  }));
}
function makeForklifts(): ForkliftData[] {
  return [
    { id: 'FL-01', position: [-6, 0, 1], status: 'ACTIVE' },
    { id: 'FL-02', position: [8, 0, -5], status: 'IDLE' },
    { id: 'FL-03', position: [14, 0, 8], status: 'CHARGING' },
  ];
}

// ─── 3D COMPONENTS ───────────────────────────────────────

function Floor3D() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[WAREHOUSE.width, WAREHOUSE.depth]} />
        <meshStandardMaterial color="#E5E7EB" roughness={0.8} />
      </mesh>
      <gridHelper args={[WAREHOUSE.width, 20, '#CBD5E1', '#CBD5E1']} />
      {/* Walls */}
      <mesh position={[0, WAREHOUSE.wallHeight / 2, -WAREHOUSE.depth / 2]}>
        <boxGeometry args={[WAREHOUSE.width, WAREHOUSE.wallHeight, 0.15]} />
        <meshStandardMaterial color="#9CA3AF" transparent opacity={0.25} />
      </mesh>
      <mesh position={[-WAREHOUSE.width / 2, WAREHOUSE.wallHeight / 2, 0]}>
        <boxGeometry args={[0.15, WAREHOUSE.wallHeight, WAREHOUSE.depth]} />
        <meshStandardMaterial color="#9CA3AF" transparent opacity={0.15} />
      </mesh>
      <mesh position={[WAREHOUSE.width / 2, WAREHOUSE.wallHeight / 2, 0]}>
        <boxGeometry args={[0.15, WAREHOUSE.wallHeight, WAREHOUSE.depth]} />
        <meshStandardMaterial color="#9CA3AF" transparent opacity={0.15} />
      </mesh>
      {/* Entry zone */}
      <mesh position={[0, 0.02, WAREHOUSE.depth / 2 - 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 1.5]} />
        <meshStandardMaterial color="#8B3A0E" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function Rack3D({ config, showDensity, selected, onSelect }: {
  config: RackData; showDensity: boolean; selected: string | null; onSelect: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = showDensity ? densityColor(config.utilization) : '#94A3B8';
  const isSelected = selected === config.id;
  const [w, h, d] = config.size;
  const shelves = 4;
  const filled = Math.ceil(config.utilization * shelves);

  return (
    <group position={config.position}>
      {/* Posts */}
      {[[-w / 2, -d / 2], [-w / 2, d / 2], [w / 2, -d / 2], [w / 2, d / 2]].map(([px, pz], i) => (
        <mesh key={i} position={[px, h / 2, pz]}>
          <boxGeometry args={[0.08, h, 0.08]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      ))}
      {/* Shelves + inventory */}
      {Array.from({ length: shelves }).map((_, i) => {
        const sy = (i + 1) * (h / shelves);
        return (
          <group key={i}>
            <mesh position={[0, sy, 0]}>
              <boxGeometry args={[w, 0.05, d]} />
              <meshStandardMaterial color="#64748B" />
            </mesh>
            {i < filled && (
              <mesh position={[0, sy - (h / shelves) / 2, 0]}>
                <boxGeometry args={[w * 0.85, (h / shelves) * 0.65, d * 0.85]} />
                <meshStandardMaterial color={color} transparent opacity={hovered || isSelected ? 0.85 : 0.55} />
              </mesh>
            )}
          </group>
        );
      })}
      {/* Hitbox */}
      <mesh
        position={[0, h / 2, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect(config.id); }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[w + 0.2, h + 0.2, d + 0.2]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      {/* Selection outline */}
      {(hovered || isSelected) && (
        <mesh position={[0, h / 2, 0]}>
          <boxGeometry args={[w + 0.15, h + 0.15, d + 0.15]} />
          <meshStandardMaterial color="#8B3A0E" wireframe />
        </mesh>
      )}
      {/* Label via Html */}
      <Html position={[0, h + 0.5, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          color: hovered || isSelected ? '#A0522D' : '#94A3B8', fontWeight: 700,
          fontSize: 12, textAlign: 'center', whiteSpace: 'nowrap', textShadow: '0 0 4px rgba(0,0,0,0.8)',
        }}>
          {config.id}
          {showDensity && (
            <div style={{ color, fontSize: 10, fontWeight: 600 }}>
              {Math.round(config.utilization * 100)}%
            </div>
          )}
        </div>
      </Html>
      {/* Popup */}
      {isSelected && (
        <Html position={[w / 2 + 1, h, 0]} distanceFactor={10}>
          <div style={{
            background: 'rgba(15,23,42,0.92)', color: '#fff', padding: '10px 14px',
            borderRadius: 10, fontSize: 11, minWidth: 150, border: '1px solid rgba(13,148,136,0.3)',
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#A0522D', marginBottom: 4 }}>{config.id}</div>
            <div>Zone: <strong>{config.zone}</strong></div>
            <div>Items: <strong>{config.inventory}/{config.capacity}</strong></div>
            <div>Usage: <strong style={{ color }}>{Math.round(config.utilization * 100)}%</strong></div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Dock3D({ config }: { config: DockData }) {
  const color = dockColor(config.status);
  const [hovered, setHovered] = useState(false);
  return (
    <group position={config.position}>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[4, 0.1, 3]} />
        <meshStandardMaterial color={color} transparent opacity={0.25} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[4, 0.04, 3]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>
      <mesh position={[0, 1, -1.5]}>
        <boxGeometry args={[4, 2, 0.2]} />
        <meshStandardMaterial color="#6B7280" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, 1.2, -1.35]}>
        <boxGeometry args={[3.2, 2.2, 0.05]} />
        <meshStandardMaterial color={color} transparent opacity={0.45} />
      </mesh>
      {/* Status light */}
      <mesh position={[2.2, 2.5, -1.3]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
      {/* Truck if occupied */}
      {config.status === 'OCCUPIED' && (
        <group position={[0, 0.6, 0.8]}>
          <mesh castShadow>
            <boxGeometry args={[2, 1.2, 3]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0, 0.3, 2]}>
            <boxGeometry args={[1.8, 0.8, 1]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        </group>
      )}
      {/* Label */}
      <Html position={[0, 3, -1.3]} center style={{ pointerEvents: 'none' }}
        onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}
      >
        <div style={{ textAlign: 'center', textShadow: '0 0 4px rgba(0,0,0,0.8)' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{config.id}</div>
          <div style={{ color, fontSize: 10, fontWeight: 600 }}>{config.status}</div>
        </div>
      </Html>
    </group>
  );
}

function ForkliftObj({ config }: { config: ForkliftData }) {
  const ref = useRef<THREE.Group>(null);
  const color = flColor(config.status);
  useFrame((state) => {
    if (ref.current && config.status === 'ACTIVE') {
      ref.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    }
  });
  return (
    <group position={config.position}>
      <group ref={ref} position={[0, 0.3, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.5, 1.2]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.5, -0.5]}>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={config.status === 'ACTIVE' ? 1.5 : 0.3} />
        </mesh>
      </group>
      <Html position={[0, 1.3, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{ color, fontWeight: 700, fontSize: 10, textAlign: 'center', textShadow: '0 0 4px rgba(0,0,0,0.8)' }}>
          {config.id}<br /><span style={{ color: '#9CA3AF', fontSize: 9 }}>{config.status}</span>
        </div>
      </Html>
    </group>
  );
}

function HeatmapFloor({ visible }: { visible: boolean }) {
  const texture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, size, size);
    const points = [
      { x: 0.15, y: 0.07, r: 30, color: 'rgba(239,68,68,0.5)' },
      { x: 0.35, y: 0.07, r: 25, color: 'rgba(245,158,11,0.4)' },
      { x: 0.6, y: 0.07, r: 20, color: 'rgba(34,197,94,0.3)' },
      { x: 0.85, y: 0.07, r: 15, color: 'rgba(34,197,94,0.2)' },
      { x: 0.25, y: 0.47, r: 22, color: 'rgba(245,158,11,0.4)' },
      { x: 0.5, y: 0.47, r: 28, color: 'rgba(239,68,68,0.45)' },
      { x: 0.75, y: 0.6, r: 18, color: 'rgba(34,197,94,0.3)' },
    ];
    points.forEach(({ x, y, r, color }) => {
      const cx = x * size, cy = y * size;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    });
    const t = new THREE.CanvasTexture(canvas);
    t.needsUpdate = true;
    return t;
  }, []);
  if (!visible) return null;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
      <planeGeometry args={[WAREHOUSE.width, WAREHOUSE.depth]} />
      <meshStandardMaterial map={texture} transparent opacity={0.7} depthWrite={false} />
    </mesh>
  );
}

// ─── KPI ITEM ────────────────────────────────────────────
function KpiItem({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: 2, bgcolor: alpha(color, 0.08) }}>
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
      <Box>
        <Typography sx={{ fontSize: '0.6rem', color: '#9CA3AF', lineHeight: 1.2 }}>{label}</Typography>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{value}</Typography>
      </Box>
    </Box>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────
export default function DigitalTwinPage() {
  const racks = useMemo(() => makeRacks(), []);
  const docks = useMemo(() => makeDocks(), []);
  const forklifts = useMemo(() => makeForklifts(), []);

  const [showDensity, setShowDensity] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showForklifts, setShowForklifts] = useState(true);
  const [selectedRack, setSelectedRack] = useState<string | null>(null);

  const avgUtil = racks.length > 0 ? Math.round((racks.reduce((s, r) => s + r.utilization, 0) / racks.length) * 100) : 0;
  const totalInv = racks.reduce((s, r) => s + r.inventory, 0);
  const totalCap = racks.reduce((s, r) => s + r.capacity, 0);
  const activeDocks = docks.filter(d => d.status === 'OCCUPIED').length;
  const cong = avgUtil > 80 ? 'HIGH' : avgUtil > 50 ? 'MEDIUM' : 'LOW';
  const congC = cong === 'HIGH' ? '#EF4444' : cong === 'MEDIUM' ? '#F59E0B' : '#22C55E';

  const selectedData = selectedRack ? racks.find(r => r.id === selectedRack) : null;

  const layers = [
    { label: 'Density', active: showDensity, toggle: () => setShowDensity(v => !v), icon: <Layers sx={{ fontSize: 16 }} />, color: '#22C55E' },
    { label: 'Heatmap', active: showHeatmap, toggle: () => setShowHeatmap(v => !v), icon: <Thermostat sx={{ fontSize: 16 }} />, color: '#EF4444' },
    { label: 'Forklifts', active: showForklifts, toggle: () => setShowForklifts(v => !v), icon: <PrecisionManufacturing sx={{ fontSize: 16 }} />, color: '#F59E0B' },
  ];

  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1200, bgcolor: '#1A1A2E' }}>
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [25, 20, 25], fov: 50, near: 0.1, far: 200 }}
        shadows
        style={{ background: '#1A1A2E' }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[15, 20, 10]} intensity={1.2} castShadow />
        <directionalLight position={[-10, 15, -10]} intensity={0.3} />
        <pointLight position={[0, 8, 0]} intensity={0.5} color="#8B3A0E" />
        <fog attach="fog" args={['#1A1A2E', 40, 80]} />
        <OrbitControls enableDamping dampingFactor={0.08} minDistance={5} maxDistance={60} maxPolarAngle={Math.PI / 2.1} />

        <Floor3D />
        {racks.map(r => (
          <Rack3D key={r.id} config={r} showDensity={showDensity} selected={selectedRack}
            onSelect={(id) => setSelectedRack(id === selectedRack ? null : id)} />
        ))}
        {docks.map(d => <Dock3D key={d.id} config={d} />)}
        {showForklifts && forklifts.map(f => <ForkliftObj key={f.id} config={f} />)}
        <HeatmapFloor visible={showHeatmap} />
      </Canvas>

      {/* ─── HUD OVERLAY ─── */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
        {/* Top bar */}
        <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'auto' }}>
          {/* Title */}
          <Box sx={{ bgcolor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)', borderRadius: 3, px: 2.5, py: 1.5, border: '1px solid rgba(13,148,136,0.2)' }}>
            <Typography sx={{ color: '#A0522D', fontWeight: 800, fontSize: '1.1rem' }}>🏭 Digital Twin</Typography>
            <Typography sx={{ color: '#64748B', fontSize: '0.7rem' }}>Real-time warehouse intelligence</Typography>
          </Box>
          {/* Layer toggles */}
          <Box sx={{ bgcolor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)', borderRadius: 3, p: 1.5, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ color: '#94A3B8', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', px: 1 }}>Layers</Typography>
            {layers.map(l => (
              <Box key={l.label} onClick={l.toggle} sx={{
                display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.7, borderRadius: 1.5, cursor: 'pointer',
                bgcolor: l.active ? alpha(l.color, 0.15) : 'transparent', color: l.active ? l.color : '#6B7280',
                '&:hover': { bgcolor: alpha(l.color, 0.1) }, transition: 'all 0.2s',
              }}>
                {l.icon}
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{l.label}</Typography>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', ml: 'auto', bgcolor: l.active ? l.color : '#374151' }} />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Bottom KPI bar */}
        <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16, pointerEvents: 'auto' }}>
          <Box sx={{
            bgcolor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)', borderRadius: 3, p: 2,
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 1,
          }}>
            <KpiItem icon={<Warehouse sx={{ fontSize: 18 }} />} label="Warehouse Utilization" value={`${avgUtil}%`} color="#8B3A0E" />
            <KpiItem icon={<Anchor sx={{ fontSize: 18 }} />} label="Active Docks" value={`${activeDocks}/${docks.length}`} color="#3B82F6" />
            <KpiItem icon={<TrendingUp sx={{ fontSize: 18 }} />} label="Inventory Density" value={`${totalInv}/${totalCap}`} color="#8B5CF6" />
            <KpiItem icon={<Speed sx={{ fontSize: 18 }} />} label="Avg Pick Time" value="4.2 min" color="#F97316" />
            <KpiItem icon={<Assessment sx={{ fontSize: 18 }} />} label="Congestion" value={cong} color={congC} />
            <KpiItem icon={<PrecisionManufacturing sx={{ fontSize: 18 }} />} label="Forklift Util." value="67%" color="#F59E0B" />
          </Box>
        </Box>

        {/* Selected rack panel */}
        {selectedData && (
          <Box sx={{
            position: 'absolute', top: 80, left: 16, width: 220,
            bgcolor: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)',
            borderRadius: 3, p: 2, border: '1px solid rgba(13,148,136,0.3)', pointerEvents: 'auto',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ color: '#A0522D', fontWeight: 700 }}>{selectedData.id}</Typography>
              <IconButton size="small" onClick={() => setSelectedRack(null)} sx={{ color: '#6B7280' }}>
                <Close sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                ['Zone', selectedData.zone],
                ['Inventory', `${selectedData.inventory} / ${selectedData.capacity}`],
              ].map(([l, v]) => (
                <Box key={l} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>{l}</Typography>
                  <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>{v}</Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>Utilization</Typography>
                <Chip label={`${Math.round(selectedData.utilization * 100)}%`} size="small"
                  sx={{
                    bgcolor: alpha(densityColor(selectedData.utilization), 0.2),
                    color: densityColor(selectedData.utilization), fontWeight: 700, fontSize: '0.7rem',
                  }} />
              </Box>
              <Box sx={{ mt: 0.5 }}>
                <Box sx={{ width: '100%', height: 6, bgcolor: '#1E293B', borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{
                    width: `${selectedData.utilization * 100}%`, height: '100%', borderRadius: 3,
                    bgcolor: densityColor(selectedData.utilization), transition: 'width 0.3s',
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
            borderRadius: 2, p: 1.5, border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'auto',
          }}>
            <Typography sx={{ color: '#94A3B8', fontSize: '0.6rem', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>Density</Typography>
            {[
              { c: '#3B82F6', l: '< 30% Underutil.' },
              { c: '#22C55E', l: '30-60% Efficient' },
              { c: '#F59E0B', l: '60-80% High' },
              { c: '#EF4444', l: '> 80% Near Full' },
            ].map(i => (
              <Box key={i.l} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: i.c }} />
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.6rem' }}>{i.l}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
