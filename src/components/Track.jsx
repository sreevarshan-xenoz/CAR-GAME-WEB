import React, { useMemo } from 'react';
import * as THREE from 'three';

// Spline points for the track
const points = [
  [0, 0, 0],
  [20, 0, -40],
  [60, 0, -40],
  [80, 0, 0],
  [60, 0, 40],
  [20, 0, 40],
  [0, 0, 0],
].map((p) => new THREE.Vector3(...p));

export default function Track() {
  // Create a CatmullRomCurve3 spline
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5), []);

  // Extrude a shape along the spline to make the road
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const roadWidth = 4;
    shape.moveTo(-roadWidth, 0);
    shape.lineTo(roadWidth, 0);
    shape.lineTo(roadWidth, 1);
    shape.lineTo(-roadWidth, 1);
    shape.lineTo(-roadWidth, 0);
    const extrudeSettings = {
      steps: 200,
      bevelEnabled: false,
      extrudePath: curve,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [curve]);

  // Neon track material
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0ff', // Neon cyan
    roughness: 0.3,
    metalness: 0.8,
    emissive: '#00fff7',
    emissiveIntensity: 0.7,
    flatShading: true,
  }), []);

  // Neon border as a glowing line
  const borderPoints = useMemo(() => curve.getPoints(400), [curve]);
  const borderGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(borderPoints), [borderPoints]);

  // Ground: very dark for contrast
  const groundColor = '#0a0a16';

  return (
    <group>
      {/* Road mesh */}
      <mesh geometry={geometry} material={material} receiveShadow castShadow />
      {/* Neon border */}
      <line geometry={borderGeometry}>
        <lineBasicMaterial color="#00fff7" linewidth={4} />
      </line>
      {/* Ground plane */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[200, 0.2, 200]} />
        <meshStandardMaterial color={groundColor} flatShading />
      </mesh>
    </group>
  );
} 