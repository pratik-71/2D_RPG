import Phaser from 'phaser';

export default class Hero {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'hero');

    this.sprite.body.setSize(1, 1);  // Adjusted size
    this.sprite.setCollideWorldBounds(true);
    this.createAnimations();
    this.isAttacking = false;
    this.currentDirection = 'down';

    this.scene.input.on('pointerdown', () => {
      this.attack();
    });
  }

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
  }

  attack() {
    if (this.isAttacking) return;

    this.isAttacking = true;
    this.sprite.setVelocity(0);
    this.sprite.anims.play(`hero_attack-${this.currentDirection}`);

    // Reset attack state after the animation completes
    this.sprite.once('animationcomplete', () => {
      this.isAttacking = false;
    });
  }
}
