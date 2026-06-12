import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Mesh } from 'three';
import { ForkliftConfig, getForkliftColor } from './warehouseConfig';

interface ForkliftProps {
  config: ForkliftConfig;
}

export default function Forklift({ config }: ForkliftProps) {
  const ref = useRef<Mesh>(null);
  const color = getForkliftColor(config.status);

  // Animate active forklifts with a gentle bob
  useFrame((state) => {
    if (ref.current && config.status === 'ACTIVE') {
      ref.current.position.y = config.position[1] + 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    }
  });

  return (
    <group position={config.position}>
      <group ref={ref as any} position={[0, 0.3, 0]}>
        {/* Forklift body */}
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.5, 1.2]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* Forklift mast */}
        <mesh position={[0, 0.5, -0.5]}>
          <boxGeometry args={[0.1, 1, 0.1]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0, 0.5, -0.5]}>
          <boxGeometry args={[0.6, 0.05, 0.4]} />
          <meshStandardMaterial color="#475569" />
        </mesh>

        {/* Status light on top */}
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={config.status === 'ACTIVE' ? 1.5 : 0.3} />
        </mesh>
      </group>

      {/* Label */}
      <Text
        position={[0, 1.3, 0]}
        fontSize={0.25}
        color={color}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {config.id}
      </Text>

      {/* Status text */}
      <Text
        position={[0, 1.05, 0]}
        fontSize={0.18}
        color="#6B7280"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {config.status}
      </Text>
    </group>
  );
}
