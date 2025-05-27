import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export default function Road() {
  // Neon grid texture for the road
  const gridTexture = useMemo(() => {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#181a20';
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = '#00fff7';
    ctx.lineWidth = 2;
    for (let i = 0; i < size; i += size / 12) {
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

  // Neon glowing edge
  const borderRef = useRef();
  useFrame(({ clock }) => {
    if (borderRef.current) {
      const t = clock.getElapsedTime();
      borderRef.current.material.color.setHSL(0.55 + 0.15 * Math.sin(t * 2), 1, 0.6);
      borderRef.current.material.emissive = new THREE.Color('#00fff7');
      borderRef.current.material.emissiveIntensity = 0.7 + 0.3 * Math.sin(t * 2);
    }
  });

  // Road dimensions
  const roadWidth = 12;
  const roadLength = 300;

  // Border geometry (rectangle outline)
  const borderPoints = useMemo(() => [
    [-roadWidth / 2, 0.01, -roadLength / 2],
    [roadWidth / 2, 0.01, -roadLength / 2],
    [roadWidth / 2, 0.01, roadLength / 2],
    [-roadWidth / 2, 0.01, roadLength / 2],
    [-roadWidth / 2, 0.01, -roadLength / 2],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z)), []);
  const borderGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(borderPoints), [borderPoints]);

  return (
    <group>
      {/* Road mesh with neon grid */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[roadWidth, 0.1, roadLength]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Neon glowing border */}
      <line ref={borderRef} geometry={borderGeometry}>
        <lineBasicMaterial color="#00fff7" linewidth={4} />
      </line>
    </group>
  );
} 