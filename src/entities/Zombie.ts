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
    this.speed = 30;  // Adjust speed as needed
    this.health = 100;  // Adjust health as needed
    this.isAttacking = false;
    this.currentDirection = "down"; // Default direction
    this.id = Phaser.Math.RND.uuid();
    
    if (this.castle) {
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
      return;
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
    // Check if the sprite or castle is destroyed or inactive
    if (!this.sprite || !this.sprite.body || !this.castle.castle) return;
  
    const targetX = this.castle.castle.x;
    const targetY = this.castle.castle.y;
    const zombieX = this.sprite.x;
    const zombieY = this.sprite.y;
  
    const deltaX = targetX - zombieX;
    const deltaY = targetY - zombieY;
  
    // Determine the direction based on the relative position
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      this.currentDirection = deltaX > 0 ? "right" : "left";
    } else {
      this.currentDirection = deltaY > 0 ? "down" : "up";
    }
  
    // Move towards the castle only if the sprite is active
    if (!this.isAttacking) {
      this.scene.physics.moveToObject(this.sprite, this.castle.castle, this.speed);
      this.sprite.anims.play(`zombie_walk-${this.currentDirection}-${this.id}`, true);
    }
  }
  
  
  attackCastle() {
    if (this.isAttacking) return;
    this.isAttacking = true;
    this.sprite.anims.play(`zombie_attack-${this.currentDirection}-${this.id}`);
    this.castle.takeDamage(5);
    this.sprite.once("animationcomplete", () => {
      this.isAttacking = false;
    });
  }
  

  takeDamage(amount: number) {
    this.health -= amount;
    if (this.health <= 0) {
      this.sprite.destroy();  // Remove sprite from scene
      this.scene.events.off('update', this.update, this); // Remove from update loop
    }
  }
  
}
