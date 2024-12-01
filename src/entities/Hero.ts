import Phaser from 'phaser';

export default class Hero {
  constructor(scene, x, y, playerName = 'Noobie', socketId,socket) {
    this.scene = scene;
    this.socketId = socketId;  // Store the socketId for identifying the player
    this.sprite = scene.physics.add.sprite(x, y, 'hero');  // Hero sprite
    this.sprite.body.setSize(1, 1);  // Adjusted size
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(2);  // Ensure hero sprite is above trees
    this.socket = socket
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
    const { sprite } = this;
    let isMoving = false;
    
    sprite.setVelocity(0);  // Reset velocity
    
    if (cursors.left.isDown) {
      this.move('left', -200, 0);
      isMoving = true;
    } else if (cursors.right.isDown) {
      this.move('right', 200, 0);
      isMoving = true;
    } else if (cursors.up.isDown) {
      this.move('up', 0, -200);
      isMoving = true;
    } else if (cursors.down.isDown) {
      this.move('down', 0, 200);
      isMoving = true;
    } else {
      sprite.anims.stop();  // Stop animation when no movement
    }
  
    // Only send data if position or movement state changes
    if (isMoving !== this.wasMoving || this.positionChanged()) {
      this.sendPositionUpdate(isMoving);
    }
  
    this.nameText.setPosition(sprite.x, sprite.y - 20);
    this.wasMoving = isMoving;  // Track movement state
  }
  
  // Helper method to handle movement and animation
  move(direction, vx, vy) {
    this.sprite.setVelocity(vx, vy);
    this.sprite.anims.play(`walk-${direction}`, true);
    this.currentDirection = direction;
  }
  
  // Send position update to the server
  sendPositionUpdate(isMoving) {
    this.scene.socket.emit('updatePlayerPosition', {
      playerName: this.nameText.text,
      x: this.sprite.x,
      y: this.sprite.y,
      direction: this.currentDirection,
      isMoving: isMoving,
      roomCode: this.scene.roomCode,
    });
  }
  
  // Check if position has changed significantly
  positionChanged() {
    const dx = this.sprite.x - (this.lastX || 0);
    const dy = this.sprite.y - (this.lastY || 0);
    this.lastX = this.sprite.x;
    this.lastY = this.sprite.y;
    return Math.abs(dx) > 1 || Math.abs(dy) > 1;  // Update threshold
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
