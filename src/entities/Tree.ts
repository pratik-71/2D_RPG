import Phaser from 'phaser';

export default class Tree {
  constructor(scene, map) {
    this.scene = scene;
    this.map = map;
    this.initTrees();
  }

  initTrees() {
    const objectLayer = this.map.getObjectLayer('tree_tiles');
    if (!objectLayer) {
      console.error('Object layer "tree_tiles" not found');
      return;
    }

    this.treeGroup = this.scene.physics.add.group();

    objectLayer.objects.forEach((treeObject) => {
      const tree = this.scene.physics.add.sprite(
        treeObject.x + treeObject.width / 2,
        treeObject.y - treeObject.height / 2,
        'tree_tiles'
      );

      tree.body.setSize(treeObject.width - 20, treeObject.height - 12);
      tree.setOrigin(0.5, 0.5);
      tree.setImmovable(true);
      tree.body.pushable = false;

      // Initialize tree health
      tree.health = 20;

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

      // Set a flag to handle attack cooldown
      tree.isDamaged = false;

      // Create a graphics object for the health bar above the tree
      tree.healthBarBackground = this.scene.add.graphics();
      tree.healthBar = this.scene.add.graphics();

      // Initially, hide the health bar
      tree.healthBarBackground.setAlpha(0);
      tree.healthBar.setAlpha(0);

      // Method to handle damage
      tree.takeDamage = (damage) => {
        if (tree.health <= 0) return; // Don't allow damage if tree is already destroyed
        tree.health -= damage;
        console.log(`Tree health: ${tree.health}`);
        this.updateHealthBar(tree); // Update health bar after taking damage
        if (tree.health <= 0) {
          console.log('Tree destroyed');
          tree.attackSensor.destroy();
          tree.destroy();
          tree.healthBarBackground.destroy(); // Remove the health bar when the tree is destroyed
          tree.healthBar.destroy();
        }
      };

      this.treeGroup.add(tree);

      // Hero-tree collider for blocking movement
      this.scene.physics.add.collider(this.scene.hero.sprite, tree);

      // Overlap between hero and attack sensor for damage handling
      this.scene.physics.add.overlap(
        this.scene.hero.sprite,
        tree.attackSensor,
        () => {
          // Ensure damage is only dealt once per attack
          if (this.scene.hero.isAttacking && !tree.isDamaged) {
            tree.isDamaged = true;

            // Wait for the sword animation to complete before dealing damage
            this.scene.hero.sprite.once('animationcomplete', () => {
              // Ensure health is reduced after animation completion
              tree.takeDamage(5);
              // Show the health bar for 5 seconds after the attack
              this.showHealthBarForDuration(tree);

              // Reset isDamaged flag to allow future attacks
              tree.isDamaged = false;
            });
          }
        },
        null,
        this
      );
    });
  }

  // Method to update the health bar
  updateHealthBar(tree) {
    // Clear the previous health bars
    tree.healthBar.clear();
    tree.healthBarBackground.clear();

    // Draw the background bar (full health)
    const barWidth = 50;
    const barHeight = 5;

    tree.healthBarBackground.fillStyle(0x000000); // Black color for the background bar
    tree.healthBarBackground.fillRect(
      tree.x - barWidth / 2,
      tree.y - tree.height / 2 - 10, // Position the health bar above the tree
      barWidth,
      barHeight
    );

    // Draw the foreground bar (current health)
    const healthPercentage = tree.health / 20;

    tree.healthBar.fillStyle(0x00ff00); // Green color for the current health
    tree.healthBar.fillRect(
      tree.x - barWidth / 2,
      tree.y - tree.height / 2 - 10, // Position the health bar above the tree
      barWidth * healthPercentage,
      barHeight
    );

    // If health is below 30%, change the foreground bar color to red
    if (tree.health <= 6) {
      tree.healthBar.fillStyle(0xff0000); // Red color for low health
      tree.healthBar.fillRect(
        tree.x - barWidth / 2,
        tree.y - tree.height / 2 - 10, // Same position as before
        barWidth * healthPercentage,
        barHeight
      );
    }
  }

  // Method to show the health bar for 5 seconds after the hero attacks
  showHealthBarForDuration(tree) {
    tree.healthBarBackground.setAlpha(1); // Show the background bar
    tree.healthBar.setAlpha(1); // Show the health bar

    // Hide the health bar after 5 seconds
    this.scene.time.delayedCall(5000, () => {
      tree.healthBarBackground.setAlpha(0);
      tree.healthBar.setAlpha(0);
    });
  }
}
