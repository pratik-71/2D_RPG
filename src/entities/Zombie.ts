import Phaser from "phaser";

export default class Zombie {
  constructor(scene, x, y) {
    if (!scene) {
      console.error("Scene is not provided or is null");
      return; // Exit early if scene is invalid
    }

    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'zombie_run'); // Only spawn the sprite
    this.sprite.setCollideWorldBounds(true); // Ensures the sprite stays within the world bounds
  }

  // Static method to spawn a zombie from backend data
  static spawnFromBackend(scene, zombieData) {
    if (!scene) {
      console.error("Scene is null while spawning zombie");
      return null;
    }
    const { x, y } = zombieData; // Only use x, y for spawn
    return new Zombie(scene, x, y); 
  }
}
