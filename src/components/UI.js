import React, { useState, useEffect } from 'react';

export default function UI() {
  const [speed, setSpeed] = useState(0);
  const [showMenu, setShowMenu] = useState(true);

  // Listen for custom event from Car to update speed
  useEffect(() => {
    function handleSpeed(e) {
      setSpeed(e.detail);
    }
    window.addEventListener('car-speed', handleSpeed);
    return () => window.removeEventListener('car-speed', handleSpeed);
  }, []);

  // Hide menu on start
  function startGame() {
    setShowMenu(false);
  }

  return (
    <div className="ui-overlay">
      {/* HUD */}
      <div className="ui-hud">
        <span>Speed: <b style={{ color: '#00fff7' }}>{Math.round(speed)}</b> km/h</span>
      </div>
      {/* Menu */}
      {showMenu && (
        <div className="ui-panel" style={{ marginTop: 120 }}>
          <div className="ui-title">RETRO CAR GAME</div>
          <button className="ui-btn" onClick={startGame}>Start</button>
          <div style={{ color: '#00fff7', marginTop: 16, fontSize: '1rem' }}>
            Controls: <br />
            <b>WASD / Arrows</b> to drive<br />
            <b>Hold Up/W</b> to accelerate<br />
            <b>Hold Down/S</b> to brake
          </div>
        </div>
      )}
    </div>
  );
} 