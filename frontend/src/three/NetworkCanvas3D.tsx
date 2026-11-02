import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Device, NetworkConnection, DeviceState } from '../types';

interface NetworkCanvasProps {
  devices: Device[];
  connections: NetworkConnection[];
  selectedDevice: Device | null;
  onSelectDevice: (device: Device | null) => void;
  filterSegment?: string;
  filterState?: string;
  searchQuery?: string;
}

const STATE_COLORS: Record<DeviceState, string> = {
  SUSCEPTIBLE: '#25D995', // Emerald Safe Green
  EXPOSED: '#FFAA42',     // Warning Orange
  INFECTED: '#FF4B5C',    // Threat Red
  RECOVERED: '#21D4FD',   // Cyber Recovery Cyan
  OFFLINE: '#64748B',     // Dim Quarantined Slate
};

const NodeMesh: React.FC<{
  device: Device;
  isSelected: boolean;
  isNeighbor: boolean;
  onClick: (d: Device) => void;
}> = ({ device, isSelected, isNeighbor, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = STATE_COLORS[device.state] || '#25D995';

  // Pulsing animation for infected or exposed devices
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    if (device.state === 'INFECTED') {
      const scale = 1.0 + Math.sin(t * 8) * 0.22;
      meshRef.current.scale.set(scale, scale, scale);
    } else if (device.state === 'EXPOSED') {
      const scale = 1.0 + Math.sin(t * 4) * 0.12;
      meshRef.current.scale.set(scale, scale, scale);
    } else if (isSelected) {
      const scale = 1.25 + Math.sin(t * 3) * 0.08;
      meshRef.current.scale.set(scale, scale, scale);
    } else {
      meshRef.current.scale.set(1.0, 1.0, 1.0);
    }
  });

  const renderGeometry = () => {
    switch (device.device_type) {
      case 'server':
        return <boxGeometry args={[1.5, 2.0, 1.5]} />;
      case 'database_server':
        return <cylinderGeometry args={[1.2, 1.2, 1.8, 16]} />;
      case 'gateway':
        return <octahedronGeometry args={[1.6]} />;
      case 'router':
        return <dodecahedronGeometry args={[1.3]} />;
      case 'laptop':
        return <boxGeometry args={[1.3, 0.4, 1.1]} />;
      default:
        return <boxGeometry args={[1.2, 1.2, 1.2]} />;
    }
  };

  return (
    <group position={[device.pos_x, device.pos_y, device.pos_z]}>
      {/* Outer Halo Glow for Selected or Neighbor nodes */}
      {(isSelected || isNeighbor || device.state === 'INFECTED') && (
        <mesh>
          <sphereGeometry args={[2.2, 16, 16]} />
          <meshBasicMaterial
            color={device.state === 'INFECTED' ? '#FF4B5C' : (isSelected ? '#21D4FD' : color)}
            transparent
            opacity={device.state === 'INFECTED' ? 0.35 : 0.2}
            wireframe
          />
        </mesh>
      )}

      {/* Main Node Mesh */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(device);
        }}
      >
        {renderGeometry()}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={device.state === 'INFECTED' ? 0.8 : (isSelected ? 0.9 : 0.35)}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Floating 3D Label for Important Nodes or Selected */}
      {(isSelected || device.state === 'INFECTED' || device.device_type === 'gateway') && (
        <Html distanceFactor={45} position={[0, 2.2, 0]} center>
          <div
            className={`px-2 py-0.5 rounded text-[11px] font-mono tracking-wider whitespace-nowrap pointer-events-none backdrop-blur-md shadow-lg border ${
              device.state === 'INFECTED'
                ? 'bg-red-950/90 text-red-300 border-red-500 animate-pulse'
                : isSelected
                ? 'bg-cyan-950/90 text-cyan-200 border-cyan-400 font-bold'
                : 'bg-slate-900/80 text-slate-300 border-slate-700'
            }`}
          >
            {device.name} [{device.ip_address}]
          </div>
        </Html>
      )}
    </group>
  );
};

