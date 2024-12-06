import EventBus from "../EventBus";

export default class Zombie {
  scene: Phaser.Scene;
  sprite: Phaser.Physics.Arcade.Sprite;
  detectionRadius: Phaser.GameObjects.Zone;
  detectionGraphics: Phaser.GameObjects.Graphics;
  castle: Castle;
  speed: number;
  health: number;
  isAttacking: boolean;
  currentDirection: string;
  target: Phaser.Physics.Arcade.Sprite | Castle;
  id: string;
  attackCooldown: number; // Time in milliseconds between attacks
  lastAttackTime: number; // Tracks the last time the zombie attacked

  constructor(scene: Phaser.Scene, x: number, y: number, castle: Castle) {
    this.scene = scene;
    this.castle = castle;
    this.speed = 30;
    this.health = 100;
    this.isAttacking = false;
    this.currentDirection = "down";
    this.id = Phaser.Math.RND.uuid();
    this.target = this.castle.castle; // Default target is the castle
    this.attackCooldown = 3000; // 3 seconds cooldown for attacks
    this.lastAttackTime = 0; // Initialize the last attack time

    // Create zombie sprite
    this.sprite = this.scene.physics.add.sprite(x, y, "zombie_run");
    this.sprite.body.setSize(32, 32);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(1);
    this.createAnimations();

    // Create detection zone
    this.detectionRadius = this.scene.add.zone(x, y).setSize(200, 200);
    this.scene.physics.world.enable(this.detectionRadius);
    (this.detectionRadius.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (this.detectionRadius.body as Phaser.Physics.Arcade.Body).setImmovable(true);

    this.detectionGraphics = this.scene.add.graphics();
    this.detectionGraphics.lineStyle(2, 0x00ff00, 1);
    this.detectionGraphics.strokeCircle(this.detectionRadius.x, this.detectionRadius.y, 100);

    // Hero detection using update method instead of overlap
    if (this.scene.heroGroup) {
      this.scene.events.on("update", this.detectHeroes, this);
    } else {
      console.warn("Hero group is not initialized.");
    }

    // Collision with castle
    this.scene.physics.add.collider(this.sprite, this.castle.castle, () => {
      this.attackCastle();
    });
  }

  createAnimations() {
    const directions = ["up", "down", "left", "right"];

    directions.forEach((direction) => {
      const walkKey = `zombie_walk-${direction}`;
      const attackKey = `zombie_attack-${direction}`;

      this.scene.anims.create({
        key: walkKey,
        frames: this.scene.anims.generateFrameNumbers("zombie_run", {
          start: 0,
          end: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });

      this.scene.anims.create({
        key: attackKey,
        frames: this.scene.anims.generateFrameNumbers("zombie_attack", {
          start: 0,
          end: 3,
        }),
        frameRate: 10,
        repeat: 0,
      });
    });
  }

  update() {
    if (!this.sprite || !this.sprite.body || !this.target) return;

    // Sync detection zone position
    this.detectionRadius.x = this.sprite.x;
    this.detectionRadius.y = this.sprite.y;
    this.detectionGraphics.clear();
    this.detectionGraphics.strokeCircle(this.detectionRadius.x, this.detectionRadius.y, 100);

    const { x: targetX, y: targetY } = this.target;
    const deltaX = targetX - this.sprite.x;
    const deltaY = targetY - this.sprite.y;

    // Determine movement direction
    this.currentDirection =
      Math.abs(deltaX) > Math.abs(deltaY)
        ? deltaX > 0
          ? "right"
          : "left"
        : deltaY > 0
        ? "down"
        : "up";

    if (!this.isAttacking) {
      this.scene.physics.moveToObject(this.sprite, this.target, this.speed);
      this.sprite.anims.play(`zombie_walk-${this.currentDirection}`, true);
    }

    // If the zombie is within attack range of the target (hero or castle)
    if (Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.target.x, this.target.y) < 50) {
      if (this.target instanceof Phaser.Physics.Arcade.Sprite) {
        this.attackHero(); // Trigger hero attack
      } else {
        this.attackCastle(); // Trigger castle attack
      }
    }
}
  detectHeroes() {
    this.scene.heroGroup.getChildren().forEach((child: Phaser.GameObjects.Sprite) => {
      if (child instanceof Phaser.Physics.Arcade.Sprite) {
        const distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, child.x, child.y);
        if (distance < 100) {
          this.target = child;  
          console.log("Hero detected:", child);
        } else if (distance > 100 || child.health <= 0) {
          this.target = this.castle.castle; // Return to the castle if the hero is out of range or dead
        }
      }
    });
  }

  attackHero() {
    if (this.isAttacking || !(this.target instanceof Phaser.Physics.Arcade.Sprite)) return;

    // Play attack animation and deal damage
    this.isAttacking = true;
    this.sprite.anims.play(`zombie_attack-${this.currentDirection}`);
    this.scene.time.delayedCall(300, () => {
      EventBus.emit('zombieAttack', this.target, 5); // Deal 5 damage
    });

    this.sprite.once("animationcomplete", () => {
      this.isAttacking = false; // Allow new attacks after animation
    });
  }

  attackCastle() {
    if (this.isAttacking) return;
    this.isAttacking = true;
    this.sprite.anims.play(`zombie_attack-${this.currentDirection}`);
    this.castle.takeDamage(5); // Ensure castle has a `takeDamage` method
    this.sprite.once("animationcomplete", () => {
      this.isAttacking = false;
    });
  }

  takeDamage(amount: number) {
    this.health -= amount;
    if (this.health <= 0) {
      this.sprite.destroy();
      this.detectionRadius.destroy();
      this.detectionGraphics.destroy();
      this.scene.events.off("update", this.detectHeroes, this);
    }
  }
}
