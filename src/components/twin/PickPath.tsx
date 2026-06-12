import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import { PickPathNode } from './warehouseConfig';
import * as THREE from 'three';

interface PickPathProps {
  nodes: PickPathNode[];
  visible: boolean;
}

export default function PickPath({ nodes, visible }: PickPathProps) {
  const markerRef = useRef<THREE.Mesh>(null);
  const progress = useRef(0);

  const points = useMemo(() =>
    nodes.map(n => new THREE.Vector3(...n.position)),
    [nodes]
  );

  const curve = useMemo(() =>
    new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5),
    [points]
  );

  // Animate a marker along the path
  useFrame((_, delta) => {
    if (markerRef.current && visible) {
      progress.current = (progress.current + delta * 0.1) % 1;
      const pos = curve.getPoint(progress.current);
      markerRef.current.position.copy(pos);
      markerRef.current.position.y += 0.3;
    }
  });

  if (!visible) return null;

  return (
    <group>
      {/* Path line */}
      <Line
        points={points}
        color="#0D9488"
        lineWidth={3}
        dashed
        dashScale={2}
        dashSize={0.3}
        gapSize={0.15}
      />

      {/* Path nodes */}
      {nodes.map((node, i) => (
        <group key={i} position={node.position}>
          {/* Node marker */}
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color={i === 0 ? '#22C55E' : i === nodes.length - 1 ? '#EF4444' : '#0D9488'}
              emissive={i === 0 ? '#22C55E' : i === nodes.length - 1 ? '#EF4444' : '#0D9488'}
              emissiveIntensity={0.5}
            />
          </mesh>

          {/* Node label */}
          <Text
            position={[0, 0.6, 0]}
            fontSize={0.2}
            color="#0D9488"
            anchorX="center"
            anchorY="middle"
            font={undefined}
          >
            {`${i + 1}. ${node.label}`}
          </Text>

          {/* Step number */}
          <mesh position={[0, 0.2, 0]}>
            <ringGeometry args={[0.2, 0.25, 16]} />
            <meshStandardMaterial color="#0D9488" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Animated marker following path */}
      <mesh ref={markerRef}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial color="#F97316" emissive="#F97316" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}
