import * as CANNON from 'cannon-es';

export class Physics {
  constructor() {
    // Create physics world
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0) // Earth gravity
    });
    
    // Set solver iterations
    this.world.solver.iterations = 10;
    
    // Set default contact material
    this.defaultMaterial = new CANNON.Material('default');
    this.defaultContactMaterial = new CANNON.ContactMaterial(
      this.defaultMaterial,
      this.defaultMaterial,
      {
        friction: 0.3,
        restitution: 0.2
      }
    );
    this.world.addContactMaterial(this.defaultContactMaterial);
    this.world.defaultContactMaterial = this.defaultContactMaterial;
    
    // Store bodies
    this.bodies = [];
    
    // Debug mode (for development)
    this.debugMode = false;
  }
  
  update(delta) {
    // Step the physics world
    this.world.step(1/60, delta, 3);
    
    // Update all bodies
    for (const body of this.bodies) {
      if (body.update) {
        body.update();
      }
    }
  }
  
  addBody(body) {
    this.world.addBody(body);
    this.bodies.push(body);
    return body;
  }
  
  removeBody(body) {
    const index = this.bodies.indexOf(body);
    if (index !== -1) {
      this.bodies.splice(index, 1);
      this.world.removeBody(body);
    }
  }
  
  createGroundBody(size, position, rotation) {
    // Create a ground plane
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
      mass: 0, // Static body
      material: this.defaultMaterial,
      shape: groundShape
    });
    
    // Set position and rotation
    groundBody.position.set(position.x, position.y, position.z);
    groundBody.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
    
    // Add to world
    this.addBody(groundBody);
    
    return groundBody;
  }
  
  createBoxBody(size, position, rotation, mass = 1) {
    // Create a box shape
    const boxShape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
    const boxBody = new CANNON.Body({
      mass: mass,
      material: this.defaultMaterial,
      shape: boxShape
    });
    
    // Set position and rotation
    boxBody.position.set(position.x, position.y, position.z);
    boxBody.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
    
    // Add to world
    this.addBody(boxBody);
    
    return boxBody;
  }
  
  createSphereBody(radius, position, mass = 1) {
    // Create a sphere shape
    const sphereShape = new CANNON.Sphere(radius);
    const sphereBody = new CANNON.Body({
      mass: mass,
      material: this.defaultMaterial,
      shape: sphereShape
    });
    
    // Set position
    sphereBody.position.set(position.x, position.y, position.z);
    
    // Add to world
    this.addBody(sphereBody);
    
    return sphereBody;
  }
  
  createCylinderBody(radius, height, position, rotation, mass = 1) {
    // Create a cylinder shape
    const cylinderShape = new CANNON.Cylinder(radius, radius, height, 16);
    const cylinderBody = new CANNON.Body({
      mass: mass,
      material: this.defaultMaterial,
      shape: cylinderShape
    });
    
    // Set position and rotation
    cylinderBody.position.set(position.x, position.y, position.z);
    cylinderBody.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
    
    // Add to world
    this.addBody(cylinderBody);
    
    return cylinderBody;
  }
  
  createVehicleBody(chassisSize, wheelRadius, wheelHeight, position, rotation) {
    // Create vehicle
    const vehicle = new CANNON.RaycastVehicle({
      chassisBody: this.createBoxBody(chassisSize, position, rotation, 150),
      indexRightAxis: 0,
      indexForwardAxis: 2,
      indexUpAxis: 1
    });
    
    // Create wheels
    const wheelOptions = {
      radius: wheelRadius,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 30,
      suspensionRestLength: 0.3,
      frictionSlip: 1.5,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      maxSuspensionForce: 100000,
      rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(0, 0, 1),
      chassisConnectionPointLocal: new CANNON.Vec3(0, 0, 0),
      maxSuspensionTravel: 0.3,
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true
    };
    
    // Wheel positions
    const wheelPositions = [
      { x: -chassisSize.x / 2, y: 0, z: -chassisSize.z / 2 }, // Front left
      { x: chassisSize.x / 2, y: 0, z: -chassisSize.z / 2 },  // Front right
      { x: -chassisSize.x / 2, y: 0, z: chassisSize.z / 2 },  // Rear left
      { x: chassisSize.x / 2, y: 0, z: chassisSize.z / 2 }    // Rear right
    ];
    
    // Add wheels
    for (const position of wheelPositions) {
      wheelOptions.chassisConnectionPointLocal.set(position.x, position.y, position.z);
      vehicle.addWheel(wheelOptions);
    }
    
    // Add vehicle to world
    vehicle.addToWorld(this.world);
    
    return vehicle;
  }
  
  // Helper method to convert Three.js vector to Cannon.js vector
  threeToCannonVector(vector) {
    return new CANNON.Vec3(vector.x, vector.y, vector.z);
  }
  
  // Helper method to convert Cannon.js vector to Three.js vector
  cannonToThreeVector(vector) {
    return new THREE.Vector3(vector.x, vector.y, vector.z);
  }
  
  // Toggle debug mode
  toggleDebugMode() {
    this.debugMode = !this.debugMode;
    return this.debugMode;
  }
} 