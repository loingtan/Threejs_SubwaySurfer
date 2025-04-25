import * as THREE from "three";
import { Game } from "./game.js";

let scene, camera, renderer;
let game;

function init() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Sky blue

  // Create camera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Handle window resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Initialize game
  game = new Game(scene, camera);
  game.init();

  // Start background music
  // document.getElementById("background_music").play();

  // // Start animation loop
  animate();
}

function animate() {
  requestAnimationFrame(animate);

  // Update game state
  if (game) {
    game.update();
  }

  // Render scene
  renderer.render(scene, camera);
}

// Start the game when page loads
window.addEventListener("load", init);
