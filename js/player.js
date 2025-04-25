import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
export class Player {
  constructor(scene, laneX, onLoad) {
    // Add onLoad callback
    this.scene = scene;
    this.mesh = null; // Initialize mesh as null
    this.modelLoaded = false; // Flag to track model loading
    this.speed = 0;
    this.jumpSpeed = 0.7;
    this.gravity = 1;
    this.yVelocity = 0;
    this.rotation = 180;
    this.scale = [0.35, 0.35, 0.35];
    this.initialPosition = new THREE.Vector3(laneX, 1.0, 15);
    this.onLoadCallback = onLoad; // Store the callback

    this.init();
  }

  init() {
    // Load player model
    const loader = new GLTFLoader();
    loader.load(
      "/models/player.glb",
      (gltf) => {
        this.mesh = gltf.scene;
        this.modelLoaded = true;

        // Apply scale
        this.mesh.scale.set(this.scale[0], this.scale[1], this.scale[2]);

        // Set initial position
        this.mesh.position.copy(this.initialPosition);

        // Apply rotation
        this.mesh.rotation.y = (this.rotation * Math.PI) / 180;

        // Enable shadows
        this.mesh.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        this.scene.add(this.mesh);
        console.log("Player model loaded and added to scene.");

        // Execute the callback if it exists
        if (this.onLoadCallback) {
          this.onLoadCallback();
        }
      },
      undefined,
      (error) => {
        console.error("Error loading player model:", error);
      }
    );

    // No temporary mesh needed anymore
  }

  update(delta) {
    // Only update if the model is loaded
    if (!this.modelLoaded || !this.mesh) return;

    // Apply gravity if not flying
    if (this.gravity > 0) {
      this.yVelocity -= 0.03;
      this.mesh.position.y += this.yVelocity;

      // Don't go below ground level
      if (this.mesh.position.y < 1.0) {
        this.mesh.position.y = 1.0;
        this.yVelocity = 0;
      }
    }
  }

  jump() {
    // Only jump if the model is loaded
    if (!this.modelLoaded || !this.mesh) return;
    if (this.mesh.position.y <= 1.0) {
      this.yVelocity = this.jumpSpeed;
    }
  }

  moveLeft(lanes) {
    // Only move if the model is loaded
    if (!this.modelLoaded || !this.mesh) return;

    // Find current lane index
    let currentLaneIndex = -1;
    for (let i = 0; i < lanes.length; i++) {
      if (Math.abs(this.mesh.position.x - lanes[i]) < 0.1) {
        currentLaneIndex = i;
        break;
      }
    }

    // Move left if possible
    if (currentLaneIndex > 0) {
      this.mesh.position.x = lanes[currentLaneIndex - 1];
    }
  }

  moveRight(lanes) {
    // Only move if the model is loaded
    if (!this.modelLoaded || !this.mesh) return;

    // Find current lane index
    let currentLaneIndex = -1;
    for (let i = 0; i < lanes.length; i++) {
      if (Math.abs(this.mesh.position.x - lanes[i]) < 0.1) {
        currentLaneIndex = i;
        break;
      }
    }

    // Move right if possible
    if (currentLaneIndex < lanes.length - 1) {
      this.mesh.position.x = lanes[currentLaneIndex + 1];
    }
  }
}

export class Inspector {
  constructor(scene, x, y, z) {
    this.scene = scene;
    this.mesh = null;
    this.modelLoaded = false;
    this.scale = [0.4, 0.4, 0.4];
    this.initialPosition = new THREE.Vector3(x, y, z);

    this.init();
  }

  init() {
    // Load inspector model
    const loader = new GLTFLoader();
    loader.load(
      "/models/inspector.glb",
      (gltf) => {
        this.mesh = gltf.scene;
        this.modelLoaded = true;

        // Apply scale
        this.mesh.scale.set(this.scale[0], this.scale[1], this.scale[2]);

        // Set initial position
        this.mesh.position.copy(this.initialPosition);

        // Enable shadows
        this.mesh.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        this.scene.add(this.mesh);
        console.log("Inspector model loaded and added to scene.");
      },
      undefined,
      (error) => {
        console.error("Error loading inspector model:", error);
      }
    );

    // No temporary mesh needed
  }
}

export class Dog {
  constructor(scene, x, y, z, onLoad) {
    // Add onLoad callback
    this.scene = scene;
    this.mesh = null;
    this.modelLoaded = false;
    this.scale = [0.5, 0.5, 0.5];
    this.initialPosition = new THREE.Vector3(x, y, z);
    this.onLoadCallback = onLoad; // Store the callback

    this.init();
  }

  init() {
    // Load dog model
    const loader = new GLTFLoader();
    loader.load(
      "/models/dog.glb",
      (gltf) => {
        this.mesh = gltf.scene;
        this.modelLoaded = true;

        // Apply scale
        this.mesh.scale.set(this.scale[0], this.scale[1], this.scale[2]);

        // Set initial position
        this.mesh.position.copy(this.initialPosition);

        // Enable shadows
        this.mesh.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        this.scene.add(this.mesh);
        console.log("Dog model loaded and added to scene.");

        // Execute the callback if it exists
        if (this.onLoadCallback) {
          this.onLoadCallback();
        }
      },
      undefined,
      (error) => {
        console.error("Error loading dog model:", error);
      }
    );

    // No temporary mesh needed
  }
}
