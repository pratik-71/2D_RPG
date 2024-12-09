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
  attackCooldown: number;
  lastAttackTime: number;
  socketId: string;
  zombieData: any;
  static killcount = 0; 
 
 

  constructor(scene: Phaser.Scene, x: number, y: number, castle: Castle, socketId: string, zombieData: any) {
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
    this.socketId = socketId;
    this.zombieData = zombieData;
    this.flag = true;

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
    // Set the line style to transparent (making the circle invisible)
    this.detectionGraphics.lineStyle(0, 0x000000, 0); // Invisible circle, line width 0

    // Optionally, you can use fill to make it fully transparent if needed
    // this.detectionGraphics.fillStyle(0x000000, 0); // Completely transparent fill

    // Hero detection using update method instead of overlap
    if (this.scene.heroesById) {
      this.scene.events.on("update", this.detectClosestHero, this);
    }

    // Collision with castle
    this.scene.physics.add.collider(this.sprite, this.castle.castle, () => {
      this.attackCastle();
    });
  }

  createAnimations() {
    const directions = ["up", "down", "left", "right"];
    const frameStarts = [0, 8, 16, 24];

    directions.forEach((direction,index) => {
      const walkKey = `zombie_walk-${direction}`;
      const attackKey = `zombie_attack-${direction}`;

      this.scene.anims.create({
        key: walkKey,
        frames: this.scene.anims.generateFrameNumbers("zombie_run", {
          start: frameStarts[index],
          end: frameStarts[index] + 7,
        }),
        frameRate: 10,
        repeat: -1,
      });

      this.scene.anims.create({
        key: attackKey,
        frames: this.scene.anims.generateFrameNumbers("zombie_attack", {
          start: frameStarts[index],
          end: frameStarts[index] + 7,
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
    // The circle remains functional but invisible
    this.detectionGraphics.strokeCircle(this.detectionRadius.x, this.detectionRadius.y, 100);
  
    const { x: targetX, y: targetY } = this.target;
    const deltaX = targetX - this.sprite.x;
    const deltaY = targetY - this.sprite.y;

    // Determine movement direction
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    this.currentDirection = isHorizontal
        ? (deltaX > 0 ? "right" : "left")
        : (deltaY > 0 ? "down" : "up");
       

    if (!this.isAttacking) {
        this.scene.physics.moveToObject(this.sprite, this.target, this.speed);
        this.sprite.anims.play(`zombie_walk-${this.currentDirection}`, true);   
    }
    
    // Check for overlaps with heroes
    this.checkHeroAttack();

    // If the zombie is within attack range of the target (hero or castle)
    if (Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.target.x, this.target.y) < 50) {
      if (this.target instanceof Phaser.Physics.Arcade.Sprite) {
        this.attackHero(); // Trigger hero attack
      } else {
        this.attackCastle(); // Trigger castle attack
      }
    }
  }

  checkHeroAttack() {
    Object.values(this.scene.heroesById).forEach((heroObj: any) => {
      if (!heroObj || !heroObj.sprite || !heroObj.sprite.body) return;
      
      if (this.scene.physics.overlap(heroObj.sprite, this.sprite)) {
        const currentAnim = heroObj.sprite.anims.currentAnim;
        
        if(!currentAnim.key.includes("attack") ){
          this.flag = true;
        } 
        if (currentAnim && currentAnim.key.includes("attack") && this.flag) {
          console.log(`Zombie ${this.id} hit by Hero ${heroObj.id}`);
          this.flag = false;
          this.takeDamage(5); 
        }
      }
    });
  }
  
  

  takeDamage(amount: number) {
    this.zombieData.health -= amount;

    if (this.zombieData.health <= 0) {
      Zombie.killcount++;
    console.log(Zombie.killcount)
    if(Zombie.killcount>=5){
      this.castle.stopGame({text:"YOU WIN",color:"#00ff00"})
    }
      this.destroyZombie();
    }
  }

  destroyZombie() {
    console.log(`Zombie ${this.zombieData.id} is destroyed.`);
    this.sprite.destroy();
  }

  detectClosestHero() {
    if (!this.sprite || !this.scene.heroesById) return;

    let closestHero: Phaser.Physics.Arcade.Sprite | null = null;
    let closestDistance = 100;

    Object.values(this.scene.heroesById).forEach((heroObj: any) => {
      if (!heroObj || !heroObj.sprite || !heroObj.sprite.body || !heroObj.sprite.active) return;

      const heroSprite = heroObj.sprite as Phaser.Physics.Arcade.Sprite;
      const distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, heroSprite.x, heroSprite.y);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestHero = heroSprite;
      }
    });

    if (closestHero) {
      this.target = closestHero;
    } else {
      this.target = this.castle.castle;
    }
  }

  attackHero() {
    if (this.isAttacking || !(this.target instanceof Phaser.Physics.Arcade.Sprite)) return;

    this.isAttacking = true;
    this.sprite.anims.play(`zombie_attack-${this.currentDirection}`, true);

    this.scene.time.delayedCall(300, () => {
      const localPlayer = this.scene.heroesById[this.socketId];
      const hero = this.scene.heroesById[this.target.id];
      if (this.target.id === localPlayer.hero.socketId) {
        EventBus.emit("zombieAttack", this.target, 1);
      } else if (hero) {
        hero.hero.takeDamage(1, this.target.id, hero.sprite);
      }

      this.sprite.once("animationcomplete", () => {
        this.isAttacking = false; // Allow new attacks
      });
    });
  }

  attackCastle() {
    if (this.isAttacking) return;
    this.isAttacking = true;
    this.sprite.anims.play(`zombie_attack-${this.currentDirection}`);
    this.castle.takeDamage(1); // Ensure castle has a takeDamage method
    this.sprite.once("animationcomplete", () => {
      this.isAttacking = false;
    });
  }


  
  
}
