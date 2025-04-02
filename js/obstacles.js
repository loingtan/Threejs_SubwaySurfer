import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
export class ObstacleCreator {
  constructor(scene, lanes) {
    this.scene = scene;
    this.lanes = lanes;
    this.textureLoader = new THREE.TextureLoader();

    // Load textures
    this.trainTexture = this.textureLoader.load("/textures/train.png");
    this.barrierTexture = this.textureLoader.load("/textures/roadbarrier.png");
    this.coneTexture = this.textureLoader.load("/textures/cone.png");
    this.barrelTexture = this.textureLoader.load("/textures/barrel.png");

    // Load the single model file with all objects
    this.modelParts = {
      train: null,
      barrier: null,
      cone: null,
      barrel: null,
    };

    this.loadModelParts();
  }

  loadModelParts() {
    const loader = new GLTFLoader();
    loader.load("/models/train.glb", (gltf) => {
      // Store references to different parts of the model
      // Assuming the model has named meshes or groups for each part
      gltf.scene.traverse((child) => {
        if (child.isMesh || child.isGroup) {
          if (child.name.includes("train")) {
            this.modelParts.train = child.clone();
          } else if (
            child.name.includes("barrier") ||
            child.name.includes("roadbarrier")
          ) {
            this.modelParts.barrier = child.clone();
          } else if (child.name.includes("cone")) {
            this.modelParts.cone = child.clone();
          } else if (child.name.includes("barrel")) {
            this.modelParts.barrel = child.clone();
          }
        }
      });

      // If specific naming isn't available, try to identify by geometry or position
      if (!this.modelParts.train) {
        console.warn(
          "Train model part not found by name. Using fallback method."
        );
        // You might need to adjust this based on your model's structure
      }
    });
  }

  createTrains() {
    const trains = [];

    // Scale lanes for trains
    const L0 = -23;
    const L1 = 0;
    const L2 = 23;

    // Add trains at different positions
    trains.push(this.createTrain(L0, 2, -450));
    trains.push(this.createTrain(L1, 2, -270));
    trains.push(this.createTrain(L1, 2, -500));

    return trains;
  }

