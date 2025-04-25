import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
export class ObstacleCreator {
  constructor(scene, lanes) {
    this.scene = scene;
    this.lanes = lanes;
    // Removed textureLoader and individual texture loading for models

    // Load the single model file with all objects
    this.modelParts = {
      train: null,
      barrier: null,
      cone: null,
      barrel: null,
    };
    this.modelsLoaded = false; // Flag to track if models are loaded
    this.loadingPromise = this.loadModelParts(); // Store promise
  }

  loadModelParts() {
    // Return a promise that resolves when loading and processing is done
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        "/models/train.glb", // Assuming train.glb contains all obstacle parts
        (gltf) => {
          console.log("Obstacle models loaded successfully.");
          // Store references to different parts of the model
          // Assuming the model has named meshes or groups for each part
          gltf.scene.traverse((child) => {
            // Enable shadows and check names
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }

            const childNameLower = child.name.toLowerCase();
            if (childNameLower.includes("train") && !this.modelParts.train) {
              // Assign only once
              this.modelParts.train = child;
            } else if (
              (childNameLower.includes("barrier") ||
                childNameLower.includes("roadbarrier")) &&
              !this.modelParts.barrier
            ) {
              this.modelParts.barrier = child;
            } else if (
              childNameLower.includes("cone") &&
              !this.modelParts.cone
            ) {
              this.modelParts.cone = child;
            } else if (
              childNameLower.includes("barrel") &&
              !this.modelParts.barrel
            ) {
              this.modelParts.barrel = child;
            }
          });

          // Check if all parts were found
          let allPartsFound = true;
          for (const part in this.modelParts) {
            if (!this.modelParts[part]) {
              console.warn(
                `Obstacle model part '${part}' not found by name in train.glb.`
              );
              allPartsFound = false;
              // Implement fallback logic here if needed
            } else {
              console.log(`Found model part: ${part}`);
            }
          }
          this.modelsLoaded = true; // Set flag when loading is complete
          resolve(); // Resolve the promise
        },
        undefined,
        (error) => {
          console.error("Error loading obstacle models:", error);
          reject(error); // Reject the promise on error
        }
      );
    });
  }

  createTrains() {
    const trains = [];
    if (!this.modelsLoaded || !this.modelParts.train) {
      console.warn("Train model part not ready, skipping train creation.");
      return trains; // Return empty if model not ready
    }

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
    const trainObject = {
      mesh: null,
      scale: [0.25, 0.25, 0.25],
    };
    // Use the loaded model part directly, remove texture argument
    this.setupModelInstance(
      trainObject,
      this.modelParts.train,
      x,
      y,
      z,
      Math.PI // Rotation Y
    );
    return trainObject;
  }

  createBarriers() {
    const barriers = [];
    if (!this.modelsLoaded || !this.modelParts.barrier) {
      console.warn("Barrier model part not ready, skipping barrier creation.");
      return barriers;
    }

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
    const barrierObject = {
      mesh: null,
      scale: [0.1, 0.1, 0.2], // Adjust scale as needed based on the model part
    };
    // Use the loaded model part directly, remove texture argument
    this.setupModelInstance(
      barrierObject,
      this.modelParts.barrier,
      x,
      y,
      z,
      0 // Rotation Y
    );
    return barrierObject;
  }

  createCones() {
    const cones = [];
    if (!this.modelsLoaded || !this.modelParts.cone) {
      console.warn("Cone model part not ready, skipping cone creation.");
      return cones;
    }

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
    const coneObject = {
      mesh: null,
      scale: [0.2, 0.2, 0.2], // Adjust scale as needed
    };
    // Use the loaded model part directly, remove texture argument
    this.setupModelInstance(
      coneObject,
      this.modelParts.cone,
      x,
      y,
      z,
      Math.PI / 2, // Rotation Y
      { x: (3 * Math.PI) / 2, y: Math.PI / 2, z: 0 } // Extra rotation
    );
    return coneObject;
  }

  createBarrels() {
    const barrels = [];
    if (!this.modelsLoaded || !this.modelParts.barrel) {
      console.warn("Barrel model part not ready, skipping barrel creation.");
      return barrels;
    }

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
    const barrelObject = {
      mesh: null,
      scale: [0.2, 0.2, 0.2], // Adjust scale as needed
    };
    // Use the loaded model part directly, remove texture argument
    this.setupModelInstance(
      barrelObject,
      this.modelParts.barrel,
      x,
      y,
      z,
      0 // Rotation Y
    );
    return barrelObject;
  }

  // Renamed and simplified helper method
  setupModelInstance(
    objectInfo,
    modelPart,
    x,
    y,
    z,
    rotationY,
    extraRotation = null
  ) {
    if (!modelPart) {
      console.error("Model part is null, cannot create instance.");
      return;
    }
    // Clone the model part (deep clone to get materials)
    objectInfo.mesh = modelPart.clone(true);

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

    // Shadows should have been enabled during loadModelParts traversal
    // No need to traverse again unless specific material overrides are needed

    this.scene.add(objectInfo.mesh);
  }
}
