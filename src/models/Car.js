import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Car {
  constructor(scene, physics, gltfLoader, textureLoader) {
    this.scene = scene;
    this.physics = physics;
    
    // Car properties
    this.maxSpeed = 100; // km/h
    this.acceleration = 10;
    this.deceleration = 5;
    this.brakeForce = 20;
    this.steeringSpeed = 2;
    this.maxSteeringAngle = Math.PI / 4; // 45 degrees
    
    // Current state
    this.speed = 0;
    this.steeringAngle = 0;
    this.engineForce = 0;
    this.brakeForce = 0;
    
    // Create car model
    this.createCarModel(gltfLoader, textureLoader);
    
    // Create car physics
    this.createCarPhysics();
  }
  
  createCarModel(gltfLoader, textureLoader) {
    // Create a temporary car model (will be replaced with a proper model later)
    this.createTemporaryCarModel();
    
    // Load car model (commented out until we have a model)
    /*
    gltfLoader.load(
      '/models/car.glb',
      (gltf) => {
        this.model = gltf.scene;
        this.model.scale.set(1, 1, 1);
        this.model.position.set(0, 0.5, 0);
        this.model.castShadow = true;
        this.model.receiveShadow = true;
        
        // Add to scene
        this.scene.add(this.model);
        
        // Store wheel meshes for animation
        this.wheelMeshes = [];
        this.model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Check if this is a wheel mesh
            if (child.name.includes('wheel')) {
              this.wheelMeshes.push(child);
            }
          }
        });
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('An error happened while loading the car model:', error);
        // Fallback to temporary model if loading fails
        this.createTemporaryCarModel();
      }
    );
    */
  }
  
  createTemporaryCarModel() {
    // Create a group to hold all car parts
    this.model = new THREE.Group();
    
    // Create car body
    const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3366ff });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    body.receiveShadow = true;
    this.model.add(body);
    
    // Create car cabin
    const cabinGeometry = new THREE.BoxGeometry(1.5, 0.5, 2);
    const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 1, -0.5);
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    this.model.add(cabin);
    
    // Create wheels
    this.wheelMeshes = [];
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    // Wheel positions
    const wheelPositions = [
      { x: -1, y: 0.4, z: -1.2 }, // Front left
      { x: 1, y: 0.4, z: -1.2 },  // Front right
      { x: -1, y: 0.4, z: 1.2 },  // Rear left
      { x: 1, y: 0.4, z: 1.2 }    // Rear right
    ];
    
    // Create wheels
    for (const position of wheelPositions) {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(position.x, position.y, position.z);
      wheel.rotation.z = Math.PI / 2; // Rotate to correct orientation
      wheel.castShadow = true;
      wheel.receiveShadow = true;
      this.model.add(wheel);
      this.wheelMeshes.push(wheel);
    }
    
    // Add headlights
    const headlightGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const headlightMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffcc,
      emissive: 0xffffcc,
      emissiveIntensity: 0.5
    });
    
    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-0.7, 0.5, -2);
    this.model.add(leftHeadlight);
    
    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.position.set(0.7, 0.5, -2);
    this.model.add(rightHeadlight);
    
    // Add headlight lights
    const leftLight = new THREE.PointLight(0xffffcc, 1, 20);
    leftLight.position.set(-0.7, 0.5, -2.2);
    this.model.add(leftLight);
    
    const rightLight = new THREE.PointLight(0xffffcc, 1, 20);
    rightLight.position.set(0.7, 0.5, -2.2);
    this.model.add(rightLight);
    
    // Add to scene
    this.scene.add(this.model);
  }
  
  createCarPhysics() {
    // Create car physics body
    const chassisSize = { x: 2, y: 0.5, z: 4 };
    const wheelRadius = 0.4;
    const wheelHeight = 0.3;
    const position = { x: 0, y: 1, z: 0 };
    const rotation = { x: 0, y: 0, z: 0 };
    
    // Create vehicle physics
    this.vehicle = this.physics.createVehicleBody(
      chassisSize,
      wheelRadius,
      wheelHeight,
      position,
      rotation
    );
    
    // Store wheel bodies
    this.wheelBodies = this.vehicle.wheelBodies;
    
    // Set initial position
    this.reset();
  }
  
  update(delta, inputHandler) {
    if (!this.model || !this.vehicle) return;
    
    // Get input state
    const input = inputHandler.getInputState();
    
    // Handle reset
    if (input.reset) {
      this.reset();
      return;
    }
    
    // Update steering
    this.updateSteering(input, delta);
    
    // Update engine force
    this.updateEngineForce(input, delta);
    
    // Update brakes
    this.updateBrakes(input);
    
    // Apply forces to vehicle
    this.applyForces();
    
    // Update car model position and rotation
    this.updateModel();
    
    // Update wheel rotations
    this.updateWheels();
    
    // Calculate speed in km/h
    this.calculateSpeed();
  }
  
  updateSteering(input, delta) {
    // Calculate target steering angle
    let targetSteeringAngle = 0;
    
    if (input.left) {
      targetSteeringAngle = this.maxSteeringAngle;
    } else if (input.right) {
      targetSteeringAngle = -this.maxSteeringAngle;
    }
    
    // Smoothly interpolate current steering angle to target
    this.steeringAngle = THREE.MathUtils.lerp(
      this.steeringAngle,
      targetSteeringAngle,
      this.steeringSpeed * delta
    );
  }
  
  updateEngineForce(input, delta) {
    // Calculate target engine force
    let targetEngineForce = 0;
    
    if (input.forward) {
      targetEngineForce = this.acceleration;
    } else if (input.backward) {
      targetEngineForce = -this.acceleration;
    } else {
      // Apply deceleration when no input
      targetEngineForce = 0;
    }
    
    // Smoothly interpolate current engine force to target
    this.engineForce = THREE.MathUtils.lerp(
      this.engineForce,
      targetEngineForce,
      5 * delta
    );
    
    // Apply speed limit
    const currentSpeed = this.getSpeed();
    if (currentSpeed > this.maxSpeed && this.engineForce > 0) {
      this.engineForce = 0;
    } else if (currentSpeed < -this.maxSpeed / 2 && this.engineForce < 0) {
      this.engineForce = 0;
    }
  }
  
  updateBrakes(input) {
    // Apply brakes
    if (input.brake) {
      this.brakeForce = 20;
    } else {
      this.brakeForce = 0;
    }
  }
  
  applyForces() {
    // Apply engine force to all wheels
    for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
      this.vehicle.applyEngineForce(this.engineForce, i);
    }
    
    // Apply steering to front wheels
    this.vehicle.setSteeringValue(this.steeringAngle, 0);
    this.vehicle.setSteeringValue(this.steeringAngle, 1);
    
    // Apply brakes to all wheels
    for (let i = 0; i < this.vehicle.wheelInfos.length; i++) {
      this.vehicle.setBrake(this.brakeForce, i);
    }
  }
  
  updateModel() {
    // Update car model position and rotation from physics
    const position = this.vehicle.chassisBody.position;
    const quaternion = this.vehicle.chassisBody.quaternion;
    
    this.model.position.set(position.x, position.y, position.z);
    this.model.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
  }
  
  updateWheels() {
    // Update wheel meshes to match physics
    for (let i = 0; i < this.wheelMeshes.length; i++) {
      const wheelBody = this.wheelBodies[i];
      const wheelMesh = this.wheelMeshes[i];
      
      // Update position
      wheelMesh.position.copy(wheelBody.position);
      
      // Update rotation
      wheelMesh.quaternion.copy(wheelBody.quaternion);
      
      // Apply additional rotation for steering (front wheels only)
      if (i < 2) {
        wheelMesh.rotateY(this.steeringAngle);
      }
    }
  }
  
  calculateSpeed() {
    // Calculate speed in km/h
    const velocity = this.vehicle.chassisBody.velocity;
    this.speed = Math.sqrt(
      velocity.x * velocity.x +
      velocity.y * velocity.y +
      velocity.z * velocity.z
    ) * 3.6; // Convert m/s to km/h
    
    // Update UI
    if (window.game && window.game.ui) {
      window.game.ui.updateSpeed(this.speed);
    }
  }
  
  getSpeed() {
    return this.speed;
  }
  
  reset() {
    // Reset car position and rotation
    this.vehicle.chassisBody.position.set(0, 1, 0);
    this.vehicle.chassisBody.quaternion.set(0, 0, 0, 1);
    this.vehicle.chassisBody.velocity.set(0, 0, 0);
    this.vehicle.chassisBody.angularVelocity.set(0, 0, 0);
    
    // Reset wheels
    for (let i = 0; i < this.wheelBodies.length; i++) {
      this.vehicle.wheelBodies[i].velocity.set(0, 0, 0);
      this.vehicle.wheelBodies[i].angularVelocity.set(0, 0, 0);
    }
    
    // Reset car state
    this.speed = 0;
    this.steeringAngle = 0;
    this.engineForce = 0;
    this.brakeForce = 0;
    
    // Update model
    this.updateModel();
    this.updateWheels();
  }
} 