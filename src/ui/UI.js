export class UI {
  constructor(gameState) {
    this.gameState = gameState;
    
    // UI elements
    this.scoreElement = document.getElementById('score');
    this.speedElement = document.getElementById('speed');
    this.timerElement = document.getElementById('timer');
    
    // Initialize UI
    this.updateUI();
  }
  
  updateUI() {
    // Update score
    if (this.scoreElement) {
      this.scoreElement.textContent = this.gameState.score;
    }
    
    // Update timer
    if (this.timerElement) {
      this.timerElement.textContent = this.gameState.getTotalTime();
    }
    
    // Update speed (this will be updated by the car)
    // The speed is updated separately in the Car class
    
    // Update menu visibility based on game state
    this.updateMenuVisibility();
  }
  
  updateMenuVisibility() {
    const gameMenu = document.getElementById('game-menu');
    const pauseMenu = document.getElementById('pause-menu');
    const restartButton = document.getElementById('restart-button');
    
    if (this.gameState.isPlaying) {
      // Game is playing, hide all menus
      if (gameMenu) gameMenu.classList.add('hidden');
      if (pauseMenu) pauseMenu.classList.add('hidden');
    } else if (this.gameState.isPaused) {
      // Game is paused, show pause menu
      if (gameMenu) gameMenu.classList.add('hidden');
      if (pauseMenu) pauseMenu.classList.remove('hidden');
    } else if (this.gameState.isGameOver) {
      // Game is over, show game menu with restart button
      if (gameMenu) gameMenu.classList.remove('hidden');
      if (pauseMenu) pauseMenu.classList.add('hidden');
      if (restartButton) restartButton.classList.remove('hidden');
    } else {
      // Game is in menu state, show game menu
      if (gameMenu) gameMenu.classList.remove('hidden');
      if (pauseMenu) pauseMenu.classList.add('hidden');
    }
  }
  
  updateSpeed(speed) {
    if (this.speedElement) {
      this.speedElement.textContent = Math.round(speed);
    }
  }
  
  showMessage(message, duration = 3000) {
    // Create message element if it doesn't exist
    let messageElement = document.getElementById('game-message');
    
    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.id = 'game-message';
      messageElement.style.position = 'absolute';
      messageElement.style.top = '50%';
      messageElement.style.left = '50%';
      messageElement.style.transform = 'translate(-50%, -50%)';
      messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      messageElement.style.color = 'white';
      messageElement.style.padding = '20px';
      messageElement.style.borderRadius = '10px';
      messageElement.style.fontSize = '24px';
      messageElement.style.fontWeight = 'bold';
      messageElement.style.textAlign = 'center';
      messageElement.style.zIndex = '100';
      messageElement.style.pointerEvents = 'none';
      messageElement.style.transition = 'opacity 0.5s ease';
      document.getElementById('ui-overlay').appendChild(messageElement);
    }
    
    // Set message text
    messageElement.textContent = message;
    messageElement.style.opacity = '1';
    
    // Hide message after duration
    setTimeout(() => {
      messageElement.style.opacity = '0';
    }, duration);
  }
  
  showLapTime(lapNumber, lapTime, isBestLap = false) {
    const message = isBestLap 
      ? `Lap ${lapNumber}: ${lapTime} (Best Lap!)` 
      : `Lap ${lapNumber}: ${lapTime}`;
    
    this.showMessage(message, 3000);
  }
  
  showCheckpoint(checkpointNumber, totalCheckpoints) {
    this.showMessage(`Checkpoint ${checkpointNumber}/${totalCheckpoints}`, 1500);
  }
} 