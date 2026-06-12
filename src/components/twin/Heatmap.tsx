import { useMemo } from 'react';
import { HeatmapPoint, WAREHOUSE } from './warehouseConfig';
import * as THREE from 'three';

interface HeatmapProps {
  data: HeatmapPoint[];
  visible: boolean;
}

export default function Heatmap({ data, visible }: HeatmapProps) {
  const texture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Clear with transparent
    ctx.clearRect(0, 0, size, size);

    // Draw heatmap circles
    data.forEach((point) => {
      // Map world coordinates to canvas coordinates
      const x = ((point.position[0] + WAREHOUSE.width / 2) / WAREHOUSE.width) * size;
      const y = ((point.position[1] + WAREHOUSE.depth / 2) / WAREHOUSE.depth) * size;
      const radius = 25 + point.intensity * 20;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

      if (point.intensity > 0.7) {
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
        gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.2)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else if (point.intensity > 0.4) {
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.5)');
        gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
        gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.1)');
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [data]);

  if (!visible) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
      <planeGeometry args={[WAREHOUSE.width, WAREHOUSE.depth]} />
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </mesh>
  );
}
