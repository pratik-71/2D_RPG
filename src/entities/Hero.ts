import Phaser from 'phaser';

export default class Hero {
  constructor(scene, x, y, playerName = 'Noobie', socketId) {
    this.scene = scene;
    this.socketId = socketId;  // Store the socketId for identifying the player
    this.sprite = scene.physics.add.sprite(x, y, 'hero');  // Hero sprite
    this.sprite.body.setSize(1, 1);  // Adjusted size
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(2);  // Ensure hero sprite is above trees

    this.createAnimations();
    this.isAttacking = false;
    this.currentDirection = 'down';

    // Add a text object for displaying the player's name
    this.nameText = this.scene.add.text(
      x,
      y - 20,
      playerName,
      { fontSize: '9px', fontFamily: 'Arial', fill: 'white', align: 'center' }
    ).setOrigin(0.5, 0.5)
     .setDepth(3);  // Set a higher depth for the name text

    // Handle attack on pointer down
    if (this.scene.socketId === this.socketId) {  // Only for the local player
      this.scene.input.on('pointerdown', this.handleAttack, this);
    }

    // Remove event listeners when the scene shuts down
    this.scene.events.on('shutdown', this.cleanupEvents, this);
  }

  // Create walk and attack animations for each direction
  createAnimations() {
    const directions = ['down', 'left', 'right', 'up'];
    const frameStarts = [0, 8, 16, 24];

    directions.forEach((dir, index) => {
      this.scene.anims.create({
        key: `walk-${dir}`,
        frames: this.scene.anims.generateFrameNumbers('hero', {
          start: frameStarts[index],
          end: frameStarts[index] + 7,
        }),
        frameRate: 15,
        repeat: -1,
      });

      this.scene.anims.create({
        key: `hero_attack-${dir}`,
        frames: this.scene.anims.generateFrameNumbers('hero_attack', {
          start: frameStarts[index],
          end: frameStarts[index] + 7,
        }),
        frameRate: 15,
        repeat: 0,
      });
    });
  }

  // Update method to control movement and animations
  update(cursors) {
    if (this.isAttacking) return;

    this.sprite.setVelocity(0);
    if (cursors.left.isDown) {
      this.sprite.setVelocityX(-200);
      this.sprite.anims.play('walk-left', true);
      this.currentDirection = 'left';
    } else if (cursors.right.isDown) {
      this.sprite.setVelocityX(200);
      this.sprite.anims.play('walk-right', true);
      this.currentDirection = 'right';
    } else if (cursors.up.isDown) {
      this.sprite.setVelocityY(-200);
      this.sprite.anims.play('walk-up', true);
      this.currentDirection = 'up';
    } else if (cursors.down.isDown) {
      this.sprite.setVelocityY(200);
      this.sprite.anims.play('walk-down', true);
      this.currentDirection = 'down';
    } else {
      this.sprite.anims.stop();
    }

    // Update the name text position above the hero’s head
    this.nameText.setPosition(this.sprite.x, this.sprite.y - 20);
  }

  // Handle attack input and animation
  handleAttack() {
    if (this.scene.socketId === this.socketId) {  // Only allow attack for the local player
      this.attack();
    }
  }

  // Attack method to handle attack animations
  attack() {
    if (this.isAttacking) return;
  
    this.isAttacking = true;
    this.sprite.setVelocity(0);
    this.sprite.anims.play(`hero_attack-${this.currentDirection}`);
  
    // Emit attack event to the server
    this.scene.socket.emit('playerAttack', {
      socketId: this.socketId,
      direction: this.currentDirection,
      x: this.sprite.x,
      y: this.sprite.y
    });
  
    // Reset attack state after the animation completes
    this.sprite.once('animationcomplete', () => {
      this.isAttacking = false;
    });
  }

  // Method to update the player's name
  updateName(newName) {
    this.nameText.setText(newName);
  }

  // Cleanup method to remove event listeners when the scene is destroyed
  cleanupEvents() {
    this.scene.input.off('pointerdown', this.handleAttack, this);
  }
}
