import Phaser from 'phaser';

export default class Tree {
  constructor(scene, map) {
    this.scene = scene;
    this.map = map;
    this.initTrees();
  }

  initTrees() {
    // Access the 'tree_tiles' object layer from the map
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

      tree.body.setSize(treeObject.width-20, treeObject.height-12);
      tree.setOrigin(0.5, 0.5);
      tree.setImmovable(true);
      tree.body.pushable = false;

      // Set initial depth (higher depth value means it will render above others)
      tree.setDepth(tree.y); // Base depth on tree's vertical position

      // Add the tree to the physics group
      this.treeGroup.add(tree);

      // Collider with depth adjustment logic
      this.scene.physics.add.collider(this.scene.hero.sprite, tree, () => {
        this.updateDepth(tree);
      });
    });
  }

  updateDepth(tree) {
    const hero = this.scene.hero.sprite;
    if (hero.y > tree.y) {
      hero.setDepth(tree.y + 1); // Hero in front
    } else {
      hero.setDepth(tree.y - 1); // Hero behind
    }
  }
}
