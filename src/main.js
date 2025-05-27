import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es';

import { Car } from './models/Car.js';
import { Track } from './models/Track.js';
import { Physics } from './physics/Physics.js';
import { InputHandler } from './utils/InputHandler.js';
import { UI } from './ui/UI.js';
import { GameState } from './utils/GameState.js';

class Game {
  constructor() {
    // Game state
    this.gameState = new GameState();
    
    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    document.getElementById('game-container').appendChild(this.renderer.domElement);
    
    // Setup scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.002);
    
    // Setup camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 5, 10);
    
    // Setup controls for development (will be replaced by car camera)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enabled = false; // Disabled by default, will be enabled in debug mode
    
    // Setup physics
    this.physics = new Physics();
    
    // Setup input handler
    this.inputHandler = new InputHandler();
    
    // Setup UI
    this.ui = new UI(this.gameState);
    
    // Setup lighting
    this.setupLighting();
    
    // Load assets
    this.loadAssets();
    
    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Start game loop
    this.clock = new THREE.Clock();
    this.animate();
  }
  
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    
    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    
    this.scene.add(directionalLight);
    
    // Add hemisphere light for more natural outdoor lighting
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    this.scene.add(hemisphereLight);
  }
  
  loadAssets() {
    const loadingManager = new THREE.LoadingManager();
    const gltfLoader = new GLTFLoader(loadingManager);
    const textureLoader = new THREE.TextureLoader(loadingManager);
    
    // Update loading progress
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100;
      document.querySelector('.progress').style.width = `${progress}%`;
      document.querySelector('.loading-text').textContent = `Loading... ${Math.round(progress)}%`;
    };
    
    // When loading is complete
    loadingManager.onLoad = () => {
      // Hide loading screen
      document.getElementById('loading-screen').classList.add('hidden');
      
      // Show game menu
      document.getElementById('game-menu').classList.remove('hidden');
      
      // Initialize game objects
      this.initGame();
    };
    
    // Load track
    this.track = new Track(this.scene, this.physics, gltfLoader, textureLoader);
    
    // Load car
    this.car = new Car(this.scene, this.physics, gltfLoader, textureLoader);
  }
  
  initGame() {
    // Add event listeners for UI buttons
    document.getElementById('start-button').addEventListener('click', () => {
      this.startGame();
    });
    
    document.getElementById('restart-button').addEventListener('click', () => {
      this.restartGame();
    });
    
    document.getElementById('resume-button').addEventListener('click', () => {
      this.resumeGame();
    });
    
    document.getElementById('quit-button').addEventListener('click', () => {
      this.quitToMenu();
    });
    
    // Add keyboard event listeners
    document.addEventListener('keydown', (event) => {
      if (event.key === 'p' || event.key === 'P') {
        if (this.gameState.isPlaying) {
          this.pauseGame();
        } else if (this.gameState.isPaused) {
          this.resumeGame();
        }
      }
    });
  }
  
  startGame() {
    this.gameState.startGame();
    document.getElementById('game-menu').classList.add('hidden');
    this.ui.updateUI();
  }
  
  restartGame() {
    this.gameState.restartGame();
    this.car.reset();
    document.getElementById('game-menu').classList.add('hidden');
    this.ui.updateUI();
  }
  
  pauseGame() {
    this.gameState.pauseGame();
    document.getElementById('pause-menu').classList.remove('hidden');
    this.ui.updateUI();
  }
  
  resumeGame() {
    this.gameState.resumeGame();
    document.getElementById('pause-menu').classList.add('hidden');
    this.ui.updateUI();
  }
  
  quitToMenu() {
    this.gameState.quitToMenu();
    document.getElementById('pause-menu').classList.add('hidden');
    document.getElementById('game-menu').classList.remove('hidden');
    document.getElementById('restart-button').classList.remove('hidden');
    this.ui.updateUI();
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  update() {
    const delta = this.clock.getDelta();
    
    // Update physics
    this.physics.update(delta);
    
    // Update car
    if (this.gameState.isPlaying) {
      this.car.update(delta, this.inputHandler);
      
      // Update game state (score, time, etc.)
      this.gameState.update(delta, this.car);
      
      // Update UI
      this.ui.updateUI();
    }
    
    // Update camera to follow car
    if (this.car && this.car.model) {
      this.updateCamera();
    }
  }
  
  updateCamera() {
    // Get car position and rotation
    const carPosition = this.car.model.position.clone();
    const carRotation = this.car.model.rotation.y;
    
    // Calculate camera position behind the car
    const cameraOffset = new THREE.Vector3(
      -Math.sin(carRotation) * 8,
      3,
      -Math.cos(carRotation) * 8
    );
    
    // Set camera position
    this.camera.position.copy(carPosition).add(cameraOffset);
    
    // Look at the car
    this.camera.lookAt(
      carPosition.x,
      carPosition.y + 1,
      carPosition.z
    );
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    // Update game
    this.update();
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new Game();
}); 