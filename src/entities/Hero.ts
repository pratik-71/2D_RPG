import Phaser from 'phaser';

export default class Hero {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'hero');
    this.sprite.setCollideWorldBounds(true);

    this.createAnimations();
    this.isAttacking = false;

    // Listen for mouse clicks
    this.scene.input.on('pointerdown', () => {
      this.attack();
    });
  }

  createAnimations() {
    const directions = ['down', 'left', 'right', 'up'];
    const frameStarts = [0, 8, 16, 24];

    // Walking animations
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
        frameRate: 10,
        repeat: 0, // Play once
      });
    });
  }

  update(cursors) {
    if (this.isAttacking) return; // Stop movement during attack

    this.sprite.setVelocity(0);

    if (cursors.left.isDown) {
      this.sprite.setVelocityX(-100);
      this.sprite.anims.play('walk-left', true);
      this.currentDirection = 'left';
    } else if (cursors.right.isDown) {
      this.sprite.setVelocityX(100);
      this.sprite.anims.play('walk-right', true);
      this.currentDirection = 'right';
    } else if (cursors.up.isDown) {
      this.sprite.setVelocityY(-100);
      this.sprite.anims.play('walk-up', true);
      this.currentDirection = 'up';
    } else if (cursors.down.isDown) {
      this.sprite.setVelocityY(100);
      this.sprite.anims.play('walk-down', true);
      this.currentDirection = 'down';
    } else {
      this.sprite.anims.stop(); // Stop any walking animation when idle
    }
  }

  attack() {
    if (this.isAttacking) return; // Prevent multiple attacks at once

    this.isAttacking = true;

    // Stop movement immediately when attacking
    this.sprite.setVelocity(0);
    this.sprite.anims.stop();

    const attackAnim = `hero_attack-${this.currentDirection || 'down'}`; // Default to 'down'
    this.sprite.anims.play(attackAnim);

    this.sprite.once('animationcomplete', () => {
      this.isAttacking = false; // Reset state after animation completes
    });
  }
}
