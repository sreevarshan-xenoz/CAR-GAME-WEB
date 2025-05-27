import React, { useMemo } from 'react';
import * as THREE from 'three';

const ROAD_WIDTH = 12;
const ROAD_LENGTH = 300;
const BUILDING_COLORS = ['#00fff7', '#ff00ea', '#fff200', '#00ff85', '#ff5c5c'];

export default function Buildings() {
  // Generate building positions and sizes
  const buildings = useMemo(() => {
    const arr = [];
    for (let i = -ROAD_LENGTH / 2 + 10; i < ROAD_LENGTH / 2 - 10; i += 8) {
      // Left side
      arr.push({
        x: -ROAD_WIDTH / 2 - 3,
        z: i + Math.random() * 2,
        w: 3 + Math.random() * 2,
        h: 6 + Math.random() * 10,
        d: 3 + Math.random() * 2,
        color: BUILDING_COLORS[Math.floor(Math.random() * BUILDING_COLORS.length)]
      });
      // Right side
      arr.push({
        x: ROAD_WIDTH / 2 + 3,
        z: i + Math.random() * 2,
        w: 3 + Math.random() * 2,
        h: 6 + Math.random() * 10,
        d: 3 + Math.random() * 2,
        color: BUILDING_COLORS[Math.floor(Math.random() * BUILDING_COLORS.length)]
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]} castShadow receiveShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={0.7} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
} 