import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

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
  const underglowRef = useRef();
  const { camera } = useThree();
  const input = useCarControls();

  // Car state
  const [position, setPosition] = useState(new THREE.Vector3(0, 0, 0));
  const [rotation, setRotation] = useState(0); // Yaw in radians
  const [speed, setSpeed] = useState(0);

  // Car parameters
  const maxSpeed = 40;
  const accel = 18;
  const brake = 30;
  const friction = 8;
  const steerSpeed = 2.5;
  const steerLimit = 1.2;

  useFrame((_, delta) => {
    // Steering
    let steer = 0;
    if (input.left) steer -= steerLimit;
    if (input.right) steer += steerLimit;
    // Only allow steering if moving
    let newRotation = rotation;
    if (Math.abs(speed) > 0.1) {
      newRotation += steer * steerSpeed * delta * (speed >= 0 ? 1 : -1);
    }
    setRotation(newRotation);

    // Acceleration/braking
    let spd = speed;
    if (input.accel) spd += accel * delta;
    if (input.brake) spd -= brake * delta;
    spd -= friction * delta * Math.sign(spd);
    if (Math.abs(spd) < 0.1) spd = 0;
    spd = Math.max(-maxSpeed / 2, Math.min(maxSpeed, spd));
    setSpeed(spd);

    // Move in the direction of rotation
    const forward = new THREE.Vector3(Math.sin(newRotation), 0, Math.cos(newRotation));
    const newPos = position.clone().add(forward.multiplyScalar(spd * delta));
    setPosition(newPos);

    // Update car mesh
    if (carRef.current) {
      carRef.current.position.copy(newPos);
      carRef.current.rotation.y = newRotation;
    }

    // Animate underglow
    if (underglowRef.current) {
      const t = performance.now() * 0.002;
      underglowRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 2) * 0.5;
    }

    // Camera follow
    camera.position.lerp(
      newPos.clone().add(new THREE.Vector3(0, 7, 14).applyAxisAngle(new THREE.Vector3(0, 1, 0), newRotation)),
      0.12
    );
    camera.lookAt(newPos);
  });

  // Low-poly neon car model with underglow
  return (
    <group ref={carRef}>
      {/* Underglow */}
      <mesh ref={underglowRef} position={[0, -0.45, 0]} scale={[2.2, 0.2, 4.2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#00fff7" emissive="#00fff7" emissiveIntensity={2} transparent opacity={0.5} />
      </mesh>
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