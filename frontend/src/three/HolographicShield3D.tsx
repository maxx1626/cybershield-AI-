import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const ShieldCore: React.FC = () => {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const midRingRef = useRef<THREE.Mesh>(null);
  const innerShieldRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Rotation animation
  useFrame((_, delta) => {
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.4;
      outerRingRef.current.rotation.x += delta * 0.2;
    }
    if (midRingRef.current) {
      midRingRef.current.rotation.z -= delta * 0.6;
      midRingRef.current.rotation.y += delta * 0.3;
    }
    if (innerShieldRef.current) {
      innerShieldRef.current.rotation.y += delta * 0.8;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.15;
    }
  });

  // Particle positions
  const particleCount = 120;
  const particlePositions = React.useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  return (
    <group>
      {/* Outer Cyan Ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[2.4, 0.04, 16, 64]} />
        <meshBasicMaterial color="#21D4FD" wireframe opacity={0.7} transparent />
      </mesh>

      {/* Middle Electric Blue Ring */}
      <mesh ref={midRingRef}>
        <torusGeometry args={[1.8, 0.05, 16, 48]} />
        <meshBasicMaterial color="#3478F6" wireframe opacity={0.8} transparent />
      </mesh>

      {/* Central Holographic Security Octahedron / Shield */}
      <mesh ref={innerShieldRef}>
        <octahedronGeometry args={[1.1, 1]} />
        <meshStandardMaterial
          color="#21D4FD"
          emissive="#0055ff"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
          wireframe
        />
      </mesh>

      {/* Inner Glowing Core */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#21D4FD" transparent opacity={0.6} />
      </mesh>

      {/* Floating Orbital Security Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#21D4FD" transparent opacity={0.75} />
      </points>
    </group>
  );
};

export const HolographicShield3D: React.FC<{ height?: string }> = ({ height = '350px' }) => {
  return (
    <div style={{ width: '100%', height }} className="relative">
      <Canvas camera={{ position: [0, 0, 6.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#21D4FD" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#3478F6" />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
          <ShieldCore />
        </Float>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  );
};

