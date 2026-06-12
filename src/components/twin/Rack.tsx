import { useState } from 'react';
import { Text, Html } from '@react-three/drei';
import { RackConfig, getDensityColor } from './warehouseConfig';

interface RackProps {
  config: RackConfig;
  showDensity: boolean;
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function Rack({ config, showDensity, selected, onSelect }: RackProps) {
  const [hovered, setHovered] = useState(false);
  const color = showDensity ? getDensityColor(config.utilization) : '#94A3B8';
  const isSelected = selected === config.id;
  const [w, h, d] = config.size;

  // Simulate shelves inside the rack
  const shelfCount = 4;
  const filledShelves = Math.ceil(config.utilization * shelfCount);

  return (
    <group position={config.position}>
      {/* Rack frame (wireframe-like posts) */}
      {/* Left posts */}
      <mesh position={[-w / 2, h / 2, -d / 2]}>
        <boxGeometry args={[0.08, h, 0.08]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[-w / 2, h / 2, d / 2]}>
        <boxGeometry args={[0.08, h, 0.08]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* Right posts */}
      <mesh position={[w / 2, h / 2, -d / 2]}>
        <boxGeometry args={[0.08, h, 0.08]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[w / 2, h / 2, d / 2]}>
        <boxGeometry args={[0.08, h, 0.08]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* Shelves */}
      {Array.from({ length: shelfCount }).map((_, i) => {
        const shelfY = (i + 1) * (h / shelfCount);
        const isFilled = i < filledShelves;
        return (
          <group key={i}>
            {/* Shelf platform */}
            <mesh position={[0, shelfY, 0]}>
              <boxGeometry args={[w, 0.05, d]} />
              <meshStandardMaterial color="#64748B" />
            </mesh>
            {/* Inventory boxes on filled shelves */}
            {isFilled && (
              <mesh position={[0, shelfY - (h / shelfCount) / 2, 0]}>
                <boxGeometry args={[w * 0.85, (h / shelfCount) * 0.7, d * 0.85]} />
                <meshStandardMaterial
                  color={color}
                  transparent
                  opacity={hovered || isSelected ? 0.9 : 0.6}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Clickable hitbox */}
      <mesh
        position={[0, h / 2, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect(config.id); }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[w + 0.2, h + 0.2, d + 0.2]} />
        <meshStandardMaterial
          transparent
          opacity={0}
        />
      </mesh>

      {/* Selection outline */}
      {(hovered || isSelected) && (
        <mesh position={[0, h / 2, 0]}>
          <boxGeometry args={[w + 0.15, h + 0.15, d + 0.15]} />
          <meshStandardMaterial color="#0D9488" wireframe />
        </mesh>
      )}

      {/* Rack label */}
      <Text
        position={[0, h + 0.4, 0]}
        fontSize={0.35}
        color={hovered || isSelected ? '#0D9488' : '#475569'}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {config.id}
      </Text>

      {/* Utilization label */}
      {showDensity && (
        <Text
          position={[0, h + 0.1, 0]}
          fontSize={0.25}
          color={color}
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {`${Math.round(config.utilization * 100)}%`}
        </Text>
      )}

      {/* Info popup when selected */}
      {isSelected && (
        <Html position={[w / 2 + 1, h, 0]} distanceFactor={10}>
          <div style={{
            background: 'rgba(24,24,27,0.95)', color: '#fff', padding: '12px 16px',
            borderRadius: 12, fontSize: 12, minWidth: 160, backdropFilter: 'blur(8px)',
            border: '1px solid rgba(13,148,136,0.3)',
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: '#14B8A6' }}>{config.id}</div>
            <div>Zone: <strong>{config.zone}</strong></div>
            <div>Inventory: <strong>{config.inventory}/{config.capacity}</strong></div>
            <div>Utilization: <strong style={{ color }}>{Math.round(config.utilization * 100)}%</strong></div>
          </div>
        </Html>
      )}
    </group>
  );
}
