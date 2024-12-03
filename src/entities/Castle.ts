import Phaser from 'phaser';
import { toast } from 'react-toastify'; // Ensure toastify is imported

export default class Castle {
  constructor(scene, map) {
    this.scene = scene;
    this.map = map;
    this.health = 500;
    this.healthBarVisible = false; // Track visibility of health bar
    this.healthBarTimer = null;
    this.initCastle();
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
    this.castle.body.setSize(castleObject.width, castleObject.height);
    this.createHealthBar(centerX, centerY - 60);
    this.healthBar.setVisible(false);
  }

  createHealthBar(x, y) {
    this.healthBar = this.scene.add.graphics();
    this.healthBar.setDepth(10);
    this.updateHealthBar(x, y);
  }

  updateHealthBar(x, y) {
    this.healthBar.clear();
    this.healthBar.fillStyle(0x666666);
    this.healthBar.fillRect(x - 50, y, 100, 5); 
    this.healthBar.fillStyle(0x00ff00);
    const healthWidth = (this.health / 500) * 100;
    this.healthBar.fillRect(x - 50, y, healthWidth, 5);
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health < 0) this.health = 0;

    this.updateHealthBar(this.castle.x, this.castle.y - 60);
    this.showHealthBar(); // Show the health bar temporarily

    // Show toast notification
    toast.warning('Castle under attack!', {
      position: "top-center",
      autoClose: 2000, // Display for 2 seconds
      hideProgressBar: true,
      closeOnClick: false,
      closeButton: false,
    });

    if (this.health <= 0) {
      this.destroyCastle();
    }
  }

  showHealthBar() {
    if (!this.healthBarVisible) {
      this.healthBar.setVisible(true);
      this.healthBarVisible = true;

      // Hide the health bar after 2 seconds
      if (this.healthBarTimer) {
        clearTimeout(this.healthBarTimer);
      }
      this.healthBarTimer = setTimeout(() => {
        this.healthBar.setVisible(false);
        this.healthBarVisible = false;
      }, 2000);
    }
  }

  destroyCastle() {
    console.log('The castle has been destroyed!');
    this.castle.destroy();
    this.healthBar.destroy();
    
    // Call game over method
    this.showGameOverScreen();
  }

  showGameOverScreen() {
    this.scene.input.enabled = false;
    this.scene.physics.pause();
    this.scene.cameras.main.setRenderToTexture(); 
    const { width, height } = this.scene.cameras.main;
    const background = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    background.setDepth(100);
    const gameOverText = this.scene.add.text(width / 2, height / 2 - 50, 'Game Over', {
      fontSize: '48px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101);
    const mainMenuButton = this.scene.add.text(width / 2, height / 2 + 20, 'Main Menu', {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#ff0000',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setOrigin(0.5).setDepth(101).setInteractive();
    mainMenuButton.on('pointerdown', () => {
      this.scene.scene.start('MainMenu'); // Ensure 'MainMenu' is a valid scene
    });
  }
}
