import Phaser from "phaser";

export default class Hero {
  constructor(scene, x, y, playerName = "Noobie", socketId, socket,players) {
    this.scene = scene;
    this.socketId = socketId; // Store the socketId for identifying the player
    this.sprite = scene.physics.add.sprite(x, y, "hero"); // Hero sprite
    this.sprite.body.setSize(1, 1); // Adjusted size
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(2); // Ensure hero sprite is above trees
    this.socket = socket;
    this.players = players;
    this.createAnimations();
    this.isAttacking = false;
    this.currentDirection = "down";

    // Add a text object for displaying the player's name
    this.nameText = this.scene.add
      .text(x, y - 20, playerName, {
        fontSize: "9px",
        fontFamily: "Arial",
        fill: "white",
        align: "center",
      })
      .setOrigin(0.5, 0.5)
      .setDepth(3); // Set a higher depth for the name text

    // Handle attack on pointer down
    if (this.scene.socketId === this.socketId) {
      this.scene.input.on("pointerdown", () => {
        this.attack();
      });
    }

    this.scene.socket.on("enemyAttack", (data) => {
      if (data.socketId !== this.socketId) {  
        this.playEnemyAttackAnimation(data);
      }
    });
  }

  // Create walk and attack animations for each direction
  createAnimations() {
    const directions = ["down", "left", "right", "up"];
    const frameStarts = [0, 8, 16, 24];

    directions.forEach((dir, index) => {
      this.scene.anims.create({
        key: `walk-${dir}`,
        frames: this.scene.anims.generateFrameNumbers("hero", {
          start: frameStarts[index],
          end: frameStarts[index] + 7,
        }),
        frameRate: 15,
        repeat: -1,
      });

      // Attack animations for each direction
      this.scene.anims.create({
        key: `hero_attack-${dir}`,
        frames: this.scene.anims.generateFrameNumbers("hero_attack", {
          start: frameStarts[index],
          end: frameStarts[index] + 7, // Adjust end frame to match the attack animation
        }),
        frameRate: 15,
        repeat: 0, // Ensure the attack animation doesn't loop
      });
    });

    console.log("Attack animations created");
  }

  // Update method to control movement and animations
  update(cursors) {
    const { sprite } = this;
    let isMoving = false;
    if (this.isAttacking) return;
    sprite.setVelocity(0); // Reset velocity

    if (cursors.left.isDown) {
      this.move("left", -200, 0);
      isMoving = true;
    } else if (cursors.right.isDown) {
      this.move("right", 200, 0);
      isMoving = true;
    } else if (cursors.up.isDown) {
      this.move("up", 0, -200);
      isMoving = true;
    } else if (cursors.down.isDown) {
      this.move("down", 0, 200);
      isMoving = true;
    } else {
      sprite.anims.stop();
    }
    if (isMoving !== this.wasMoving || this.positionChanged()) {
      this.sendPositionUpdate(isMoving);
    }
    this.nameText.setPosition(sprite.x, sprite.y - 20);
    this.wasMoving = isMoving; // Track movement state
  }

  // Helper method to handle movement and animation
  move(direction, vx, vy) {
    this.sprite.setVelocity(vx, vy);
    this.sprite.anims.play(`walk-${direction}`, true);
    this.currentDirection = direction;
  }

  // Send position update to the server
  sendPositionUpdate(isMoving) {
    this.scene.socket.emit("updatePlayerPosition", {
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
    return Math.abs(dx) > 1 || Math.abs(dy) > 1; // Update threshold
  }

  // Attack method to handle attack animations
  attack() {
    this.isAttacking = true; // Prevent additional attacks
    this.sprite.setVelocity(0); // Stop movement during attack
    this.sprite.anims.play(`hero_attack-${this.currentDirection}`); // Play attack animation

    this.scene.socket.emit("playerAttack", {
      socketId: this.socketId,
      x: this.sprite.x,
      y: this.sprite.y,
      direction: this.currentDirection,
      attackAnimationKey: `hero_attack-${this.currentDirection}`,
      roomCode: this.scene.roomCode,
    });

    // Reset attack state after animation completes
    this.sprite.once("animationcomplete", () => {
      this.isAttacking = false; // Allow new attacks after animation
      console.log("Attack animation complete");
    });
  }

  // Play the enemy attack animation on the existing sprite
  playEnemyAttackAnimation(data) {
    // Find the enemy using the 'id' field, which matches the socketId in the data
    const enemy = this.players.find(player => player.id === data.socketId);
    
    console.log(enemy);
    console.log("----------");
    console.log(this.players);
    
    if (enemy) {
      this.sprite.anims.play(data.attackAnimationKey);
      console.log(`Enemy ${data.socketId} is attacking in ${data.direction} direction`);
    } else {
      console.log(`Enemy with socketId ${data.socketId} not found.`);
    }
  }
  
  updateName(newName) {
    this.nameText.setText(newName);
  }
}
