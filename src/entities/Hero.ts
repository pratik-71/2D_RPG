import Phaser from 'phaser';

export default class Hero {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'hero'); // Hero sprite
    this.sprite.setCollideWorldBounds(true);  // Keep within world bounds

    this.createAnimations(); // Set up animations
  }

  createAnimations() {
    const directions = ['down', 'left', 'right', 'up'];
    const frameStarts = [0, 8, 16, 24]; // Each row starts at these frames (8 frames per row)

    directions.forEach((dir, index) => {
      this.scene.anims.create({
        key: `walk-${dir}`,
        frames: this.scene.anims.generateFrameNumbers('hero', { 
          start: frameStarts[index], 
          end: frameStarts[index] + 7 
        }),
        frameRate: 10,   // Animation speed
        repeat: -1       // Loop the animation
      });
    });
  }

  update(cursors) {
    this.sprite.setVelocity(0);  // Reset velocity every frame

    // Move and play animations based on key input
    if (cursors.left.isDown) {
      this.sprite.setVelocityX(-100);
      this.sprite.anims.play('walk-left', true);
    } else if (cursors.right.isDown) {
      this.sprite.setVelocityX(100);
      this.sprite.anims.play('walk-right', true);
    } else if (cursors.up.isDown) {
      this.sprite.setVelocityY(-100);
      this.sprite.anims.play('walk-up', true);
    } else if (cursors.down.isDown) {
      this.sprite.setVelocityY(100);
      this.sprite.anims.play('walk-down', true);
    } else {
      this.sprite.anims.stop();  // Stop animation when no key is pressed
    }
  }
}