const ConnectionLines: React.FC<{
  devices: Device[];
  connections: NetworkConnection[];
  selectedDevice: Device | null;
}> = ({ devices, connections, selectedDevice }) => {
  const devMap = useMemo(() => {
    const map = new Map<string, Device>();
    devices.forEach((d) => map.set(d.id, d));
    return map;
  }, [devices]);

  // Construct Three.js LineSegments object
  const lineSegmentsMesh = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const colors: number[] = [];

    connections.forEach((conn) => {
      const src = devMap.get(conn.source_id);
      const tgt = devMap.get(conn.target_id);
      if (!src || !tgt) return;

      const p1 = new THREE.Vector3(src.pos_x, src.pos_y, src.pos_z);
      const p2 = new THREE.Vector3(tgt.pos_x, tgt.pos_y, tgt.pos_z);
      points.push(p1, p2);

      const isHigh =
        selectedDevice &&
        (selectedDevice.id === conn.source_id || selectedDevice.id === conn.target_id);

      const c = new THREE.Color();
      if (conn.is_blocked) {
        c.set('#475569');
      } else if (src.state === 'INFECTED' || tgt.state === 'INFECTED') {
        c.set('#FF4B5C');
      } else if (src.state === 'EXPOSED' || tgt.state === 'EXPOSED') {
        c.set('#FFAA42');
      } else if (isHigh) {
        c.set('#21D4FD');
      } else {
        c.set('#1E40AF');
      }

      colors.push(c.r, c.g, c.b);
      colors.push(c.r, c.g, c.b);
    });

    const geom = new THREE.BufferGeometry().setFromPoints(points);
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });

    return new THREE.LineSegments(geom, mat);
  }, [connections, devMap, selectedDevice]);

  return <primitive object={lineSegmentsMesh} />;
};

export const NetworkCanvas3D: React.FC<NetworkCanvasProps> = ({
  devices,
  connections,
  selectedDevice,
  onSelectDevice,
  filterSegment,
  filterState,
  searchQuery,
}) => {
  const neighborIds = useMemo(() => {
    if (!selectedDevice) return new Set<string>();
    const neighbors = new Set<string>();
    connections.forEach((c) => {
      if (c.source_id === selectedDevice.id) neighbors.add(c.target_id);
      if (c.target_id === selectedDevice.id) neighbors.add(c.source_id);
    });
    return neighbors;
  }, [selectedDevice, connections]);

  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      if (filterSegment && filterSegment !== 'ALL' && d.segment !== filterSegment) {
        return false;
      }
      if (filterState && filterState !== 'ALL' && d.state !== filterState) {
        return false;
      }
      if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          d.id.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q) ||
          d.ip_address.includes(q)
        );
      }
      return true;
    });
  }, [devices, filterSegment, filterState, searchQuery]);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing bg-[#050B16]">
      <Canvas
        camera={{ position: [0, 45, 75], fov: 48, near: 0.1, far: 1000 }}
        onClick={() => onSelectDevice(null)}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[30, 50, 40]} intensity={1.2} />
        <pointLight position={[-40, -30, -30]} intensity={0.8} color="#21D4FD" />
        <pointLight position={[40, 30, 30]} intensity={0.8} color="#3478F6" />

        <ConnectionLines
          devices={devices}
          connections={connections}
          selectedDevice={selectedDevice}
        />

        {filteredDevices.map((dev) => (
          <NodeMesh
            key={dev.id}
            device={dev}
            isSelected={selectedDevice?.id === dev.id}
            isNeighbor={neighborIds.has(dev.id)}
            onClick={(d) => onSelectDevice(d)}
          />
        ))}

        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          minDistance={15}
          maxDistance={180}
          maxPolarAngle={Math.PI / 2 + 0.15}
        />
      </Canvas>
    </div>
  );
};
