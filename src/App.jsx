import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Environment } from '@react-three/drei';
// import Track from './components/Track.jsx';
import Road from './components/Road.jsx';
import Buildings from './components/Buildings.jsx';
import Car from './components/Car.jsx';
import Effects from './components/Effects.jsx';
import UI from './components/UI.jsx';
import Sound from './components/Sound';

export default function App() {
  return (
    <>
      <Canvas shadows dpr={[1, 2]} style={{ height: '100vh', width: '100vw' }}>
        <PerspectiveCamera makeDefault position={[0, 14, 28]} fov={60} />
        {/* Neon blue ambient */}
        <ambientLight intensity={0.7} color="#00fff7" />
        {/* Neon cyan main light */}
        <directionalLight position={[10, 20, 10]} intensity={1.5} color="#00fff7" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        {/* Magenta fill light for retro vibe */}
        <directionalLight position={[-20, 10, -10]} intensity={0.7} color="#ff00ea" />
        <Environment preset="sunset" />
        <Buildings />
        <Road />
        {/* <Track /> */}
        <Car />
        <Effects />
        <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2.2} />
      </Canvas>
      <UI />
      <Sound />
    </>
  );
} 