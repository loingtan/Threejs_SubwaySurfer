import * as THREE from "three";
export class Controls {
  constructor(game) {
    this.game = game;
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  handleKeyDown(e) {
    // Start the game if it's not already started
    // Add checks for player/inspector mesh existence
    if (
      this.game.speed === 0 &&
      e.keyCode &&
      this.game.player &&
      this.game.player.mesh && // Check player mesh
      this.game.inspector &&
      this.game.inspector.mesh // Check inspector mesh
    ) {
      this.game.speed = this.game.initialSpeed * 1.2;
      // Now it's safe to access positions
      this.game.inspector.mesh.position.z =
        this.game.player.mesh.position.z + 45;
    }

    // Add check for player mesh before handling movement/jump keys
    if (!this.game.player || !this.game.player.mesh) {
      return; // Don't process input if player mesh isn't ready
    }

    switch (e.keyCode) {
      case 37: // Left arrow
        this.game.player.moveLeft(this.game.lanes);
        break;

      case 39: // Right arrow
        this.game.player.moveRight(this.game.lanes);
        break;

      case 32: // Space bar (jump)
        if (this.game.jetpackTimer === -1) {
          // Only jump if not using jetpack
          this.game.player.jump();
        }
        break;

      case 71: // G key (grayscale effect)
        this.game.toggleGrayscale();
        break;
    }
  }
}
