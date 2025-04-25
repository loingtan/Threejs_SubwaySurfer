import * as THREE from "three";
import { Player, Inspector, Dog } from "./player.js";
import { Controls } from "./controls.js";
import { Effects } from "./effects.js";
import { ObstacleCreator } from "./obstacles.js";
import { CollectibleCreator } from "./collectibles.js";

export class Game {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    // Game state
    this.score = 0;
    this.speed = 0;
    this.initialSpeed = 0.5;
    this.maxSpeed = 1.0;
    this.timer = 0;
    this.lastCollisionTime = -1;
    this.isGameOver = false;
    this.isGrayscale = false;

    // Game objects
    this.player = null;
    this.inspector = null;
    this.dog = null;
    this.tracks = [];
    this.trains = [];
    this.coins = [];
    this.barriers = [];
    this.cones = [];
    this.barrels = [];
    this.jetpacks = [];
    this.boots = [];
    this.mysteryBox = null;

    // Lanes
    this.lanes = [-1.15, 0, 1.15]; // Left, Center, Right

    // Collectible Creator instance
    this.collectibleCreator = null; // Added

    // Special effects timers
    this.jetpackTimer = -1;
    this.bootsTimer = -1;
    this.grayscaleTimer = -1;

    // For delta time calculation
    this.clock = new THREE.Clock();

    // Controls
    this.controls = new Controls(this);

