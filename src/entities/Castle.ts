import Phaser from 'phaser';

export default class Castle {
  scene: Phaser.Scene;
  map: Phaser.Tilemaps.Tilemap;
  castle: Phaser.Physics.Arcade.Sprite | null;
  socket: any;
  roomCode: string;
  isCastleInitialized: boolean;
  health: number;  // Castle's health
  healthBar: Phaser.GameObjects.Graphics | null;  // Health bar graphic
  gameOverText: Phaser.GameObjects.Text | null;  // Game Over text
  mainMenuButton: Phaser.GameObjects.Text | null;  // Main Menu button

  constructor(scene, map, socket, roomCode) {
    this.socket = socket;
    this.roomCode = roomCode;
    this.scene = scene;
    this.map = map;
    this.castle = null;  
    this.isCastleInitialized = false;
    this.health = 5;  // Full health for the castle
    this.healthBar = null;  // Initially no health bar
    this.gameOverText = null;  // Initially no game over text
    this.mainMenuButton = null;  // Initially no button
    this.initCastle();  // Initialize the castle
  }

  initCastle() {
    const objectLayer = this.map.getObjectLayer('castle_tiles');
    const castleObject = objectLayer.objects.find(obj => obj.name === 'castle');

    if (!castleObject) {
      console.error('Castle object not found in object layer');
      return;
    }

    const centerX = this.map.widthInPixels / 2;
    const centerY = this.map.heightInPixels / 2;
    this.castle = this.scene.physics.add.sprite(centerX, centerY, 'castle_tiles');
    this.castle.setImmovable(true);

    // Make sure the castle exists before accessing it
    if (this.castle) {
      this.castle.body.setSize(castleObject.width, castleObject.height);
      this.isCastleInitialized = true;

      // Emit the deployEnemy event once the castle is initialized
      if (this.socket) {
        this.socket.emit('deployEnemy', { roomCode: this.roomCode });
      } else {
        console.error('Socket is undefined');
      }

      // Create and position the health bar above the castle
      this.createHealthBar();
    } else {
      console.error('Castle sprite could not be initialized');
    }
  }

  createHealthBar() {
    if (this.castle) {
      const width = this.castle.width;  // Width of the castle sprite
      const height = 10;  // Height of the health bar

      // Position the health bar above the castle sprite
      this.healthBar = this.scene.add.graphics();
      this.healthBar.setPosition(this.castle.x - width / 2, this.castle.y - this.castle.height / 2 - height);

      // Draw the health bar (background and fill)
      this.healthBar.fillStyle(0x000000, 1);  // Background (black)
      this.healthBar.fillRect(0, 0, width, height);

      this.updateHealthBar();
    }
  }

  updateHealthBar() {
    if (this.castle && this.healthBar) {
      const width = this.castle.width;
      const height = 3;
      const healthPercentage = this.health / 300;
      this.healthBar.clear();
      this.healthBar.fillStyle(0x000000, 1);
      this.healthBar.fillRect(0, 0, width, height);
      this.healthBar.fillStyle(0xff0000, 1);  // Red color for health bar
      this.healthBar.fillRect(0, 0, width * healthPercentage, height);  // Adjust fill based on health
    }
  }

  // Method to handle damage taken by the castle
  takeDamage(amount: number) {
    if (this.castle) {
      this.health -= amount;  // Decrease health
      if (this.health <= 0) {
        this.health = 0;
        this.castle.destroy();  // Destroy the castle when health reaches 0
        this.stopGame();  // Stop the game activities
        console.log("Castle destroyed!");
      }
      this.updateHealthBar();  // Update the health bar when damage is taken

      // Show the health bar only after the first hit
      if (this.healthBar && this.health < 300) {
        this.healthBar.setVisible(true);
      }
    }
  }

  stopGame() {
    if (this.scene) {
      // Pause all physics activity
      this.scene.physics.world.pause();
  
      // Hide or disable all interactive objects
      this.scene.children.list.forEach((child) => {
        if (child.setVisible) child.setVisible(false); // Hide objects like trees, enemies, etc.
        if (child.body) child.body.enable = false;     // Disable physics bodies
      });
  
      // Create a semi-transparent blur effect
      if (!this.blurScreen) {
        this.blurScreen = this.scene.add.graphics();
        this.blurScreen.fillStyle(0x000000, 0.8);  // Dark semi-transparent background
        this.blurScreen.fillRect(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height);
      }
  
      // Show "Game Over" message
      if (!this.gameOverText) {
        this.gameOverText = this.scene.add.text(
          this.scene.cameras.main.centerX+60,
          this.scene.cameras.main.centerY+100,
          'Game Over',
          { fontSize: '48px', fill: '#ff0000', fontFamily: 'Arial' }
        );
        this.gameOverText.setOrigin(0.5,0.5);  
      }
  
      // Add Main Menu button
      if (!this.mainMenuButton) {
        this.mainMenuButton = this.scene.add.text(
          this.scene.cameras.main.centerX+60,
          this.scene.cameras.main.centerY + 150,
          'Main Menu',
          { fontSize: '32px', fill: '#00ff00', fontFamily: 'Arial' }
        );
        this.mainMenuButton.setOrigin(0.5, 0.5);
        this.mainMenuButton.setInteractive();
  
        // Handle Main Menu button click
        this.mainMenuButton.on('pointerdown', () => {
          this.scene.scene.start('MainMenu');  // Restart or navigate to Main Menu
        });
      }
    }
    this.socket.emit("deleteRoom",{roomCode:this.roomCode})
  }
  checkCastleInitialization() {
    return this.isCastleInitialized;
  }
}
