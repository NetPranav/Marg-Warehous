import { useRef, useState } from 'react';
import { Html, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import type { RackData, ShelfData, ParcelData } from '@/stores/slottingStore';
import { useSlottingStore } from '@/stores/slottingStore';

function densityColor(u: number) {
  if (u < 0.3) return '#22C55E';
  if (u < 0.6) return '#F59E0B';
  if (u < 0.8) return '#FF8C00';
  return '#EF4444';
}

interface Props {
  config: RackData;
  parcels: ParcelData[];
  showDensity: boolean;
}

export default function SlottingRack3D({ config, parcels, showDensity }: Props) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const { viewMode, selectedRackId, selectedShelfId, selectRack, selectShelf, updateRackPosition } = useSlottingStore();
  const isSelected = selectedRackId === config.rack_id;

  const { shelf_width: w, shelf_height: sh, shelf_depth: d, num_shelves } = config;
  const totalHeight = sh * num_shelves;

  return (
    <>
      {viewMode === 'editor' && isSelected && (
        <TransformControls
          object={groupRef}
          mode="translate"
          showY={false}
          onMouseUp={() => {
            if (groupRef.current) {
              updateRackPosition(config.rack_id, groupRef.current.position.x, groupRef.current.position.z);
            }
          }}
        />
      )}
      <group ref={groupRef} position={[config.x_position, 0, config.z_position]}>
      {/* Posts */}
      {[
        [-w / 2, -d / 2],
        [-w / 2, d / 2],
        [w / 2, -d / 2],
        [w / 2, d / 2],
      ].map(([px, pz], i) => (
        <mesh key={i} position={[px, totalHeight / 2, pz]}>
          <boxGeometry args={[0.08, totalHeight, 0.08]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      ))}

      {/* Shelves */}
      {config.shelves.map((shelf) => {
        const sy = shelf.level * sh;
        const util = shelf.utilization || 0;
        const color = showDensity ? densityColor(util) : '#94A3B8';
        const isShelfSelected = selectedShelfId === shelf.id;

        // Parcels on this shelf
        const shelfParcels = parcels.filter((p) => p.shelf === shelf.id);

        return (
          <group key={shelf.id}>
            {/* Shelf platform */}
            <mesh position={[0, sy, 0]}>
              <boxGeometry args={[w, 0.05, d]} />
              <meshStandardMaterial color="#64748B" />
            </mesh>

            {/* Utilization fill */}
            {util > 0 && (
              <mesh position={[0, sy + 0.05 + (sh * 0.8 * Math.min(util, 1)) / 2, 0]}>
                <boxGeometry args={[w * 0.9, sh * 0.8 * Math.min(util, 1), d * 0.9]} />
                <meshStandardMaterial
                  color={color}
                  transparent
                  opacity={hovered || isSelected || isShelfSelected ? 0.3 : 0.15}
                  depthWrite={false}
                />
              </mesh>
            )}

            {/* Individual parcels */}
            {shelfParcels.map((parcel, pi) => {
              // Parcels use their actual dimensions, capped by shelf size
              const pw = Math.min(parcel.width, w * 0.8);
              const ph = Math.min(parcel.height, sh * 0.9);
              const pd = Math.min(parcel.depth, d * 0.8);
              
              // Place them sequentially along the shelf (simple linear layout for visual)
              const px = -w / 2 + pw / 2 + 0.1 + (pi * (pw + 0.1));
              const py = sy + 0.025 + ph / 2; // Resting on the shelf platform
              const isParcelSelected =
                useSlottingStore.getState().selectedParcel?.id === parcel.id;

              return (
                <group key={parcel.id} position={[Math.min(px, w/2 - pw/2), py, 0]}>
                  <mesh>
                    <boxGeometry args={[pw, ph, pd]} />
                    <meshStandardMaterial
                      color={isParcelSelected ? '#E8700A' : '#8B3A0E'}
                      emissive={isParcelSelected ? '#E8700A' : '#000000'}
                      emissiveIntensity={isParcelSelected ? 0.5 : 0}
                    />
                  </mesh>
                </group>
              );
            })}

            {/* Shelf select hitbox */}
            <mesh
              position={[0, sy + sh / 2, 0]}
              onClick={(e) => {
                e.stopPropagation();
                selectRack(config.rack_id);
                selectShelf(isShelfSelected ? null : shelf.id);
              }}
              onPointerOver={() => {
                setHovered(true);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                setHovered(false);
                document.body.style.cursor = 'auto';
              }}
            >
              <boxGeometry args={[w + 0.1, sh, d + 0.1]} />
              <meshStandardMaterial transparent opacity={0} />
            </mesh>

            {/* Shelf selection wireframe */}
            {isShelfSelected && (
              <mesh position={[0, sy + sh / 2, 0]}>
                <boxGeometry args={[w + 0.12, sh, d + 0.12]} />
                <meshStandardMaterial color="#E8700A" wireframe />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Rack selection outline */}
      {(hovered || isSelected) && (
        <mesh position={[0, totalHeight / 2, 0]}>
          <boxGeometry args={[w + 0.2, totalHeight + 0.15, d + 0.2]} />
          <meshStandardMaterial color="#8B3A0E" wireframe />
        </mesh>
      )}

      {/* Rack label */}
      <Html position={[0, totalHeight + 0.6, 0]} center style={{ pointerEvents: 'none' }}>
        <div
          style={{
            color: hovered || isSelected ? '#E8700A' : '#94A3B8',
            fontWeight: 700,
            fontSize: 12,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            textShadow: '0 0 4px rgba(0,0,0,0.8)',
          }}
        >
          {config.rack_id}
          {showDensity && config.shelves.length > 0 && (
            <div
              style={{
                color: densityColor(
                  config.shelves.reduce((s, sh) => s + (sh.utilization || 0), 0) /
                    config.shelves.length,
                ),
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              {Math.round(
                (config.shelves.reduce((s, sh) => s + (sh.utilization || 0), 0) /
                  config.shelves.length) *
                  100,
              )}
              %
            </div>
          )}
        </div>
      </Html>

      {/* Selected rack info popup */}
      {isSelected && viewMode !== 'editor' && (
        <Html position={[w / 2 + 1.5, totalHeight, 0]} distanceFactor={10}>
          <div
            style={{
              background: 'rgba(15,23,42,0.92)',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: 11,
              minWidth: 160,
              border: '1px solid rgba(232,112,10,0.3)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, color: '#E8700A', marginBottom: 4 }}>
              {config.rack_id}
            </div>
            <div>
              Shelves: <strong>{config.num_shelves}</strong>
            </div>
            <div>
              Size:{' '}
              <strong>
                {config.shelf_width}×{config.shelf_depth}×{config.shelf_height}m
              </strong>
            </div>
            <div>
              Parcels:{' '}
              <strong>
                {parcels.filter((p) => p.rack_id === config.rack_id).length}
              </strong>
            </div>
          </div>
        </Html>
      )}
    </group>
    </>
  );
}
