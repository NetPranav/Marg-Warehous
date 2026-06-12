import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useSlottingStore } from '@/stores/slottingStore';
import SlottingRack3D from './SlottingRack3D';
import GatePath3D from './GatePath3D';

function Floor({ width, depth }: { width: number; depth: number }) {
  return (
    <group>
      {/* Grid */}
      <Grid
        args={[width, depth]}
        cellSize={1}
        cellThickness={1}
        cellColor="#e2e8f0"
        sectionSize={5}
        sectionThickness={1.5}
        sectionColor="#cbd5e1"
        fadeDistance={50}
        fadeStrength={1}
        infiniteGrid={true}
      />
      {/* Solid Floor base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1E293B" roughness={0.8} />
      </mesh>
    </group>
  );
}

function WarehouseWalls({ width, depth, height }: { width: number; depth: number; height: number }) {
  const wallMaterial = (
    <meshPhysicalMaterial 
      color="#3B82F6" 
      transparent 
      opacity={0.15} 
      depthWrite={false}
      roughness={0.1}
      transmission={0.9}
      thickness={0.5}
    />
  );

  return (
    <group>
      {/* Back Wall */}
      <mesh position={[0, height / 2, -depth / 2]}>
        <boxGeometry args={[width, height, 0.2]} />
        {wallMaterial}
      </mesh>
      {/* Front Wall */}
      <mesh position={[0, height / 2, depth / 2]}>
        <boxGeometry args={[width, height, 0.2]} />
        {wallMaterial}
      </mesh>
      {/* Left Wall */}
      <mesh position={[-width / 2, height / 2, 0]}>
        <boxGeometry args={[0.2, height, depth]} />
        {wallMaterial}
      </mesh>
      {/* Right Wall */}
      <mesh position={[width / 2, height / 2, 0]}>
        <boxGeometry args={[0.2, height, depth]} />
        {wallMaterial}
      </mesh>
    </group>
  );
}

function Docks() {
  const layout = useSlottingStore((s) => s.layout);
  if (!layout) return null;

  return (
    <group>
      {layout.dock_bays.map((dock) => {
        if (dock.x_position === null || dock.z_position === null) return null;
        const color = dock.dock_type === 'LOADING' ? '#3B82F6' : dock.dock_type === 'UNLOADING' ? '#8B3A0E' : '#64748B';
        return (
          <group key={dock.id} position={[dock.x_position, 0.1, dock.z_position]}>
            {/* Dock Area */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4, 4]} />
              <meshBasicMaterial color={color} transparent opacity={0.2} />
            </mesh>
            {/* Dock Label Plate */}
            <mesh position={[0, 0, -1.8]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4, 0.5]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function WarehouseCanvas() {
  const { layout, parcels, showDensity, highlightPath, clearSelection } = useSlottingStore();

  if (!layout) return null;

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <Canvas
        camera={{ position: [0, 20, 25], fov: 45 }}
        shadows
        onPointerMissed={clearSelection}
      >
        <color attach="background" args={['#0F172A']} />
        <fog attach="fog" args={['#0F172A', 20, 70]} />
        
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[15, 25, 10]}
          intensity={0.8}
          color="#ffffff"
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <Environment preset="warehouse" />

        <Floor width={layout.width} depth={layout.depth} />
        <WarehouseWalls width={layout.width} depth={layout.depth} height={layout.height || 6} />
        <Docks />

        {layout.racks.map((rack) => (
          <SlottingRack3D
            key={rack.id}
            config={rack}
            parcels={parcels}
            showDensity={showDensity}
          />
        ))}

        {highlightPath && <GatePath3D path={highlightPath} />}

        <OrbitControls
          makeDefault
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2 - 0.1}
          minDistance={5}
          maxDistance={60}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
