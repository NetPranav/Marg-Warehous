import { Text, Html } from '@react-three/drei';
import { DockConfig, getDockColor } from './warehouseConfig';
import { useState } from 'react';

interface DockBay3DProps {
  config: DockConfig;
}

export default function DockBay3D({ config }: DockBay3DProps) {
  const [hovered, setHovered] = useState(false);
  const color = getDockColor(config.status);

  return (
    <group position={config.position}>
      {/* Dock platform */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[4, 0.1, 3]} />
        <meshStandardMaterial color={color} transparent opacity={0.3} />
      </mesh>

      {/* Dock border */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[4, 0.04, 3]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>

      {/* Dock wall / bumper */}
      <mesh position={[0, 1, -1.5]}>
        <boxGeometry args={[4, 2, 0.2]} />
        <meshStandardMaterial color="#6B7280" transparent opacity={0.4} />
      </mesh>

      {/* Loading door */}
      <mesh position={[0, 1.2, -1.35]}>
        <boxGeometry args={[3.2, 2.2, 0.05]} />
        <meshStandardMaterial color={color} transparent opacity={0.5} />
      </mesh>

      {/* Truck model if occupied */}
      {config.status === 'OCCUPIED' && (
        <group position={[0, 0.6, 0.8]}>
          {/* Truck body */}
          <mesh castShadow>
            <boxGeometry args={[2, 1.2, 3]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {/* Truck cab */}
          <mesh position={[0, 0.3, 2]}>
            <boxGeometry args={[1.8, 0.8, 1]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        </group>
      )}

      {/* Status indicator light */}
      <mesh position={[2.2, 2.5, -1.3]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>

      {/* Dock label */}
      <Text
        position={[0, 2.8, -1.3]}
        fontSize={0.35}
        color="#fff"
        anchorX="center"
        anchorY="middle"
        font={undefined}
        outlineWidth={0.03}
        outlineColor="#000"
      >
        {config.id}
      </Text>

      {/* Status label */}
      <Text
        position={[0, 2.4, -1.3]}
        fontSize={0.22}
        color={color}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {config.status}
      </Text>

      {/* Hover info */}
      <mesh
        position={[0, 1, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[4.5, 3, 4]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {hovered && config.truck && (
        <Html position={[3, 2, 0]} distanceFactor={10}>
          <div style={{
            background: 'rgba(24,24,27,0.95)', color: '#fff', padding: '10px 14px',
            borderRadius: 10, fontSize: 11, minWidth: 140,
            border: `1px solid ${color}40`,
          }}>
            <div style={{ fontWeight: 700, color, marginBottom: 4 }}>{config.id}</div>
            <div>Truck: <strong>{config.truck}</strong></div>
            {config.shipment && <div>Shipment: <strong>{config.shipment}</strong></div>}
          </div>
        </Html>
      )}
    </group>
  );
}
