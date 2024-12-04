export default class Zombie {
  scene: Phaser.Scene;
  sprite: Phaser.Physics.Arcade.Sprite;
  castle: Castle;
  speed: number;
  health: number;
  isAttacking: boolean;
  currentDirection: string;
  id: string;

  constructor(scene: Phaser.Scene, x: number, y: number, castle: Castle) {
    this.scene = scene;
    this.castle = castle;  // This should correctly refer to an instance of the Castle class
    this.speed = 50;  // Adjust speed as needed
    this.health = 100;  // Adjust health as needed
    this.isAttacking = false;
    this.currentDirection = "down"; // Default direction
    this.id = Phaser.Math.RND.uuid();  // Generate unique id for the zombie

    // Ensure castle sprite is initialized before creating zombie
    if (this.castle) {  // Call checkCastleInitialization on the Castle instance
      // Create the zombie sprite and add it to the scene
      this.sprite = this.scene.physics.add.sprite(x, y, "zombie_run");
      this.sprite.body.setSize(32, 32);
      this.sprite.setCollideWorldBounds(true);
      this.sprite.setDepth(1);
      this.createAnimations();

      // Collider with the castle
      this.scene.physics.add.collider(this.sprite, this.castle.castle, () => {
        this.attackCastle();
      });
    } else {
      console.error("Castle is not initialized yet!");
      return; // Prevent zombie from being created
    }
  }

  createAnimations() {
    const directions = ['up', 'down', 'left', 'right'];
    directions.forEach(direction => {
      const walkKey = `zombie_walk-${direction}-${this.id}`;
      const attackKey = `zombie_attack-${direction}-${this.id}`;

      this.scene.anims.create({
        key: walkKey,
        frames: this.scene.anims.generateFrameNumbers('zombie_run', { prefix: 'walk-', suffix: `-${direction}` }),
        frameRate: 10,
        repeat: -1
      });

      this.scene.anims.create({
        key: attackKey,
        frames: this.scene.anims.generateFrameNumbers('zombie_attack', { prefix: 'attack-', suffix: `-${direction}` }),
        frameRate: 10,
        repeat: 0
      });
    });
  }

  update() {
    if (!this.castle.castle) return;

    // Move zombie towards castle
    this.scene.physics.moveToObject(this.sprite, this.castle.castle, this.speed);

    // Get the direction based on the movement velocity
    const velocityX = this.sprite.body.velocity.x;
    const velocityY = this.sprite.body.velocity.y;

    // Determine the direction based on velocity
    if (Math.abs(velocityX) > Math.abs(velocityY)) {
      this.currentDirection = velocityX > 0 ? "right" : "left";
    } else {
      this.currentDirection = velocityY > 0 ? "down" : "up";
    }

    // Play walking animation if not attacking
    if (!this.isAttacking) {
      this.sprite.anims.play(`zombie_walk-${this.currentDirection}-${this.id}`, true);
    }
  }

  attackCastle() {
    if (this.isAttacking) return;
    this.isAttacking = true;

    // Play attack animation when attacking the castle
    this.sprite.anims.play(`zombie_attack-${this.currentDirection}-${this.id}`);
    this.castle.takeDamage(10); // Assuming takeDamage is a method on the Castle class

    this.sprite.once("animationcomplete", () => {
      this.isAttacking = false;
    });
  }

  takeDamage(amount: number) {
    this.health -= amount;
    if (this.health <= 0) {
      this.sprite.destroy(); // Remove zombie from scene
    }
  }
}