    // Effects
    this.effects = new Effects(this.scene, this.camera);
  }

  async init() {
    // Make init asynchronous
    this.setupLights();
    this.setupEnvironment();
    this.createPlayer(); // Player creation might also be async if models load inside
    this.createInspector(); // Inspector creation might also be async
    this.createDog(); // Dog creation might also be async
    this.createTracks();
    await this.createObstacles(); // Wait for obstacles (and their models)
    await this.createCollectibles(); // Wait for collectibles to be created (including model loading)

    // Start gameplay only after everything is initialized
    this.startGame();
  }

  startGame() {
    this.speed = this.initialSpeed;
  }

  setupLights() {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Add directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
  }

  setupEnvironment() {
    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(100, 1000);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.position.z = -400;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Create walls on both sides
    this.createWalls();
  }

  createWalls() {
    // Create walls on both sides of the track
    const textureLoader = new THREE.TextureLoader();
    const wallTexture = textureLoader.load("textures/wall.png");

    for (let i = 55; i >= -400; i -= 2) {
      // Left wall
      this.createWall(-10, 2, i, wallTexture);
      this.createWall(-10, 4, i, wallTexture);

      // Right wall
      this.createWall(10, 2, i, wallTexture);
      this.createWall(10, 4, i, wallTexture);
    }
  }

  createWall(x, y, z, texture) {
    const wallGeometry = new THREE.BoxGeometry(2, 2, 2);
    const wallMaterial = new THREE.MeshStandardMaterial({ map: texture });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, y, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    this.scene.add(wall);
  }

  createPlayer() {
    // Pass a callback to set initial camera position after model loads
    this.player = new Player(this.scene, this.lanes[1], () => {
      // This code runs *after* the player model is loaded
      if (this.player.mesh) {
        // Ensure mesh exists (good practice)
        this.camera.position.set(0, 8.5, this.player.mesh.position.z + 20);
        this.camera.lookAt(0, 0, this.player.mesh.position.z);
      }
    });
    // Camera positioning moved to the callback above
    // this.camera.position.set(0, 8.5, this.player.mesh.position.z + 20); // Error prone line removed
    // this.camera.lookAt(0, 0, this.player.mesh.position.z); // Error prone line removed
  }

  createInspector() {
    this.inspector = new Inspector(this.scene, 0, 1.0, 125);
    // Rotation can be set immediately as it doesn't depend on the mesh being loaded yet
    // but accessing position for logic should wait or be checked.
    // this.inspector.mesh.rotation.y = Math.PI; // This would cause an error if mesh is null
    // We can set rotation after load if needed, or check mesh existence before use.
    // For now, let's ensure checks are in place where inspector.mesh is used.
  }

  createDog() {
    // Pass a callback to set rotation after the model loads
    this.dog = new Dog(this.scene, 0, 0, 0, () => {
      // This code runs *after* the dog model is loaded
      if (this.dog.mesh) {
        // Ensure mesh exists
        this.dog.mesh.rotation.y = Math.PI;
      }
    });
    // Rotation setting moved to the callback above
    // this.dog.mesh.rotation.y = Math.PI; // Error prone line removed
  }

  createTracks() {
    const trackCreator = new TrackCreator(this.scene);
    this.tracks = trackCreator.createTracks(-200, 200); // Create tracks from z=-200 to z=200
  }

  async createObstacles() {
    // Make this function async
    const obstacleCreator = new ObstacleCreator(this.scene, this.lanes);

    // Wait for the obstacle models to load before creating instances
    await obstacleCreator.loadingPromise;

    // Create trains
    this.trains = obstacleCreator.createTrains();

    // Create barriers
    this.barriers = obstacleCreator.createBarriers();

    // Create cones
    this.cones = obstacleCreator.createCones();

    // Create barrels
    this.barrels = obstacleCreator.createBarrels();
  }

  async createCollectibles() {
    // Make createCollectibles asynchronous
    // Instantiate the creator
    this.collectibleCreator = new CollectibleCreator(this.scene, this.lanes);

    // Wait for all models within CollectibleCreator to load
    await this.collectibleCreator.loadingPromise;

    // Now it's safe to create collectibles that depend on loaded models
    this.coins = this.collectibleCreator.createCoins();
    this.jetpacks = this.collectibleCreator.createJetpacks();
    // this.mysteryBox = this.collectibleCreator.createMysteryBox();

    // Filter out any null entries if create functions returned null due to loading issues (belt-and-braces)
    this.coins = this.coins.filter((coin) => coin !== null);
    this.jetpacks = this.jetpacks.filter((jetpack) => jetpack !== null);
    // No need to filter mysteryBox as it's a single object, check if it exists later
  }

  update() {
    if (this.isGameOver) return;

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime(); // Get elapsed time for animations
    this.timer += delta;

    // Update player
    this.player.update(delta);

    // Update camera position to follow player
    this.updateCamera(); // Uncommented

    // Move all objects backwards to simulate player moving forward
    // this.moveObjects(delta); // Uncommented

    // Update collectible animations
    if (this.collectibleCreator) {
      this.collectibleCreator.update(delta, elapsedTime); // Added call to collectible animations
    }

    // Check collisions
    this.checkCollisions();

    // Update special effects timers
    this.updateTimers(delta);

    // Update dog position to follow player
    this.updateDogPosition();

    // Update inspector
    this.updateInspector(delta);

    // Update UI
    this.updateUI();

    // Apply visual effects if needed
    if (this.isGrayscale) {
      this.effects.applyGrayscale();
    }
  }

  updateCamera() {
    // Add checks for player and player.mesh before accessing position
    if (!this.player || !this.player.mesh) return;

    if (this.jetpackTimer > 0) {
      this.camera.position.set(0, 11.5, this.player.mesh.position.z + 25);
    } else {
      this.camera.position.set(0, 8.5, this.player.mesh.position.z + 20);
      this.camera.lookAt(0, 0, this.player.mesh.position.z);
    }
  }

  moveObjects(delta) {
    const moveDistance = this.speed * delta * 60; // Normalize by 60 for consistent speed

    // Move obstacles
    this.moveObjectGroup(this.trains, moveDistance);
    this.moveObjectGroup(this.barriers, moveDistance);
    this.moveObjectGroup(this.cones, moveDistance);
    this.moveObjectGroup(this.barrels, moveDistance);

    // Move collectibles
    this.moveObjectGroup(this.coins, moveDistance);
    this.moveObjectGroup(this.jetpacks, moveDistance);
    this.moveObjectGroup(this.boots, moveDistance);

    if (this.mysteryBox) {
      this.mysteryBox.position.z += moveDistance;
    }

    // Move tracks
    this.moveObjectGroup(this.tracks, moveDistance);
  }

  moveObjectGroup(objects, distance) {
    objects.forEach((object) => {
      // Add a check to ensure the object itself is not null/undefined
      if (object) {
        if (object.mesh) {
          object.mesh.position.z += distance;
        } else if (object.position) {
          // Check for direct position property (e.g., for coins, tracks)
          object.position.z += distance;
        }
      }
    });
  }

  checkCollisions() {
    // Check collisions with coins
    this.checkCoinCollisions();

    // Check collisions with obstacles (type 1)
    this.checkType1Collisions();

    // Check collisions with obstacles (type 2)
    this.checkType2Collisions();

    // Check collisions with power-ups
    this.checkPowerupCollisions();

    // Check collision with mystery box
    this.checkMysteryBoxCollision();
  }

  checkCoinCollisions() {
    for (let i = 0; i < this.coins.length; i++) {
      const coin = this.coins[i]; // Direct mesh reference
      // Adjusted collision check to use the mesh directly
      if (this.isColliding(this.player.mesh, coin, 0.2, 0.2, 0.2)) {
        // Play coin sound
        const coinSound = document.getElementById("coin_sound");
        coinSound.currentTime = 0;
        coinSound.play();

        // Add score and remove coin
        this.score += 10;
        this.scene.remove(coin); // Remove mesh directly
        this.coins.splice(i, 1);
        i--;
      }
    }
  }

  checkType1Collisions() {
    // Check collision with trains
    for (let i = 0; i < this.trains.length; i++) {
      if (this.isColliding(this.player.mesh, this.trains[i].mesh, 7, 7.2, 7)) {
        this.gameOver("GAME OVER! YOU WERE HIT BY A TRAIN!");
        return;
      }
    }

    // Check collision with barrels
    for (let i = 0; i < this.barrels.length; i++) {
      if (this.isColliding(this.player.mesh, this.barrels[i].mesh, 2, 6.3, 2)) {
        this.gameOver("GAME OVER! YOU WERE HIT BY A BARREL!");
        return;
      }
    }
  }

  checkType2Collisions() {
    // Check collision with barriers
    for (let i = 0; i < this.barriers.length; i++) {
      if (
        this.isColliding(this.player.mesh, this.barriers[i].mesh, 0.1, 1.6, 2)
      ) {
        this.scene.remove(this.barriers[i].mesh);
        this.barriers.splice(i, 1);
        this.lastCollisionTime = this.timer;
        this.speed /= 2;
        i--;
      }
    }

    // Check collision with cones
    for (let i = 0; i < this.cones.length; i++) {
      if (
        this.isColliding(this.player.mesh, this.cones[i].mesh, 0.5, 1.33, 2) // Changed X threshold from 0.1 to 0.5
      ) {
        this.scene.remove(this.cones[i].mesh);
        this.cones.splice(i, 1);
        this.lastCollisionTime = this.timer;
        this.speed /= 2;
        i--;
      }
    }
  }

  checkPowerupCollisions() {
    // Check collision with jetpacks
    for (let i = 0; i < this.jetpacks.length; i++) {
      const jetpack = this.jetpacks[i]; // Direct mesh reference
      // Adjusted collision check to use the mesh directly
      if (this.isColliding(this.player.mesh, jetpack, 0.1, 4, 0.1)) {
        this.jetpackTimer = 10; // 10 seconds of jetpack
        this.player.mesh.position.y = 23;
        this.player.gravity = 0;
        this.scene.remove(jetpack); // Remove mesh directly
        this.jetpacks.splice(i, 1);
        i--;
      }
    }

    // Check collision with boots (if re-enabled)
    // for (let i = 0; i < this.boots.length; i++) {
    //   const boot = this.boots[i]; // Direct mesh reference
    //   if (this.isColliding(this.player.mesh, boot, 0.1, 0.84, 0.1)) {
    //     this.bootsTimer = 20; // 20 seconds of super jump
    //     this.player.jumpSpeed = 1.0;
    //     this.scene.remove(boot); // Remove mesh directly
    //     this.boots.splice(i, 1);
    //     i--;
    //   }
    // }
  }

  checkMysteryBoxCollision() {
    if (
      this.mysteryBox &&
      // Adjusted collision check to use the mesh directly
      this.isColliding(this.player.mesh, this.mysteryBox, 0.1, 0.35, 0.1)
    ) {
      // Note: Rotating the player/dog might not be the intended effect here.
      // Consider triggering a specific power-up or event.
      // this.player.rotation = 0; // Original logic kept for now
      // this.dog.rotation = 0; // Original logic kept for now

      // Example: Grant a random power-up or score bonus
      console.log("Mystery Box collected!");
      this.score += 50; // Example bonus
      this.scene.remove(this.mysteryBox);
      this.mysteryBox = null; // Remove after collection
    }
  }

  isColliding(obj1, obj2, xThreshold, yThreshold, zThreshold) {
    if (!obj1 || !obj2) return false;

    const pos1 = obj1.position;
    const pos2 = obj2.position;

    return (
      Math.abs(pos1.x - pos2.x) <= xThreshold &&
      Math.abs(pos1.y - pos2.y) <= yThreshold &&
      Math.abs(pos1.z - pos2.z) <= zThreshold
    );
  }

  updateTimers(delta) {
    // Update jetpack timer
    if (this.jetpackTimer > 0) {
      this.jetpackTimer -= delta;
      if (this.jetpackTimer <= 0) {
        this.jetpackTimer = -1;
        this.player.mesh.position.y = 1;
        this.player.gravity = 1;
      }
    }

    // Update boots timer
    if (this.bootsTimer > 0) {
      this.bootsTimer -= delta;
      if (this.bootsTimer <= 0) {
        this.bootsTimer = -1;
        this.player.jumpSpeed = 0.7;
      }
    }

    // Update grayscale timer
    if (this.grayscaleTimer > 0) {
      this.grayscaleTimer -= delta;
      if (this.grayscaleTimer <= 0) {
        this.grayscaleTimer = -1;
        this.isGrayscale = false;
        this.effects.removeGrayscale();
      }
    }

    // Update collision recovery timer
    if (this.lastCollisionTime > 0) {
      if (this.timer - this.lastCollisionTime >= 5) {
        // 5 seconds to recover
        this.lastCollisionTime = -1;
        this.speed = this.initialSpeed;

        // Reset inspector position if recovered
        // Add checks for inspector and player mesh before accessing position
        if (
          this.speed === this.initialSpeed &&
          this.inspector &&
          this.inspector.mesh &&
          this.player &&
          this.player.mesh
        ) {
          this.inspector.mesh.position.z = this.player.mesh.position.z + 45;
        }
      }
    }
  }

  updateDogPosition() {
    // Add checks for dog and dog.mesh before accessing position
    if (this.dog && this.dog.mesh && this.player && this.player.mesh) {
      this.dog.mesh.position.z = this.player.mesh.position.z + 7;
      this.dog.mesh.position.x = this.player.mesh.position.x;
    }
  }

  updateInspector(delta) {
    // Add checks for inspector and inspector.mesh
    if (
      this.inspector &&
      this.inspector.mesh &&
      this.player &&
      this.player.mesh
    ) {
      // Move inspector closer to player if speed is reduced
      const inspectorSpeed = this.speed < this.initialSpeed ? 0.2 : 0;
      this.inspector.mesh.position.z -= inspectorSpeed * delta * 60;

      // Check if inspector caught the player
      if (this.inspector.mesh.position.z <= this.player.mesh.position.z) {
        this.gameOver("GAME OVER! YOU HAVE BEEN CAUGHT BY INSPECTOR!");
      }
    }
  }

  updateUI() {
    document.getElementById("score").textContent = `Score: ${this.score}`;
    document.title = `Score: ${this.score}`;
  }

  toggleGrayscale() {
    this.isGrayscale = !this.isGrayscale;
    if (this.isGrayscale) {
      this.effects.applyGrayscale();
      this.grayscaleTimer = 5; // 5 seconds of grayscale
    } else {
      this.effects.removeGrayscale();
    }
  }

  gameOver(message) {
    this.isGameOver = true;
    this.speed = 0;
    alert(message);
    location.reload();
  }
}

// Helper classes
class TrackCreator {
  constructor(scene) {
    this.scene = scene;
    this.textureLoader = new THREE.TextureLoader();
    this.trackTexture = this.textureLoader.load("textures/tracks.png");
  }

  createTracks(startZ, endZ) {
    const tracks = [];
    const spacing = 12;

    for (let z = startZ; z < endZ; z += spacing) {
      // Left track
      tracks.push(this.createTrack(-5.8, -5, z));

      // Center track
      tracks.push(this.createTrack(0, -5, z));

      // Right track
      tracks.push(this.createTrack(5.8, -5, z));
    }

    return tracks;
  }

  createTrack(x, y, z) {
    const geometry = new THREE.BoxGeometry(1, 0.1, 12);
    const material = new THREE.MeshStandardMaterial({
      map: this.trackTexture,
      roughness: 0.7,
    });

    const track = new THREE.Mesh(geometry, material);
    track.position.set(x, y, z);
    track.rotation.y = Math.PI / 2;
    track.receiveShadow = true;

    this.scene.add(track);
    return track;
  }
}