  createTrain(x, y, z) {
    // Create train using model
    const trainObject = {
      mesh: null,
      scale: [0.25, 0.25, 0.25],
    };

    // Create temporary box while model is loading
    const tempGeometry = new THREE.BoxGeometry(4, 4, 12);
    const tempMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.5,
    });
    trainObject.mesh = new THREE.Mesh(tempGeometry, tempMaterial);
    trainObject.mesh.position.set(x, y, z);
    this.scene.add(trainObject.mesh);

    // If the model part is already loaded, use it
    if (this.modelParts.train) {
      this.replaceWithModelPart(
        trainObject,
        this.modelParts.train,
        x,
        y,
        z,
        Math.PI,
        this.trainTexture
      );
    } else {
      // If not loaded yet, set up a check to replace it once loaded
      const checkInterval = setInterval(() => {
        if (this.modelParts.train) {
          this.replaceWithModelPart(
            trainObject,
            this.modelParts.train,
            x,
            y,
            z,
            Math.PI,
            this.trainTexture
          );
          clearInterval(checkInterval);
        }
      }, 100);

      // Clear interval after 10 seconds to prevent infinite checks
      setTimeout(() => clearInterval(checkInterval), 10000);
    }

    return trainObject;
  }

  createBarriers() {
    const barriers = [];

    // Scale lanes for barriers
    const lane0 = -28.85;
    const lane1 = 0.0;
    const lane2 = 28.85;

    // Create barriers at different positions
    barriers.push(this.createBarrier(lane1, 9, -200));
    barriers.push(this.createBarrier(lane1, 9, -125));
    barriers.push(this.createBarrier(lane0, 9, -335));
    barriers.push(this.createBarrier(lane0, 9, -385));
    barriers.push(this.createBarrier(lane1, 9, -390));
    barriers.push(this.createBarrier(lane2, 9, -400));

    return barriers;
  }

  createBarrier(x, y, z) {
    // Create barrier using model
    const barrierObject = {
      mesh: null,
      scale: [0.1, 0.1, 0.2],
    };

    // Create temporary box while model is loading
    const tempGeometry = new THREE.BoxGeometry(2, 2, 2);
    const tempMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5,
    });
    barrierObject.mesh = new THREE.Mesh(tempGeometry, tempMaterial);
    barrierObject.mesh.position.set(x, y, z);
    this.scene.add(barrierObject.mesh);

    // If the model part is already loaded, use it
    if (this.modelParts.barrier) {
      this.replaceWithModelPart(
        barrierObject,
        this.modelParts.barrier,
        x,
        y,
        z,
        0,
        this.barrierTexture
      );
    } else {
      // If not loaded yet, set up a check to replace it once loaded
      const checkInterval = setInterval(() => {
        if (this.modelParts.barrier) {
          this.replaceWithModelPart(
            barrierObject,
            this.modelParts.barrier,
            x,
            y,
            z,
            0,
            this.barrierTexture
          );
          clearInterval(checkInterval);
        }
      }, 100);

      // Clear interval after 10 seconds to prevent infinite checks
      setTimeout(() => clearInterval(checkInterval), 10000);
    }

    return barrierObject;
  }

  createCones() {
    const cones = [];

    // Scale lanes for cones
    const lane0 = -28.85;
    const lane1 = 0.0;
    const lane2 = 28.85;

    // Create cones at different positions
    cones.push(this.createCone(lane2, 1.5, -100));
    cones.push(this.createCone(lane1, 1.5, -130));
    cones.push(this.createCone(lane1, 1.5, -135));
    cones.push(this.createCone(lane1, 1.5, -140));
    cones.push(this.createCone(lane2, 1.5, -146));
    cones.push(this.createCone(lane0, 1.5, -315));
    cones.push(this.createCone(lane1, 1.5, -410));
    cones.push(this.createCone(lane2, 1.5, -420));
    cones.push(this.createCone(lane2, 1.5, -425));

    return cones;
  }

  createCone(x, y, z) {
    // Create cone using model
    const coneObject = {
      mesh: null,
      scale: [0.2, 0.2, 0.2],
    };

    // Create temporary cone while model is loading
    const tempGeometry = new THREE.ConeGeometry(1, 2, 16);
    const tempMaterial = new THREE.MeshBasicMaterial({
      color: 0xffa500,
      transparent: true,
      opacity: 0.5,
    });
    coneObject.mesh = new THREE.Mesh(tempGeometry, tempMaterial);
    coneObject.mesh.position.set(x, y, z);
    this.scene.add(coneObject.mesh);

    // If the model part is already loaded, use it
    if (this.modelParts.cone) {
      // For cones, we need special rotation
      this.replaceWithModelPart(
        coneObject,
        this.modelParts.cone,
        x,
        y,
        z,
        Math.PI / 2,
        this.coneTexture,
        { x: (3 * Math.PI) / 2, y: Math.PI / 2, z: 0 }
      );
    } else {
      // If not loaded yet, set up a check to replace it once loaded
      const checkInterval = setInterval(() => {
        if (this.modelParts.cone) {
          this.replaceWithModelPart(
            coneObject,
            this.modelParts.cone,
            x,
            y,
            z,
            Math.PI / 2,
            this.coneTexture,
            { x: (3 * Math.PI) / 2, y: Math.PI / 2, z: 0 }
          );
          clearInterval(checkInterval);
        }
      }, 100);

      // Clear interval after 10 seconds to prevent infinite checks
      setTimeout(() => clearInterval(checkInterval), 10000);
    }

    return coneObject;
  }

  createBarrels() {
    const barrels = [];

    // Scale lanes for barrels
    const lane0 = -28.85;
    const lane1 = 0.0;
    const lane2 = 28.85;

    // Create barrels at different positions
    barrels.push(this.createBarrel(lane0, 0.0, -800));
    barrels.push(this.createBarrel(lane2, 0.0, -380));

    return barrels;
  }

  createBarrel(x, y, z) {
    // Create barrel using model
    const barrelObject = {
      mesh: null,
      scale: [0.2, 0.2, 0.2],
    };

    // Create temporary cylinder while model is loading
    const tempGeometry = new THREE.CylinderGeometry(1, 1, 2, 16);
    const tempMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5,
    });
    barrelObject.mesh = new THREE.Mesh(tempGeometry, tempMaterial);
    barrelObject.mesh.position.set(x, y, z);
    this.scene.add(barrelObject.mesh);

    // If the model part is already loaded, use it
    if (this.modelParts.barrel) {
      this.replaceWithModelPart(
        barrelObject,
        this.modelParts.barrel,
        x,
        y,
        z,
        0,
        this.barrelTexture
      );
    } else {
      // If not loaded yet, set up a check to replace it once loaded
      const checkInterval = setInterval(() => {
        if (this.modelParts.barrel) {
          this.replaceWithModelPart(
            barrelObject,
            this.modelParts.barrel,
            x,
            y,
            z,
            0,
            this.barrelTexture
          );
          clearInterval(checkInterval);
        }
      }, 100);

      // Clear interval after 10 seconds to prevent infinite checks
      setTimeout(() => clearInterval(checkInterval), 10000);
    }

    return barrelObject;
  }

  // Helper method to replace temporary object with the actual model part
  replaceWithModelPart(
    objectInfo,
    modelPart,
    x,
    y,
    z,
    rotationY,
    texture,
    extraRotation = null
  ) {
    // Remove the temporary mesh
    this.scene.remove(objectInfo.mesh);

    // Clone the model part
    objectInfo.mesh = modelPart.clone();

    // Apply scale
    objectInfo.mesh.scale.set(
      objectInfo.scale[0],
      objectInfo.scale[1],
      objectInfo.scale[2]
    );

    // Set position
    objectInfo.mesh.position.set(x, y, z);

    // Apply rotation
    objectInfo.mesh.rotation.y = rotationY;

    // Apply extra rotation if provided
    if (extraRotation) {
      if (extraRotation.x !== undefined)
        objectInfo.mesh.rotation.x = extraRotation.x;
      if (extraRotation.z !== undefined)
        objectInfo.mesh.rotation.z = extraRotation.z;
    }

    // Enable shadows and apply texture
    objectInfo.mesh.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Apply texture
        child.material = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.7,
        });
      }
    });

    this.scene.add(objectInfo.mesh);
  }
}
