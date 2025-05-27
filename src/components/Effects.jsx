import { EffectComposer, Bloom } from '@react-three/postprocessing';

export default function Effects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.5} // strong glow
        luminanceThreshold={0.1}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  );
} 