import Phaser from 'phaser';

export default class Hero {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'hero');

    // Set the collision box to be exactly 16x16 and centered
    this.sprite.body.setSize(1, 1);
    // this.sprite.body.setOffset(0, 0);

    // Prevent the hero from going off-screen
    this.sprite.setCollideWorldBounds(true);

    // Create hero animations
    this.createAnimations();
    this.isAttacking = false;
    this.currentDirection = 'down';  // Default direction

    // Listen for mouse clicks to trigger the attack
    this.scene.input.on('pointerdown', () => {
      this.attack();
    });
  }

  createAnimations() {
    const directions = ['down', 'left', 'right', 'up'];
    const frameStarts = [0, 8, 16, 24];

    // Walking animations for each direction
    directions.forEach((dir, index) => {
      this.scene.anims.create({
        key: `walk-${dir}`,
        frames: this.scene.anims.generateFrameNumbers('hero', {
          start: frameStarts[index],
          end: frameStarts[index] + 7,
        }),
        frameRate: 10,
        repeat: -1,
      });
    });

    // Attack animations (Sword_hero_attack_full)
    directions.forEach((dir, index) => {
      this.scene.anims.create({
        key: `hero_attack-${dir}`,
        frames: this.scene.anims.generateFrameNumbers('hero_attack', {
          start: frameStarts[index],
          end: frameStarts[index] + 7,
        }),
        frameRate: 30,
        repeat: 0, // Play once
      });
    });
  }

  update(cursors) {
    if (this.isAttacking) return; // Stop movement during attack

    // Reset velocity before handling movement
    this.sprite.setVelocity(0);

    // Check for movement input and update direction and animation
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
      this.sprite.anims.stop(); // Stop any walking animation when idle
    }

    // Check collisions and adjust the movement as needed
    this.scene.physics.world.collide(this.sprite, this.scene.boundaryLayer, this.handleCollision, null, this);
  }

  handleCollision(hero, boundary) {
    // When a collision happens, stop the hero from moving
    // You can also fine-tune the velocity if needed to make it stop at the boundary correctly
    if (hero.x < boundary.x) {
      hero.setVelocityX(0); // Prevent movement on the X axis if hitting boundary
    }
    if (hero.y < boundary.y) {
      hero.setVelocityY(0); // Prevent movement on the Y axis if hitting boundary
    }
  }

  attack() {
    if (this.isAttacking) return; // Prevent multiple attacks at once

    this.isAttacking = true;

    // Stop movement immediately when attacking
    this.sprite.setVelocity(0);
    this.sprite.anims.stop();

    const attackAnim = `hero_attack-${this.currentDirection || 'down'}`;
    this.sprite.anims.play(attackAnim);

    // Reset after attack animation completes
    this.sprite.once('animationcomplete', () => {
      this.isAttacking = false;
    });
  }
}
