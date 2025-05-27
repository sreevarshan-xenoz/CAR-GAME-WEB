import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

// Spline points for the track (should match Track.jsx)
const points = [
  [0, 0, 0],
  [20, 0, -40],
  [60, 0, -40],
  [80, 0, 0],
  [60, 0, 40],
  [20, 0, 40],
  [0, 0, 0],
].map((p) => new THREE.Vector3(...p));
const curve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5);
const curveLength = curve.getLength();

// Keyboard input hook
function useCarControls() {
  const [input, setInput] = useState({ left: false, right: false, accel: false, brake: false });
  useEffect(() => {
    const down = (e) => {
      if (e.repeat) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') setInput((i) => ({ ...i, left: true }));
      if (e.key === 'ArrowRight' || e.key === 'd') setInput((i) => ({ ...i, right: true }));
      if (e.key === 'ArrowUp' || e.key === 'w') setInput((i) => ({ ...i, accel: true }));
      if (e.key === 'ArrowDown' || e.key === 's') setInput((i) => ({ ...i, brake: true }));
    };
    const up = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') setInput((i) => ({ ...i, left: false }));
      if (e.key === 'ArrowRight' || e.key === 'd') setInput((i) => ({ ...i, right: false }));
      if (e.key === 'ArrowUp' || e.key === 'w') setInput((i) => ({ ...i, accel: false }));
      if (e.key === 'ArrowDown' || e.key === 's') setInput((i) => ({ ...i, brake: false }));
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);
  return input;
}

export default function Car() {
  const carRef = useRef();
  const { camera } = useThree();
  const input = useCarControls();

  // Car state
  const [u, setU] = useState(0); // position along the spline (0-1)
  const [speed, setSpeed] = useState(0); // units per second
  const [steer, setSteer] = useState(0); // -1 (left) to 1 (right)

  // Car parameters
  const maxSpeed = 40;
  const accel = 18;
  const brake = 30;
  const friction = 8;
  const steerSpeed = 2.5;
  const steerLimit = 0.6;

  useFrame((_, delta) => {
    // Steering
    let steerTarget = 0;
    if (input.left) steerTarget -= steerLimit;
    if (input.right) steerTarget += steerLimit;
    setSteer((s) => THREE.MathUtils.lerp(s, steerTarget, steerSpeed * delta));

    // Acceleration/braking
    let spd = speed;
    if (input.accel) spd += accel * delta;
    if (input.brake) spd -= brake * delta;
    spd -= friction * delta; // friction
    spd = Math.max(0, Math.min(maxSpeed, spd));
    setSpeed(spd);

    // Move along the spline
    let nextU = u + (spd / curveLength) * delta;
    if (nextU > 1) nextU -= 1;
    setU(nextU);

    // Get position and tangent from spline
    const pos = curve.getPointAt(nextU);
    const tangent = curve.getTangentAt(nextU);
    const normal = new THREE.Vector3(0, 1, 0);
    const binormal = new THREE.Vector3().crossVectors(normal, tangent).normalize();

    // Offset car left/right from center of track
    const offset = binormal.multiplyScalar(steer * 2.5);
    const carPos = pos.clone().add(offset);
    if (carRef.current) {
      carRef.current.position.copy(carPos);
      // Orient car in direction of tangent
      const lookAt = pos.clone().add(tangent);
      carRef.current.lookAt(lookAt);
    }

    // Camera follow
    camera.position.lerp(
      carPos.clone().add(new THREE.Vector3(0, 7, 14)),
      0.12
    );
    camera.lookAt(carPos);
  });

  // Low-poly neon car model
  return (
    <group ref={carRef}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[2, 0.7, 4]} />
        <meshStandardMaterial color="#ff00ea" emissive="#ff00ea" emissiveIntensity={1.2} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.6, -0.5]} castShadow>
        <boxGeometry args={[1.2, 0.6, 1.7]} />
        <meshStandardMaterial color="#00fff7" emissive="#00fff7" emissiveIntensity={0.7} metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Wheels */}
      {[[-0.8, -0.4, 1.4], [0.8, -0.4, 1.4], [-0.8, -0.4, -1.4], [0.8, -0.4, -1.4]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <cylinderGeometry args={[0.38, 0.38, 0.4, 12]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} />
          <meshStandardMaterial attach="material-1" color="#00fff7" emissive="#00fff7" emissiveIntensity={1.5} />
        </mesh>
      ))}
      {/* Headlights */}
      <mesh position={[-0.6, 0.2, 2.1]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#fff" emissive="#00fff7" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.6, 0.2, 2.1]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#fff" emissive="#00fff7" emissiveIntensity={2} />
      </mesh>
    </group>
  );
} 