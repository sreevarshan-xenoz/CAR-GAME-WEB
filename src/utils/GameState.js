export class GameState {
  constructor() {
    // Game status
    this.isPlaying = false;
    this.isPaused = false;
    this.isGameOver = false;
    
    // Game metrics
    this.score = 0;
    this.time = 0;
    this.lapCount = 0;
    this.bestLapTime = Infinity;
    this.currentLapTime = 0;
    
    // Checkpoints
    this.checkpoints = [];
    this.currentCheckpoint = 0;
    this.lapStarted = false;
  }
  
  startGame() {
    this.isPlaying = true;
    this.isPaused = false;
    this.isGameOver = false;
    this.time = 0;
    this.currentLapTime = 0;
    this.lapCount = 0;
    this.score = 0;
    this.currentCheckpoint = 0;
    this.lapStarted = false;
  }
  
  restartGame() {
    this.startGame();
  }
  
  pauseGame() {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.isPaused = true;
    }
  }
  
  resumeGame() {
    if (this.isPaused) {
      this.isPlaying = true;
      this.isPaused = false;
    }
  }
  
  quitToMenu() {
    this.isPlaying = false;
    this.isPaused = false;
    this.isGameOver = false;
  }
  
  gameOver() {
    this.isPlaying = false;
    this.isGameOver = true;
  }
  
  update(delta, car) {
    if (this.isPlaying) {
      // Update time
      this.time += delta;
      this.currentLapTime += delta;
      
      // Update score based on speed and time
      if (car) {
        const speed = car.getSpeed();
        this.score += Math.floor(speed * delta * 0.1);
      }
      
      // Check for lap completion
      this.checkLapCompletion(car);
    }
  }
  
  setCheckpoints(checkpoints) {
    this.checkpoints = checkpoints;
  }
  
  checkLapCompletion(car) {
    if (!car || !this.checkpoints.length) return;
    
    const carPosition = car.model.position;
    
    // Check if car is near the start/finish line (first checkpoint)
    const startCheckpoint = this.checkpoints[0];
    const distanceToStart = carPosition.distanceTo(startCheckpoint.position);
    
    // If car is near the start line and we've passed all checkpoints, complete the lap
    if (distanceToStart < 5 && this.currentCheckpoint === this.checkpoints.length - 1) {
      // Complete lap
      this.lapCount++;
      
      // Update best lap time
      if (this.currentLapTime < this.bestLapTime) {
        this.bestLapTime = this.currentLapTime;
      }
      
      // Reset lap time
      this.currentLapTime = 0;
      this.currentCheckpoint = 0;
      this.lapStarted = true;
      
      // Add bonus score for completing a lap
      this.score += 1000;
    }
    
    // Check if car has passed the next checkpoint
    if (this.currentCheckpoint < this.checkpoints.length - 1) {
      const nextCheckpoint = this.checkpoints[this.currentCheckpoint + 1];
      const distanceToNext = carPosition.distanceTo(nextCheckpoint.position);
      
      if (distanceToNext < 5) {
        this.currentCheckpoint++;
        
        // Add score for passing a checkpoint
        this.score += 100;
      }
    }
  }
  
  getFormattedTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  getTotalTime() {
    return this.getFormattedTime(this.time);
  }
  
  getCurrentLapTime() {
    return this.getFormattedTime(this.currentLapTime);
  }
  
  getBestLapTime() {
    return this.bestLapTime === Infinity ? '--:--' : this.getFormattedTime(this.bestLapTime);
  }
} 