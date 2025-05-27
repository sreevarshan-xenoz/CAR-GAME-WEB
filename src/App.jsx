import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Environment } from '@react-three/drei';
import Track from './components/Track.jsx';
import Car from './components/Car';
import Effects from './components/Effects';
import UI from './components/UI';
import Sound from './components/Sound';

export default function App() {
  return (
    <>
      <Canvas shadows dpr={[1, 2]} style={{ height: '100vh', width: '100vw' }}>
        <PerspectiveCamera makeDefault position={[0, 10, 20]} fov={60} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <Environment preset="sunset" />
        <Track />
        <Car />
        <Effects />
        <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2.2} />
      </Canvas>
      <UI />
      <Sound />
    </>
  );
} 