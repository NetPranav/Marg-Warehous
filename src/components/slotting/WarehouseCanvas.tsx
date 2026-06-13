import { Canvas } from '@react-three/fiber';
import { MapControls, Environment, Grid } from '@react-three/drei';
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
        cellThickness={0.8}
        cellColor="#334155"
        sectionSize={5}
        sectionThickness={1.2}
        sectionColor="#475569"
        fadeDistance={50}
        fadeStrength={1}
        infiniteGrid={true}
      />
      {/* Concrete floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1A2332" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Floor lane markings — yellow safety lines like real warehouses */}
      {[-depth / 2 + 2, -depth / 4, 0, depth / 4].map((z, i) => (
        <mesh key={`lane-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]}>
          <planeGeometry args={[width * 0.9, 0.08]} />
          <meshBasicMaterial color="#F59E0B" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function IndustrialCeiling({ width, depth, height }: { width: number; depth: number; height: number }) {
  const ceilH = height + 1;
  return (
    <group>
      {/* Roof panel */}
      <mesh position={[0, ceilH, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#1E293B" side={THREE.DoubleSide} roughness={0.8} />
      </mesh>

      {/* Steel trusses along length */}
      {Array.from({ length: 5 }).map((_, i) => {
        const x = -width / 2 + (width / 4) * i;
        return (
          <group key={`truss-${i}`}>
            {/* Main beam */}
            <mesh position={[x, ceilH - 0.3, 0]}>
              <boxGeometry args={[0.15, 0.3, depth]} />
              <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* Overhead lights */}
      {Array.from({ length: 3 }).map((_, i) =>
        Array.from({ length: 4 }).map((_, j) => {
          const x = -width / 3 + (width / 3) * i;
          const z = -depth / 2 + (depth / 3) * (j + 0.5);
          return (
            <group key={`light-${i}-${j}`}>
              {/* Light housing */}
              <mesh position={[x, ceilH - 0.5, z]}>
                <boxGeometry args={[0.6, 0.1, 0.3]} />
                <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Light emitter glow */}
              <mesh position={[x, ceilH - 0.6, z]}>
                <planeGeometry args={[0.5, 0.2]} />
                <meshBasicMaterial color="#FFF7ED" transparent opacity={0.6} />
              </mesh>
              {/* Actual point light */}
              <pointLight position={[x, ceilH - 1, z]} intensity={0.15} color="#FFF7ED" distance={12} decay={2} />
            </group>
          );
        })
      )}
    </group>
  );
}

function WarehouseWalls({ width, depth, height }: { width: number; depth: number; height: number }) {
  const ceilH = height + 1;
  const wallMat = (
    <meshPhysicalMaterial
      color="#334155"
      transparent
      opacity={0.08}
      depthWrite={false}
      roughness={0.5}
    />
  );

  return (
    <group>
      {/* Back Wall — corrugated metal look */}
      <mesh position={[0, ceilH / 2, -depth / 2]}>
        <boxGeometry args={[width, ceilH, 0.2]} />
        <meshStandardMaterial color="#1E293B" metalness={0.6} roughness={0.7} />
      </mesh>
      {/* Front Wall — translucent to see from camera */}
      <mesh position={[0, ceilH / 2, depth / 2]}>
        <boxGeometry args={[width, ceilH, 0.2]} />
        {wallMat}
      </mesh>
      {/* Left Wall */}
      <mesh position={[-width / 2, ceilH / 2, 0]}>
        <boxGeometry args={[0.2, ceilH, depth]} />
        {wallMat}
      </mesh>
      {/* Right Wall */}
      <mesh position={[width / 2, ceilH / 2, 0]}>
        <boxGeometry args={[0.2, ceilH, depth]} />
        {wallMat}
      </mesh>

      {/* Loading dock doors on back wall */}
      {Array.from({ length: 4 }).map((_, i) => {
        const x = -width / 2 + (width / 4) * (i + 0.5);
        return (
          <group key={`door-${i}`}>
            {/* Door frame */}
            <mesh position={[x, 2, -depth / 2 + 0.15]}>
              <boxGeometry args={[3, 4, 0.1]} />
              <meshStandardMaterial color="#0F172A" metalness={0.3} roughness={0.5} />
            </mesh>
            {/* Roll-up door */}
            <mesh position={[x, 2, -depth / 2 + 0.2]}>
              <boxGeometry args={[2.8, 3.8, 0.05]} />
              <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.4} />
            </mesh>
          </group>
        );
      })}
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
        const color = dock.dock_type === 'LOADING' ? '#3B82F6' : dock.dock_type === 'UNLOADING' ? '#E8700A' : '#64748B';
        return (
          <group key={dock.id} position={[dock.x_position, 0.1, dock.z_position]}>
            {/* Dock Area */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4, 4]} />
              <meshBasicMaterial color={color} transparent opacity={0.15} />
            </mesh>
            {/* Dock hazard stripes */}
            <mesh position={[0, 0.01, -1.8]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[4, 0.3]} />
              <meshBasicMaterial color="#F59E0B" transparent opacity={0.5} />
            </mesh>
            {/* Dock Label Plate */}
            <mesh position={[0, 0.02, -2.2]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[3, 0.4]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Decorative forklift (simple box representation)
function Forklift({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.8, 0.6, 1.2]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Mast */}
      <mesh position={[0, 1, -0.55]}>
        <boxGeometry args={[0.6, 1.4, 0.08]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Forks */}
      <mesh position={[-0.2, 0.15, -0.9]}>
        <boxGeometry args={[0.08, 0.05, 0.7]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.2, 0.15, -0.9]}>
        <boxGeometry args={[0.08, 0.05, 0.7]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Wheels */}
      {[[-0.35, 0.12, 0.35], [0.35, 0.12, 0.35], [-0.35, 0.12, -0.35], [0.35, 0.12, -0.35]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.1, 12]} />
          <meshStandardMaterial color="#1E293B" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export default function WarehouseCanvas() {
  const { layout, parcels, showDensity, highlightPath, clearSelection } = useSlottingStore();

  if (!layout) return null;

  const wh = layout.height || 6;

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <Canvas
        camera={{ position: [0, 20, 25], fov: 45 }}
        shadows
        onPointerMissed={clearSelection}
      >
        <color attach="background" args={['#0C1322']} />
        <fog attach="fog" args={['#0C1322', 25, 75]} />

        <ambientLight intensity={0.3} />
        <directionalLight
          position={[15, 25, 10]}
          intensity={0.7}
          color="#ffffff"
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight
          position={[-10, 20, -5]}
          intensity={0.2}
          color="#94A3B8"
        />
        <Environment preset="warehouse" />

        <Floor width={layout.width} depth={layout.depth} />
        <WarehouseWalls width={layout.width} depth={layout.depth} height={wh} />
        <IndustrialCeiling width={layout.width} depth={layout.depth} height={wh} />
        <Docks />

        {/* Decorative forklifts */}
        <Forklift position={[-6, 0, 2]} />
        <Forklift position={[8, 0, -5]} />

        {layout.racks.map((rack) => (
          <SlottingRack3D
            key={rack.id}
            config={rack}
            parcels={parcels}
            showDensity={showDensity}
          />
        ))}

        {highlightPath && <GatePath3D path={highlightPath} />}

        <MapControls
          makeDefault
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2 - 0.1}
          minDistance={5}
          maxDistance={100}
        />
      </Canvas>
    </div>
  );
}
