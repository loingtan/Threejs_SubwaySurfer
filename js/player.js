import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
export class Player {
  constructor(scene, laneX) {
    this.scene = scene;
    this.mesh = null;
    this.speed = 0;
    this.jumpSpeed = 0.7;
    this.gravity = 1;
    this.yVelocity = 0;
    this.rotation = 180;
    this.scale = [0.35, 0.35, 0.35];

    this.init(laneX);
  }

  init(laneX) {
    // Load player model
    const loader = new GLTFLoader();
    loader.load("/models/player.glb", (gltf) => {
      this.mesh = gltf.scene;

      // Apply scale
      this.mesh.scale.set(this.scale[0], this.scale[1], this.scale[2]);

      // Set initial position
      this.mesh.position.set(laneX, 1.0, 15);

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
    });

    // Create a temporary mesh while the model is loading
    const tempGeometry = new THREE.BoxGeometry(1, 2, 1);
    const tempMaterial = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      transparent: true,
      opacity: 0,
    });
    this.mesh = new THREE.Mesh(tempGeometry, tempMaterial);
    this.mesh.position.set(laneX, 1.0, 15);
    this.scene.add(this.mesh);
  }

  update(delta) {
    if (!this.mesh) return;

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
    if (this.mesh.position.y <= 1.0) {
      this.yVelocity = this.jumpSpeed;
    }
  }

  moveLeft(lanes) {
    if (!this.mesh) return;

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
    if (!this.mesh) return;

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
    this.scale = [0.4, 0.4, 0.4];

    this.init(x, y, z);
  }

  init(x, y, z) {
    // Load inspector model
    const loader = new GLTFLoader();
    loader.load("/models/inspector.glb", (gltf) => {
      this.mesh = gltf.scene;

      // Apply scale
      this.mesh.scale.set(this.scale[0], this.scale[1], this.scale[2]);

      // Set initial position
      this.mesh.position.set(x, y, z);

      // Enable shadows
      this.mesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      this.scene.add(this.mesh);
    });

    // Create a temporary mesh while the model is loading
    const tempGeometry = new THREE.BoxGeometry(1, 2, 1);
    const tempMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0,
    });
    this.mesh = new THREE.Mesh(tempGeometry, tempMaterial);
    this.mesh.position.set(x, y, z);
    this.scene.add(this.mesh);
  }
}

export class Dog {
  constructor(scene, x, y, z) {
    this.scene = scene;
    this.mesh = null;
    this.scale = [0.5, 0.5, 0.5];

    this.init(x, y, z);
  }

  init(x, y, z) {
    // Load dog model
    const loader = new GLTFLoader();
    loader.load("/models/dog.glb", (gltf) => {
      this.mesh = gltf.scene;

      // Apply scale
      this.mesh.scale.set(this.scale[0], this.scale[1], this.scale[2]);

      // Set initial position
      this.mesh.position.set(x, y, z);

      // Enable shadows
      this.mesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      this.scene.add(this.mesh);
    });

    // Create a temporary mesh while the model is loading
    const tempGeometry = new THREE.BoxGeometry(1, 1, 1);
    const tempMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0,
    });
    this.mesh = new THREE.Mesh(tempGeometry, tempMaterial);
    this.mesh.position.set(x, y, z);
    this.scene.add(this.mesh);
  }
}
