import Phaser from 'phaser';
import EventBus from '../EventBus';
import '../App.css'

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
    this.health = 300;  // Full health for the castle
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
    if (this.castle) {
      this.castle.body.setSize(castleObject.width, castleObject.height);
      this.isCastleInitialized = true;
      if (this.socket) {
        this.socket.emit('deployEnemy', { roomCode: this.roomCode });
      } else {
        console.error('Socket is undefined');
      }
      this.createHealthBar();
    } else {
      console.error('Castle sprite could not be initialized');
    }
  }

  createHealthBar() {
    if (this.castle) {
      const width = this.castle.width;  // Width of the castle sprite
      const height = 10;  
      this.healthBar = this.scene.add.graphics();
      this.healthBar.setPosition(this.castle.x - width / 2, this.castle.y - this.castle.height / 2 - height);
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
      EventBus.emit("updateCastleHealth",amount)
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
      // Pause the physics world
      this.scene.physics.world.pause();
  
      // Hide all objects in the scene (trees, enemies, etc.)
      this.scene.children.list.forEach((child) => {
        if (child.setVisible) child.setVisible(false); // Hide objects
        if (child.body) child.body.enable = false;     // Disable physics bodies
      });
  
      // Create blur screen only once
      if (!this.blurScreen) {
        this.blurScreen = this.scene.add.graphics();
        this.blurScreen.fillStyle(0x000000, 0.8);  // Dark semi-transparent background
        this.blurScreen.fillRect(0, 0, this.scene.sys.game.config.width, this.scene.sys.game.config.height);  // Fill screen
      }
  
      // Create the Game Over message using HTML
      if (!this.gameOverText) {
        this.gameOverText = document.createElement('div');
        this.gameOverText.innerHTML = 'Game Over';
        this.gameOverText.style.position = 'absolute';
        this.gameOverText.style.top = '40%';  // Vertical centering
        this.gameOverText.style.left = '50%'; // Horizontal centering
        this.gameOverText.style.transform = 'translate(-50%, -50%)'; // Adjust position for exact centering
        this.gameOverText.style.fontSize = '48px';
        this.gameOverText.style.color = '#ff0000';
        this.gameOverText.style.fontFamily = 'Arial';
        this.gameOverText.style.zIndex = '1000'; // Make sure it's above the game canvas
        document.body.appendChild(this.gameOverText);  // Add it to the document body
      }
  
      // Create the Main Menu button using HTML
      if (!this.mainMenuButton) {
        this.mainMenuButton = document.createElement('button');
        this.mainMenuButton.innerHTML = 'Main Menu';
        this.mainMenuButton.style.position = 'absolute';
        this.mainMenuButton.style.top = 'calc(40% + 50px)';  // Below the 'Game Over' text
        this.mainMenuButton.style.left = '50%';  // Horizontal centering
        this.mainMenuButton.style.transform = 'translateX(-50%)'; // Center horizontally
        this.mainMenuButton.style.fontSize = '32px';
        this.mainMenuButton.style.color = '#00ff00';
        this.mainMenuButton.style.backgroundColor = 'transparent';
        this.mainMenuButton.style.border = '2px solid #00ff00';
        this.mainMenuButton.style.padding = '10px 20px';
        this.mainMenuButton.style.zIndex = '1000';  // Make sure it's above the game canvas
  
        // Button click action to restart or navigate to the Main Menu
        this.mainMenuButton.addEventListener('click', () => {
          this.scene.scene.start('MainMenu');  // Restart or navigate to Main Menu
        });
  
        document.body.appendChild(this.mainMenuButton);  // Add it to the document body
      }
    }
  
    // Emit event to delete the room
    this.socket.emit("deleteRoom", { roomCode: this.roomCode });
  }
  
  
  
  
  checkCastleInitialization() {
    return this.isCastleInitialized;
  }
}
