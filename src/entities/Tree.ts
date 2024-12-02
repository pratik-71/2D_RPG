import Phaser from 'phaser';

import Phaser from 'phaser';
import { toast } from 'react-toastify';
import EventBus from '../EventBus';

export default class Tree {
  constructor(scene, map, socket,roomCode,socketId) {
    this.scene = scene;
    this.map = map;
    this.socket = socket;  // Socket connection passed to the class
    this.treeIdCounter = 1; // Counter to generate unique tree IDs
    this.roomCode = roomCode
    this.socketId = socketId
    this.initTrees();

    // Listen for updated tree health from the backend
    this.socket.on("updateTreeHealth", (data) => {
      const { treeId, health } = data;
      const tree = this.treeGroup.getChildren().find(t => t.id === treeId);  
      if (tree) {
        tree.health = health;
        this.updateHealthBar(tree); 
        tree.healthBarBackground.setAlpha(1);
        tree.healthBar.setAlpha(1);
        this.scene.time.delayedCall(3000, () => { 
          tree.healthBarBackground.setAlpha(0);
          tree.healthBar.setAlpha(0);
        });
        if (tree.health <= 0) {
          tree.attackSensor.destroy();
          tree.destroy();
          tree.healthBarBackground.destroy();
          tree.healthBar.destroy();
          EventBus.emit("updateHeroHealth", 20,this.socketId,this.socket,this.roomCode)
          toast.success(`+20 Health`, {
            position: 'top-center',
            autoClose: 1000,
            hideProgressBar: true,
          });
          
        }
      }
    });
    
  }

  initTrees() {
    const objectLayer = this.map.getObjectLayer('tree_tiles');
    if (!objectLayer) {
      console.error('Object layer "tree_tiles" not found');
      return;
    }

    this.treeGroup = this.scene.physics.add.group();
    objectLayer.objects.forEach((treeObject) => {
      const treeId = `tree${this.treeIdCounter++}`;
      const tree = this.scene.physics.add.sprite(
        treeObject.x + treeObject.width / 2,
        treeObject.y - treeObject.height / 2,
        'tree_tiles'
      );

      // Assign unique ID to each tree
      tree.id = treeId;

      tree.body.setSize(treeObject.width - 20, treeObject.height - 12);
      tree.setOrigin(0.5, 0.5);
      tree.setImmovable(true);
      tree.body.pushable = false;
      tree.health = 20;
      tree.setDepth(tree.y);

      // Create an invisible sensor for attack detection
      tree.attackSensor = this.scene.physics.add.sprite(
        tree.x,
        tree.y,
        null // Invisible sprite (no texture)
      );
      tree.attackSensor.setAlpha(0); // Completely make the sensor invisible
      tree.attackSensor.body.setSize(tree.width, tree.height);
      tree.attackSensor.body.setAllowGravity(false);
      tree.attackSensor.body.setImmovable(true);
      tree.attackSensor.body.moves = false;
      tree.isDamaged = false;

      // Create a graphics object for the health bar above the tree
      tree.healthBarBackground = this.scene.add.graphics();
      tree.healthBar = this.scene.add.graphics();

      // Initially, hide the health bar
      tree.healthBarBackground.setAlpha(0);
      tree.healthBar.setAlpha(0);

      this.treeGroup.add(tree);

      // Hero-tree collider for blocking movement
      this.scene.heroes.forEach(hero => {
        this.scene.physics.add.collider(hero.sprite, tree, () => {
          this.updateDepth(tree, hero);
        });

        // Overlap between hero and attack sensor for damage handling
        this.scene.physics.add.overlap(
          hero.sprite,
          tree.attackSensor,
          () => {
            // Ensure damage is only dealt once per attack
            if (hero.isAttacking && !tree.isDamaged) {
              tree.isDamaged = true;
              hero.sprite.once('animationcomplete', () => {
                // Emit the attack event to backend for processing damage
                const damage = 5; // Example damage, adjust as needed
                this.socket.emit('damageTree', { 
                  treeId: tree.id,
                  damage: damage, // Send damage value
                  roomCode:this.roomCode
                });
                tree.isDamaged = false;
              });
            }
          },
          null,
          this
        );
      });
    });
  }

  // Method to update the health bar
  updateHealthBar(tree) {
    tree.healthBar.clear();
    tree.healthBarBackground.clear();
    const barWidth = 50;
    const barHeight = 5;

    tree.healthBarBackground.fillStyle(0x000000); // Black color for the background bar
    tree.healthBarBackground.fillRect(
      tree.x - barWidth / 2,
      tree.y - tree.height / 2 + 22, // Position the health bar above the tree
      barWidth,
      barHeight
    );

    // Draw the foreground bar (current health)
    const healthPercentage = tree.health / 20;
    tree.healthBar.fillStyle(0x00ff00); // Green color for the current health
    tree.healthBar.fillRect(
      tree.x - barWidth / 2,
      tree.y - tree.height / 2 + 22, // Position the health bar above the tree
      barWidth * healthPercentage,
      barHeight
    );

    // If health is below 30%, change the foreground bar color to red
    if (tree.health <= 6) {
      tree.healthBar.fillStyle(0xff0000); // Red color for low health
      tree.healthBar.fillRect(
        tree.x - barWidth / 2,
        tree.y - tree.height / 2 + 22, // Same position as before
        barWidth * healthPercentage,
        barHeight
      );
    }
  }

  // Method to update depth based on the hero's position
  updateDepth(tree, hero) {
    if (hero.sprite.y > tree.y) {
      hero.sprite.setDepth(tree.y + 1);
    } else {
      hero.sprite.setDepth(tree.y - 1);
    }
  }
}

