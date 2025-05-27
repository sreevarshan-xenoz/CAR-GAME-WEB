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

  // Track material
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#222',
    roughness: 0.7,
    metalness: 0.1,
    flatShading: true,
  }), []);

  // Draw the spline as a line for debugging
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(200));
    return geo;
  }, [curve]);

  return (
    <group>
      {/* Road mesh */}
      <mesh geometry={geometry} material={material} receiveShadow castShadow />
      {/* Spline line (for debug) */}
      {/* <line geometry={lineGeometry}>
        <lineBasicMaterial color="#00ffe7" linewidth={2} />
      </line> */}
      {/* Ground plane */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[200, 0.2, 200]} />
        <meshStandardMaterial color="#1a5e1a" flatShading />
      </mesh>
    </group>
  );
} 