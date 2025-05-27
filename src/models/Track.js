import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Track {
  constructor(scene, physics, gltfLoader, textureLoader) {
    this.scene = scene;
    this.physics = physics;
    
    // Track properties
    this.checkpoints = [];
    
    // Create track
    this.createTrack(gltfLoader, textureLoader);
  }
  
  createTrack(gltfLoader, textureLoader) {
    // Create a temporary track (will be replaced with a proper model later)
    this.createTemporaryTrack();
    
    // Load track model (commented out until we have a model)
    /*
    gltfLoader.load(
      '/models/track.glb',
      (gltf) => {
        this.model = gltf.scene;
        this.model.scale.set(1, 1, 1);
        this.model.position.set(0, 0, 0);
        this.model.castShadow = true;
        this.model.receiveShadow = true;
        
        // Add to scene
        this.scene.add(this.model);
        
        // Create physics for track
        this.createTrackPhysics();
        
        // Create checkpoints
        this.createCheckpoints();
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('An error happened while loading the track model:', error);
        // Fallback to temporary track if loading fails
        this.createTemporaryTrack();
      }
    );
    */
  }
  
  createTemporaryTrack() {
    // Create a group to hold all track parts
    this.model = new THREE.Group();
    
    // Create ground
    this.createGround();
    
    // Create track
    this.createTrackMesh();
    
    // Create track physics
    this.createTrackPhysics();
    
    // Create checkpoints
    this.createCheckpoints();
    
    // Add to scene
    this.scene.add(this.model);
  }
  
  createGround() {
    // Create ground plane
    const groundSize = 1000;
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a5e1a,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.receiveShadow = true;
    this.model.add(ground);
    
    // Create ground physics
    const groundBody = this.physics.createGroundBody(
      { x: groundSize, y: 1, z: groundSize },
      { x: 0, y: 0, z: 0 },
      { x: -Math.PI / 2, y: 0, z: 0 }
    );
  }
  
  createTrackMesh() {
    // Create a simple oval track
    const trackWidth = 10;
    const trackLength = 100;
    const trackHeight = 0.1;
    
    // Create track material
    const trackMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.9,
      metalness: 0.1
    });
    
    // Create track geometry
    const trackShape = new THREE.Shape();
    
    // Define track path (oval)
    const centerX = 0;
    const centerZ = 0;
    const radiusX = trackLength / 2;
    const radiusZ = trackLength / 3;
    
    // Start at the top of the oval
    trackShape.moveTo(centerX, centerZ - radiusZ);
    
    // Draw the oval
    trackShape.ellipse(centerX, centerZ, radiusX, radiusZ, 0, Math.PI * 2, false);
    
    // Create the track mesh
    const trackGeometry = new THREE.ShapeGeometry(trackShape);
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    track.position.y = trackHeight / 2;
    track.receiveShadow = true;
    this.model.add(track);
    
    // Create track border
    this.createTrackBorder(trackShape, trackWidth, trackHeight);
    
    // Create track markings
    this.createTrackMarkings(trackShape, trackWidth, trackHeight);
  }
  
  createTrackBorder(trackShape, trackWidth, trackHeight) {
    // Create track border material
    const borderMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.7,
      metalness: 0.2
    });
    
    // Create track border geometry
    const borderGeometry = new THREE.EdgesGeometry(
      new THREE.ExtrudeGeometry(trackShape, {
        depth: trackHeight,
        bevelEnabled: false
      })
    );
    
    // Create track border mesh
    const border = new THREE.LineSegments(borderGeometry, new THREE.LineBasicMaterial({ color: 0xffffff }));
    border.position.y = trackHeight;
    this.model.add(border);
  }
  
  createTrackMarkings(trackShape, trackWidth, trackHeight) {
    // Create track markings material
    const markingsMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.7,
      metalness: 0.2
    });
    
    // Create start/finish line
    const startLineGeometry = new THREE.PlaneGeometry(trackWidth, 2);
    const startLine = new THREE.Mesh(startLineGeometry, markingsMaterial);
    startLine.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    startLine.position.set(0, trackHeight + 0.01, -trackLength / 3); // Position at the top of the oval
    this.model.add(startLine);
    
    // Create lane markings
    const laneMarkingGeometry = new THREE.PlaneGeometry(0.5, trackLength * 2);
    const laneMarking = new THREE.Mesh(laneMarkingGeometry, markingsMaterial);
    laneMarking.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    laneMarking.position.set(0, trackHeight + 0.01, 0);
    this.model.add(laneMarking);
  }
  
  createTrackPhysics() {
    // Create physics for track (simple ground plane)
    // The ground physics is already created in createGround()
    
    // Create obstacles
    this.createObstacles();
  }
  
  createObstacles() {
    // Create some obstacles on the track
    const obstaclePositions = [
      { x: 20, y: 1, z: 0 },
      { x: -20, y: 1, z: 0 },
      { x: 0, y: 1, z: 20 },
      { x: 0, y: 1, z: -20 }
    ];
    
    for (const position of obstaclePositions) {
      // Create obstacle mesh
      const obstacleGeometry = new THREE.BoxGeometry(2, 2, 2);
      const obstacleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff0000,
        roughness: 0.7,
        metalness: 0.3
      });
      const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
      obstacle.position.set(position.x, position.y, position.z);
      obstacle.castShadow = true;
      obstacle.receiveShadow = true;
      this.model.add(obstacle);
      
      // Create obstacle physics
      const obstacleBody = this.physics.createBoxBody(
        { x: 2, y: 2, z: 2 },
        position,
        { x: 0, y: 0, z: 0 },
        10 // Mass
      );
    }
  }
  
  createCheckpoints() {
    // Create checkpoints around the track
    const checkpointPositions = [
      { x: 0, y: 1, z: -trackLength / 3 }, // Start/finish line
      { x: trackLength / 2, y: 1, z: 0 },  // Right side
      { x: 0, y: 1, z: trackLength / 3 },  // Bottom
      { x: -trackLength / 2, y: 1, z: 0 }  // Left side
    ];
    
    // Create checkpoint markers
    for (let i = 0; i < checkpointPositions.length; i++) {
      const position = checkpointPositions[i];
      
      // Create checkpoint mesh
      const checkpointGeometry = new THREE.CylinderGeometry(1, 1, 0.1, 16);
      const checkpointMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00ff00,
        transparent: true,
        opacity: 0.5,
        emissive: 0x00ff00,
        emissiveIntensity: 0.5
      });
      const checkpoint = new THREE.Mesh(checkpointGeometry, checkpointMaterial);
      checkpoint.position.set(position.x, position.y, position.z);
      checkpoint.rotation.x = Math.PI / 2; // Rotate to be horizontal
      this.model.add(checkpoint);
      
      // Add to checkpoints array
      this.checkpoints.push({
        position: new THREE.Vector3(position.x, position.y, position.z),
        index: i
      });
    }
    
    // Set checkpoints in game state
    if (window.game && window.game.gameState) {
      window.game.gameState.setCheckpoints(this.checkpoints);
    }
  }
  
  getCheckpoints() {
    return this.checkpoints;
  }
} 