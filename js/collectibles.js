import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class CollectibleCreator {
  constructor(scene, lanes) {
    this.scene = scene;
    this.lanes = lanes;
    this.textureLoader = new THREE.TextureLoader();
    this.gltfLoader = new GLTFLoader();

    // Paths to models and textures
    this.modelPaths = {
      coin: "/models/coin.glb",
      jetpack: "/models/jetpack.glb",
      // boot: '/models/boot.glb' // Assuming boot model exists if uncommented
    };

    // Loaded models cache
    this.loadedModels = {
      coin: null,
      jetpack: null,
      // boot: null
    };

    this.loadingPromise = this.loadModels();
  }

  loadModels() {
    const promises = [];
    for (const key in this.modelPaths) {
      const promise = new Promise((resolve, reject) => {
        this.gltfLoader.load(
          this.modelPaths[key],
          (gltf) => {
            console.log(gltf);
            console.log(`${key} model loaded successfully.`);
            this.loadedModels[key] = gltf.scene;
            resolve(); // Resolve the promise when this model is loaded
          },
          undefined, // onProgress callback (optional)
          (error) => {
            console.error(`Error loading ${key} model:`, error);
            reject(error); // Reject the promise on error
          }
        );
      });
      promises.push(promise);
    }
    // Return a promise that resolves when ALL model loading promises resolve
    return Promise.all(promises);
  }

  // Optional helper to setup models after loading
  // setupModel(model, key) {
  //     model.traverse((child) => {
  //         if (child.isMesh) {
  //             child.castShadow = true;
  //             child.receiveShadow = true;
  //             // Apply specific textures if not embedded or need override
  //             if (this.textures[key]) {
  //                 child.material = new THREE.MeshStandardMaterial({
  //                     map: this.textures[key],
  //                     // metalness: 0.8, // Adjust as needed
  //                     // roughness: 0.2, // Adjust as needed
  //                 });
  //             }
  //         }
  //     });
  // }

  createCoins() {
    const coins = [];
    const lane0 = -1.15;
    const lane1 = 0.0;
    const lane2 = 1.15;

    // Helper function to add coin if model is loaded
    const addCoin = (x, y, z) => {
      const coinMesh = this.createCoin(x, y, z);
      if (coinMesh) {
        coins.push(coinMesh);
      }
    };

    // Example positions - adjust as needed
    addCoin(lane1, 0.4, 1.0);
    addCoin(lane2, 0.4, 1.0);
    addCoin(lane0, 0.4, 1.0);
    addCoin(lane0, 0.4, 0.0);

    for (let i = -200; i >= -310; i -= 5) {
      addCoin(lane0, 0.4, i);
    }
    for (let i = -60; i >= -100; i -= 5) {
      addCoin(lane1, 0.4, i);
    }

    return coins;
  }

  createCoin(x, y, z) {
    const scale = 20; // Adjust scale as needed for the model

    if (this.loadedModels.coin) {
      const coinMesh = this.loadedModels.coin.clone(); // Clone the loaded model
      coinMesh.scale.set(scale, scale, scale);
      coinMesh.position.set(x, y, z);
      // Math.PI / 2; // Rotate if necessary

      coinMesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Ensure material allows shadows and looks good
          if (child.material) {
            child.material.metalness = 0.8;
            child.material.roughness = 0.2;
          }
        }
      });

      // Add user data for animation/identification
      coinMesh.userData = { type: "coin", rotationSpeed: Math.PI }; // Radians per second
      this.scene.add(coinMesh);
      console.log(
        "Added coin to scene at:",
        coinMesh.position.x,
        coinMesh.position.y,
        coinMesh.position.z
      );
      return coinMesh; // Return the mesh directly
    } else {
      // Model not loaded yet, skip creation
      console.warn(
        `Coin model not loaded yet. Skipping creation at (${x}, ${y}, ${z}).`
      );
      return null; // Indicate that no coin was created
    }
  }

  createJetpacks() {
    const jetpacks = [];
    // Use different variable names to avoid redeclaration
    const jetpackLane0 = -1.15;
    const jetpackLane1 = 0.0;
    const jetpackLane2 = 1.15;

    jetpacks.push(this.createJetpack(jetpackLane0, 0.5, -5.0)); // Adjusted Y position
    jetpacks.push(this.createJetpack(jetpackLane2, 0.5, -12.0));

    return jetpacks;
  }

  createJetpack(x, y, z) {
    const scale = 30; // Adjust scale as needed

    if (this.loadedModels.jetpack) {
      const jetpackMesh = this.loadedModels.jetpack.clone();
      jetpackMesh.scale.set(scale, scale, scale);
      jetpackMesh.position.set(x, y, z);
      // jetpackMesh.rotation.y = Math.PI; // Rotate if necessary

      jetpackMesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Apply specific texture if needed - REMOVED to use GLB embedded materials
          // child.material = new THREE.MeshStandardMaterial({
          //   map: this.textures.jetpack, // Use preloaded texture
          //   roughness: 0.7,
          // });
        }
      });

      // Add user data for animation/identification
      jetpackMesh.userData = {
        type: "jetpack",
        bobSpeed: 2, // Oscillations per second
        bobAmount: 0.1, // Max displacement
        initialY: y,
      };
      this.scene.add(jetpackMesh);
      console.log(
        "Added jetpack to scene at:",
        jetpackMesh.position.x,
        jetpackMesh.position.y,
        jetpackMesh.position.z
      );
      return jetpackMesh; // Return the mesh directly
    } else {
      // Model not loaded yet, skip creation
      console.warn(
        `Jetpack model not loaded yet. Skipping creation at (${x}, ${y}, ${z}).`
      );
      return null; // Indicate that no jetpack was created
    }
  }

  // --- Boots code removed as model 'boot.glb' is likely missing ---
  // createBoots() { ... }
  // createBoot(x, y, z) { ... }
  // --- End of removed boots code ---

  // createMysteryBox() {
  //   // Keep using BoxGeometry as no model specified
  //   const x = 0.0;
  //   const y = 0.4;
  //   const z = -55; // Adjusted Z position (-440 * 0.125)

  //   const mysteryBox = new THREE.Mesh(
  //     new THREE.BoxGeometry(1, 1, 1),
  //     new THREE.MeshStandardMaterial({
  //       map: this.textures.mystery,
  //       roughness: 0.3,
  //       metalness: 0.7,
  //     })
  //   );

  //   mysteryBox.position.set(x, y, z);
  //   mysteryBox.scale.set(0.8, 0.8, 0.8); // Adjusted scale (was 8,8,8)
  //   mysteryBox.castShadow = true;
  //   mysteryBox.receiveShadow = true;

  //   // Add user data for animation/identification
  //   mysteryBox.userData = { type: "mysteryBox", rotationSpeed: Math.PI / 2 }; // Slower rotation
  //   this.scene.add(mysteryBox);
  //   return mysteryBox; // Return the mesh directly
  // }

  // Add an update method to handle animations
  update(delta, time) {
    // Animate coins
    this.scene.children.forEach((child) => {
      if (child.userData?.type === "coin" && !child.userData.isPlaceholder) {
        child.rotation.x += child.userData.rotationSpeed * delta; // Rotate around its local X axis
      }
      // Animate jetpacks (bobbing)
      else if (
        child.userData?.type === "jetpack" &&
        !child.userData.isPlaceholder
      ) {
        const bobOffset =
          Math.sin(time * child.userData.bobSpeed) * child.userData.bobAmount;
        child.position.y = child.userData.initialY + bobOffset;
      }
      // Animate mystery box
      else if (child.userData?.type === "mysteryBox") {
        child.rotation.y += child.userData.rotationSpeed * delta;
      }
    });
  }
}
