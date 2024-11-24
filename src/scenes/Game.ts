import Phaser from 'phaser';

export default class Game extends Phaser.Scene {
  constructor() {
    super('game');
  }

  create() {
    const map = this.make.tilemap({ key: 'boundry_tmj' });
    const tileset = map.addTilesetImage('duneon', 'dungeon_img');
    map.createLayer('boundry', tileset,0,0);
  }
}
