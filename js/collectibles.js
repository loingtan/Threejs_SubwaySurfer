import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
export class CollectibleCreator {
  constructor(scene, lanes) {
    this.scene = scene;
    this.lanes = lanes;
    this.textureLoader = new THREE.TextureLoader();

    // Load textures
    this.coinTexture = this.textureLoader.load("textures/coin.png");
    this.jetpackTexture = this.textureLoader.load("textures/jetpack.png");
    this.bootTexture = this.textureLoader.load("textures/boots.png");
    this.mysteryTexture = this.textureLoader.load("textures/mystery.png");
  }

  createCoins() {
    const coins = [];

    // Scale lanes for coins
    const lane0 = -1.15;
    const lane1 = 0.0;
    const lane2 = 1.15;

    // Create individual coins
    coins.push(this.createCoin(lane1, 0.4, 1.0));
    coins.push(this.createCoin(lane2, 0.4, 1.0));
    coins.push(this.createCoin(lane0, 0.4, 1.0));
    coins.push(this.createCoin(lane0, 0.4, 0.0));

    // Create coin runs
    for (let i = -200; i >= -310; i -= 5) {
      coins.push(this.createCoin(lane0, 0.4, i));
    }

    for (let i = -60; i >= -100; i -= 5) {
      coins.push(this.createCoin(lane1, 0.4, i));
    }

    return coins;
  }

  createCoin(x, y, z) {
    // Create coin object
    const coinObject = {
      mesh: null,
      scale: [5, 5, 5],
    };

    // Create coin geometry
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
    const material = new THREE.MeshStandardMaterial({
      map: this.coinTexture,
      metalness: 0.8,
      roughness: 0.2,
      color: 0xffd700,
    });

    // Create coin mesh
    coinObject.mesh = new THREE.Mesh(geometry, material);
    coinObject.mesh.position.set(x, y, z);
    coinObject.mesh.rotation.x = Math.PI / 2;

    // Apply scale
    coinObject.mesh.scale.set(0.2, 0.2, 0.2);

    // Enable shadows
    coinObject.mesh.castShadow = true;
    coinObject.mesh.receiveShadow = true;

    // Add coin to scene
    this.scene.add(coinObject.mesh);

    return coinObject;
  }

  createJetpacks() {
    const jetpacks = [];

    // Scale lanes for jetpacks
    const lane0 = -0.285;
    const lane1 = 0.0;
    const lane2 = 0.285;

    // Create jetpacks
    jetpacks.push(this.createJetpack(lane0, 0.15, -5.0));
    jetpacks.push(this.createJetpack(lane2, 0.15, -12.0));

    return jetpacks;
  }

  createJetpack(x, y, z) {
    // Create jetpack using model
    const jetpackObject = {
      mesh: null,
      scale: [20, 20, 20],
    };

    const loader = new GLTFLoader();
    loader.load("/models/jetpack.glb", (gltf) => {
      jetpackObject.mesh = gltf.scene;

      // Apply scale
      jetpackObject.mesh.scale.set(
        jetpackObject.scale[0],
        jetpackObject.scale[1],
        jetpackObject.scale[2]
      );

      // Set position
      jetpackObject.mesh.position.set(x, y, z);

      // Enable shadows
      jetpackObject.mesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          // Apply texture
          child.material = new THREE.MeshStandardMaterial({
            map: this.jetpackTexture,
            roughness: 0.7,
          });
        }
      });

      this.scene.add(jetpackObject.mesh);
    });

    // Create temporary box while model is loading
    const tempGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
    const tempMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5,
    });
    jetpackObject.mesh = new THREE.Mesh(tempGeometry, tempMaterial);
    jetpackObject.mesh.position.set(x, y, z);
    this.scene.add(jetpackObject.mesh);

    return jetpackObject;
  }

  //   createBoots() {
  //     const boots = [];

  //     // Scale lanes for boots
  //     const lane0 = -23.08;
  //     const lane1 = 0.0;
  //     const lane2 = 23.08;

  //     // Create boots
  //     boots.push(this.createBoot(lane2, 6.0, -90.0 / 0.25));
  //     boots.push(this.createBoot(lane1, 6.0, -1000));

  //     return boots;
  //   }

  //   createBoot(x, y, z) {
  //     // Create boot using model
  //     const bootObject = {
  //       mesh: null,
  //       scale: [0.25, 0.25, 0.25],
  //     };

  //     const loader = new GLTFLoader();
  //     loader.load("models/boot.glb", (gltf) => {
  //       bootObject.mesh = gltf.scene;

  //       // Apply scale
  //       bootObject.mesh.scale.set(
  //         bootObject.scale[0],
  //         bootObject.scale[1],
  //         bootObject.scale[2]
  //       );

  //       // Set position
  //       bootObject.mesh.position.set(x, y, z);

  //       // Enable shadows
  //       bootObject.mesh.traverse((child) => {
  //         if (child.isMesh) {
  //           child.castShadow = true;
  //           child.receiveShadow = true;

  //           // Apply texture
  //           child.material = new THREE.MeshStandardMaterial({
  //             map: this.bootTexture,
  //             roughness: 0.7,
  //           });
  //         }
  //       });

  //       this.scene.add(bootObject.mesh);
  //     });

  //     // Create temporary box while model is loading
  //     const tempGeometry = new THREE.BoxGeometry(1, 1, 1.5);
  //     const tempMaterial = new THREE.MeshBasicMaterial({
  //       color: 0x000000,
  //       transparent: true,
  //       opacity: 0.5,
  //     });
  //     bootObject.mesh = new THREE.Mesh(tempGeometry, tempMaterial);
  //     bootObject.mesh.position.set(x, y, z);
  //     this.scene.add(bootObject.mesh);

  //     return bootObject;
  //   }

  createMysteryBox() {
    // Create mystery box
    const x = 0.0;
    const y = 0.4;
    const z = -440 * 0.125; // -440 / 8

    const mysteryBox = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({
        map: this.mysteryTexture,
        roughness: 0.3,
        metalness: 0.7,
      })
    );

    mysteryBox.position.set(x, y, z);
    mysteryBox.scale.set(8, 8, 8);
    mysteryBox.castShadow = true;
    mysteryBox.receiveShadow = true;

    this.scene.add(mysteryBox);
    return mysteryBox;
  }
}
