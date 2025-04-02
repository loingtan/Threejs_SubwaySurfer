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

  init() {
    // Setup scene
    this.setupLights();
    this.setupEnvironment();

    // Create game objects
    this.createPlayer();
    this.createInspector();
    this.createDog();
    this.createTracks();
    this.createObstacles();
    this.createCollectibles();

    // Start gameplay
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
    this.player = new Player(this.scene, this.lanes[1]); // Start in center lane
    this.camera.position.set(0, 8.5, this.player.mesh.position.z + 20);
    this.camera.lookAt(0, 0, this.player.mesh.position.z);
  }

  createInspector() {
    this.inspector = new Inspector(this.scene, 0, 1.0, 125);
    this.inspector.mesh.rotation.y = Math.PI;
  }

  createDog() {
    this.dog = new Dog(this.scene, 0, 0, 0);
    this.dog.mesh.rotation.y = Math.PI;
  }

  createTracks() {
    const trackCreator = new TrackCreator(this.scene);
    this.tracks = trackCreator.createTracks(-200, 200); // Create tracks from z=-200 to z=200
  }

  createObstacles() {
    const obstacleCreator = new ObstacleCreator(this.scene, this.lanes);

    // Create trains
    this.trains = obstacleCreator.createTrains();

    // Create barriers
    this.barriers = obstacleCreator.createBarriers();

    // Create cones
    this.cones = obstacleCreator.createCones();

    // Create barrels
    this.barrels = obstacleCreator.createBarrels();
  }

  createCollectibles() {
    const collectibleCreator = new CollectibleCreator(this.scene, this.lanes);

    // Create coins
    this.coins = collectibleCreator.createCoins();

    // Create jetpacks
    this.jetpacks = collectibleCreator.createJetpacks();

    // // Create boots
    // this.boots = collectibleCreator.createBoots();

    // Create mystery box
    this.mysteryBox = collectibleCreator.createMysteryBox();
  }

  update() {
    if (this.isGameOver) return;

    const delta = this.clock.getDelta();
    this.timer += delta;

    // Update player
    this.player.update(delta);

    // Update camera position to follow player
    this.updateCamera();

    // Move all objects backwards to simulate player moving forward
    this.moveObjects(delta);

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
    if (this.jetpackTimer > 0) {
      this.camera.position.set(0, 11.5, this.player.mesh.position.z + 25);
      this.camera.lookAt(0, 8, this.player.mesh.position.z);
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
      if (object.mesh) {
        object.mesh.position.z += distance;
      } else if (object.position) {
        object.position.z += distance;
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
      const coin = this.coins[i];
      if (this.isColliding(this.player.mesh, coin.mesh, 0.2, 0.2, 0.2)) {
        // Play coin sound
        const coinSound = document.getElementById("coin_sound");
        coinSound.currentTime = 0;
        coinSound.play();

        // Add score and remove coin
        this.score += 10;
        this.scene.remove(coin.mesh);
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
        this.isColliding(this.player.mesh, this.cones[i].mesh, 0.1, 1.33, 2)
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
      if (
        this.isColliding(this.player.mesh, this.jetpacks[i].mesh, 0.1, 4, 0.1)
      ) {
        this.jetpackTimer = 10; // 10 seconds of jetpack
        this.player.mesh.position.y = 23;
        this.player.gravity = 0;
        this.scene.remove(this.jetpacks[i].mesh);
        this.jetpacks.splice(i, 1);
        i--;
      }
    }

    // Check collision with boots
    for (let i = 0; i < this.boots.length; i++) {
      if (
        this.isColliding(this.player.mesh, this.boots[i].mesh, 0.1, 0.84, 0.1)
      ) {
        this.bootsTimer = 20; // 20 seconds of super jump
        this.player.jumpSpeed = 1.0;
        this.scene.remove(this.boots[i].mesh);
        this.boots.splice(i, 1);
        i--;
      }
    }
  }

  checkMysteryBoxCollision() {
    if (
      this.mysteryBox &&
      this.isColliding(this.player.mesh, this.mysteryBox, 0.1, 0.35, 0.1)
    ) {
      this.player.rotation = 0;
      this.dog.rotation = 0;
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
        if (this.speed === this.initialSpeed) {
          this.inspector.mesh.position.z = this.player.mesh.position.z + 45;
        }
      }
    }
  }

  updateDogPosition() {
    if (this.dog) {
      this.dog.mesh.position.z = this.player.mesh.position.z + 7;
      this.dog.mesh.position.x = this.player.mesh.position.x;
    }
  }

  updateInspector(delta) {
    if (this.inspector) {
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
