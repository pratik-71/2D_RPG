import Phaser from 'phaser';

export default class Preloader extends Phaser.Scene {
  constructor() {
    super('preloader');
  }

  preload() {
    this.load.image('dungeon_img', 'tiles/dungeon_tiles.png');
    this.load.tilemapTiledJSON('boundry_tmj', 'layers/boundry.tmj');
  }

  create() {
    this.scene.start('game');
  }
}
