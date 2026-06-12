// Warehouse Digital Twin layout configuration
// Procedural warehouse: 12 racks in 3 rows, 4 dock bays, aisles

export interface RackConfig {
  id: string;
  position: [number, number, number];
  size: [number, number, number]; // width, height, depth
  utilization: number; // 0-1
  inventory: number;
  capacity: number;
  zone: string;
}

export interface DockConfig {
  id: string;
  position: [number, number, number];
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  truck?: string;
  shipment?: string;
}

export interface ForkliftConfig {
  id: string;
  position: [number, number, number];
  status: 'ACTIVE' | 'IDLE' | 'CHARGING' | 'OFFLINE';
  task?: string;
}

export interface HeatmapPoint {
  position: [number, number];
  intensity: number; // 0-1
}

export interface PickPathNode {
  position: [number, number, number];
  label: string;
}

// Warehouse dimensions
export const WAREHOUSE = {
  width: 40,
  depth: 30,
  wallHeight: 6,
  floorY: 0,
};

// Generate rack layout: 3 rows x 4 racks
export function generateRacks(): RackConfig[] {
  const rows = [
    { z: -8, zone: 'A', label: 'Row A' },
    { z: -2, zone: 'B', label: 'Row B' },
    { z: 4, zone: 'C', label: 'Row C' },
  ];

  const racks: RackConfig[] = [];
  let idx = 1;

  for (const row of rows) {
    for (let col = 0; col < 4; col++) {
      const x = -12 + col * 8;
      const utilization = 0.15 + Math.random() * 0.8;
      const capacity = 100 + Math.floor(Math.random() * 200);
      racks.push({
        id: `R-${String(idx).padStart(2, '0')}`,
        position: [x, 0, row.z],
        size: [3, 4, 1.5],
        utilization: Math.round(utilization * 100) / 100,
        inventory: Math.floor(capacity * utilization),
        capacity,
        zone: row.zone,
      });
      idx++;
    }
  }

  return racks;
}

// Generate dock bays along back wall
export function generateDocks(): DockConfig[] {
  const statuses: DockConfig['status'][] = ['OCCUPIED', 'AVAILABLE', 'RESERVED', 'AVAILABLE'];
  const docks: DockConfig[] = [];

  for (let i = 0; i < 4; i++) {
    docks.push({
      id: `D-${String(i + 1).padStart(2, '0')}`,
      position: [-12 + i * 8, 0, -13],
      status: statuses[i],
      truck: statuses[i] === 'OCCUPIED' ? 'MH-12-AB-3456' : undefined,
      shipment: statuses[i] === 'OCCUPIED' ? 'SHP-D1BBF236' : undefined,
    });
  }

  return docks;
}

// Generate forklifts
export function generateForklifts(): ForkliftConfig[] {
  return [
    { id: 'FL-01', position: [-6, 0, 1], status: 'ACTIVE', task: 'Moving pallet to R-05' },
    { id: 'FL-02', position: [8, 0, -5], status: 'IDLE' },
    { id: 'FL-03', position: [14, 0, 8], status: 'CHARGING' },
  ];
}

// Generate heatmap points
export function generateHeatmapData(): HeatmapPoint[] {
  return [
    { position: [-12, -13], intensity: 0.9 },  // Dock area (busy)
    { position: [-4, -13], intensity: 0.7 },
    { position: [4, -13], intensity: 0.3 },
    { position: [12, -13], intensity: 0.2 },
    { position: [-10, -2], intensity: 0.6 },    // Row B (moderate)
    { position: [0, -2], intensity: 0.8 },
    { position: [10, 4], intensity: 0.4 },       // Row C (low)
    { position: [-8, 8], intensity: 0.2 },        // Near entry
  ];
}

// Sample pick path
export function generatePickPath(): PickPathNode[] {
  return [
    { position: [0, 0.1, 10], label: 'Start (Entry)' },
    { position: [0, 0.1, 4], label: 'Aisle C' },
    { position: [-4, 0.1, 4], label: 'Rack R-09' },
    { position: [-4, 0.1, -2], label: 'Aisle B' },
    { position: [4, 0.1, -2], label: 'Rack R-07' },
    { position: [4, 0.1, -8], label: 'Aisle A' },
    { position: [12, 0.1, -8], label: 'Rack R-04' },
    { position: [12, 0.1, -13], label: 'Dock D-04' },
  ];
}

// Density color mapping
export function getDensityColor(utilization: number): string {
  if (utilization < 0.3) return '#3B82F6';  // Blue - underutilized
  if (utilization < 0.6) return '#22C55E';  // Green - efficient
  if (utilization < 0.8) return '#F59E0B';  // Yellow - approaching capacity
  return '#EF4444';                          // Red - near full
}

// Dock status colors
export function getDockColor(status: DockConfig['status']): string {
  switch (status) {
    case 'AVAILABLE': return '#22C55E';
    case 'OCCUPIED': return '#EF4444';
    case 'RESERVED': return '#3B82F6';
    case 'MAINTENANCE': return '#F59E0B';
    default: return '#6B7280';
  }
}

// Forklift status colors
export function getForkliftColor(status: ForkliftConfig['status']): string {
  switch (status) {
    case 'ACTIVE': return '#22C55E';
    case 'IDLE': return '#F59E0B';
    case 'CHARGING': return '#3B82F6';
    case 'OFFLINE': return '#6B7280';
    default: return '#6B7280';
  }
}
