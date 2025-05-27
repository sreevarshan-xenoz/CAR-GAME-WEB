export class InputHandler {
  constructor() {
    // Input state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: false,
      reset: false
    };
    
    // Key mappings
    this.keyMap = {
      // WASD keys
      'w': 'forward',
      's': 'backward',
      'a': 'left',
      'd': 'right',
      // Arrow keys
      'arrowup': 'forward',
      'arrowdown': 'backward',
      'arrowleft': 'left',
      'arrowright': 'right',
      // Other controls
      ' ': 'brake', // Space bar
      'r': 'reset'  // R key
    };
    
    // Add event listeners
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Key down event
    document.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      const action = this.keyMap[key];
      
      if (action) {
        this.keys[action] = true;
        event.preventDefault(); // Prevent default behavior for game controls
      }
    });
    
    // Key up event
    document.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase();
      const action = this.keyMap[key];
      
      if (action) {
        this.keys[action] = false;
      }
    });
    
    // Handle window blur (pause game when window loses focus)
    window.addEventListener('blur', () => {
      // Reset all keys when window loses focus
      Object.keys(this.keys).forEach(key => {
        this.keys[key] = false;
      });
    });
  }
  
  // Get the current input state
  getInputState() {
    return { ...this.keys };
  }
  
  // Check if a specific key is pressed
  isKeyPressed(key) {
    return this.keys[key] || false;
  }
  
  // Reset all keys
  resetKeys() {
    Object.keys(this.keys).forEach(key => {
      this.keys[key] = false;
    });
  }
} 