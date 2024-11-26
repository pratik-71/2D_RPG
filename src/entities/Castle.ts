import Phaser from 'phaser';

export default class Castle {
  constructor(scene, map) {
    this.scene = scene;
    this.map = map;
    this.initCastle();
  }

  initCastle() {
    const objectLayer = this.map.getObjectLayer('castle_tiles');
    console.log(objectLayer.objects)
    if (!objectLayer) {
      console.error('Object layer "castle_tiles" not found');
      return;
    }

    // Find the castle object based on the name set in Tiled
    const castleObject = objectLayer.objects.find(obj => obj.name === 'castle');
    if (!castleObject) {
      console.error('Castle object not found in object layer');
      return;
    }

    // Calculate the center of the map
    const centerX = this.map.widthInPixels / 2;
    const centerY = this.map.heightInPixels / 2;

    // Create a sprite for the castle at the center of the map
    this.castle = this.scene.physics.add.sprite(
      centerX,
      centerY,
      'castle_tiles'  // Replace with the correct image key for the castle sprite
    );

    // Set collision boundaries to match the size from Tiled (optional for interaction)
    this.castle.body.setSize(castleObject.width, castleObject.height);
    this.castle.body.setImmovable(true);

    // Add collision with hero
    if (this.scene.hero && this.scene.hero.sprite) {
      this.scene.physics.add.collider(this.scene.hero.sprite, this.castle);
    } else {
      console.warn('Hero sprite not initialized when adding collision');
    }
  }
}
