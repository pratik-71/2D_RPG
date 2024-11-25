import Phaser from 'phaser';

export default class Castle {
  constructor(scene, map) {
    this.scene = scene;
    this.map = map;
    this.maxHealth = 500;      // Total health
    this.castleHealth = this.maxHealth;  
    this.healthBarWidth = 200; // Width of the health bar
    this.initCastle();
  }

  initCastle() {
    // Access the object layer
    const objectLayer = this.map.getObjectLayer('castle_tiles'); // Adjust the layer name as needed

    // Find the castle object
    const castleObject = objectLayer.objects.find(obj => obj.name === 'castle_tiles');  // Ensure 'castle' is set as the name in Tiled

    if (castleObject) {
      // Create a rectangle or sprite to represent the castle
      this.castle = this.scene.add.rectangle(
        castleObject.x + castleObject.width / 2,
        castleObject.y + castleObject.height / 2,
        castleObject.width,
        castleObject.height,
        0xffffff, // Placeholder color for the castle
        1
      );

      // Health bar container (background)
      this.healthBarBg = this.scene.add.rectangle(
        100, 30,                    // Position on screen
        this.healthBarWidth, 20,    // Width, height
        0x555555                    // Dark gray for background
      ).setOrigin(0);

      // Health bar (foreground)
      this.healthBar = this.scene.add.rectangle(
        100, 30, this.healthBarWidth, 20,
        0x00ff00                    // Green for initial health
      ).setOrigin(0);
    }
  }

  updateHealthBar() {
    // Calculate the current health percentage
    const healthPercentage = Phaser.Math.Clamp(this.castleHealth / this.maxHealth, 0, 1);

    // Resize the health bar based on current health
    this.healthBar.width = this.healthBarWidth * healthPercentage;

    // Change color if health is below a threshold
    if (this.castleHealth <= 150) {
      this.healthBar.fillColor = 0xff0000;  // Red when health is low
    } else {
      this.healthBar.fillColor = 0x00ff00;  // Green otherwise
    }
  }

  takeDamage(amount) {
    this.castleHealth -= amount;
    this.updateHealthBar(); // Update health bar display

    if (this.castleHealth <= 0) {
      this.onDestroyed();
    }
  }

  onDestroyed() {
    // Handle castle destruction logic (e.g., end game)
    this.scene.add.text(300, 250, 'Game Over: Castle Destroyed!', { fontSize: '32px', fill: '#ff0000' });
    this.scene.scene.pause();  // Pause the game or trigger game-over actions
  }
}
