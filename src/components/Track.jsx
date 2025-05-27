import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

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

  // Neon grid texture for the road
  const gridTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0a16';
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = '#00fff7';
    ctx.lineWidth = 2;
    for (let i = 0; i < size; i += size / 8) {
      ctx.beginPath();
      ctx.moveTo(i, 0); ctx.lineTo(i, size);
      ctx.moveTo(0, i); ctx.lineTo(size, i);
      ctx.stroke();
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Road material with neon grid
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#181a20',
    roughness: 0.4,
    metalness: 0.7,
    emissive: '#0ff',
    emissiveIntensity: 0.12,
    flatShading: true,
    map: gridTexture,
  }), [gridTexture]);

  // Neon border as a glowing, pulsing line
  const borderPoints = useMemo(() => curve.getPoints(400), [curve]);
  const borderGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(borderPoints), [borderPoints]);
  const borderRef = React.useRef();
  useFrame(({ clock }) => {
    if (borderRef.current) {
      const t = clock.getElapsedTime();
      borderRef.current.material.color.setHSL(0.55 + 0.15 * Math.sin(t * 2), 1, 0.6);
      borderRef.current.material.emissive = new THREE.Color('#00fff7');
      borderRef.current.material.emissiveIntensity = 0.7 + 0.3 * Math.sin(t * 2);
    }
  });

  // Ground: very dark for contrast
  const groundColor = '#0a0a16';

  return (
    <group>
      {/* Road mesh with neon grid */}
      <mesh geometry={geometry} material={material} receiveShadow castShadow />
      {/* Neon pulsing border */}
      <line ref={borderRef} geometry={borderGeometry}>
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