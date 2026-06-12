import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Floor from './Floor';
import Rack from './Rack';
import DockBay3D from './DockBay3D';
import Forklift from './Forklift';
import Heatmap from './Heatmap';
import PickPath from './PickPath';
import {
  RackConfig, DockConfig, ForkliftConfig, HeatmapPoint, PickPathNode,
} from './warehouseConfig';

interface WarehouseSceneProps {
  racks: RackConfig[];
  docks: DockConfig[];
  forklifts: ForkliftConfig[];
  heatmapData: HeatmapPoint[];
  pickPath: PickPathNode[];
  showDensity: boolean;
  showHeatmap: boolean;
  showPickPath: boolean;
  showForklifts: boolean;
  selectedRack: string | null;
  onSelectRack: (id: string) => void;
}

export default function WarehouseScene({
  racks, docks, forklifts, heatmapData, pickPath,
  showDensity, showHeatmap, showPickPath, showForklifts,
  selectedRack, onSelectRack,
}: WarehouseSceneProps) {
  return (
    <Canvas
      camera={{ position: [25, 20, 25], fov: 50, near: 0.1, far: 200 }}
      shadows
      style={{ background: '#0F172A' }}
      gl={{ antialias: true, alpha: false }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[15, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-10, 15, -10]} intensity={0.3} />
      <pointLight position={[0, 8, 0]} intensity={0.5} color="#0D9488" />

      {/* Stars background */}
      <Stars radius={100} depth={50} count={2000} factor={4} fade />

      {/* Fog for depth */}
      <fog attach="fog" args={['#0F172A', 40, 80]} />

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={5}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
      />

      {/* Floor */}
      <Floor />

      {/* Racks */}
      {racks.map((rack) => (
        <Rack
          key={rack.id}
          config={rack}
          showDensity={showDensity}
          selected={selectedRack}
          onSelect={onSelectRack}
        />
      ))}

      {/* Dock Bays */}
      {docks.map((dock) => (
        <DockBay3D key={dock.id} config={dock} />
      ))}

      {/* Forklifts */}
      {showForklifts && forklifts.map((fl) => (
        <Forklift key={fl.id} config={fl} />
      ))}

      {/* Heatmap overlay */}
      <Heatmap data={heatmapData} visible={showHeatmap} />

      {/* Pick path */}
      <PickPath nodes={pickPath} visible={showPickPath} />
    </Canvas>
  );
}
