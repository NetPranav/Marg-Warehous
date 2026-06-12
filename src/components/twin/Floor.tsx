import { useRef } from 'react';
import { Mesh } from 'three';
import { Text } from '@react-three/drei';
import { WAREHOUSE } from './warehouseConfig';

export default function Floor() {
  const meshRef = useRef<Mesh>(null);

  return (
    <group>
      {/* Main floor */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[WAREHOUSE.width, WAREHOUSE.depth]} />
        <meshStandardMaterial color="#E5E7EB" roughness={0.8} />
      </mesh>

      {/* Grid lines */}
      <gridHelper
        args={[WAREHOUSE.width, 20, '#D1D5DB', '#D1D5DB']}
        position={[0, 0, 0]}
      />

      {/* Walls - Back */}
      <mesh position={[0, WAREHOUSE.wallHeight / 2, -WAREHOUSE.depth / 2]}>
        <boxGeometry args={[WAREHOUSE.width, WAREHOUSE.wallHeight, 0.15]} />
        <meshStandardMaterial color="#9CA3AF" transparent opacity={0.3} />
      </mesh>

      {/* Walls - Left */}
      <mesh position={[-WAREHOUSE.width / 2, WAREHOUSE.wallHeight / 2, 0]}>
        <boxGeometry args={[0.15, WAREHOUSE.wallHeight, WAREHOUSE.depth]} />
        <meshStandardMaterial color="#9CA3AF" transparent opacity={0.2} />
      </mesh>

      {/* Walls - Right */}
      <mesh position={[WAREHOUSE.width / 2, WAREHOUSE.wallHeight / 2, 0]}>
        <boxGeometry args={[0.15, WAREHOUSE.wallHeight, WAREHOUSE.depth]} />
        <meshStandardMaterial color="#9CA3AF" transparent opacity={0.2} />
      </mesh>

      {/* Entry/Exit marker */}
      <mesh position={[0, 0.02, WAREHOUSE.depth / 2 - 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 1.5]} />
        <meshStandardMaterial color="#0D9488" transparent opacity={0.3} />
      </mesh>
      <Text
        position={[0, 0.05, WAREHOUSE.depth / 2 - 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.6}
        color="#0D9488"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        ENTRY / EXIT
      </Text>

      {/* Zone labels on floor */}
      {[
        { label: 'ZONE A', z: -8 },
        { label: 'ZONE B', z: -2 },
        { label: 'ZONE C', z: 4 },
      ].map((zone) => (
        <Text
          key={zone.label}
          position={[17, 0.05, zone.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.5}
          color="#6B7280"
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {zone.label}
        </Text>
      ))}
    </group>
  );
}
