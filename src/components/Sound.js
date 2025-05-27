import useSound from 'use-sound';
import music from '../assets/synthwave-loop.mp3';
import { useEffect } from 'react';

export default function Sound() {
  const [play, { stop }] = useSound(music, { volume: 0.5, loop: true });

  useEffect(() => {
    play();
    return () => stop();
  }, [play, stop]);

  return null;
} 