import Phaser from 'phaser';

export default class Preloader extends Phaser.Scene {
  constructor() {
    super('preloader');
  }

  preload() {
    this.load.image('dungeon_tiles', 'tiles/dungeon_tiles.png');
    this.load.image('enemy_spawn_tiles', 'tiles/enemy_spawn_tiles.png');
    this.load.image('road_tiles', 'tiles/enemy_spawn_tiles.png');
    this.load.image('boundry_water_tiles', 'tiles/boundry_water_tiles.png');
    this.load.image('grass_tiles', 'tiles/grass_tiles.png');
    this.load.image('castle_tiles','tiles/castle_tiles.png')
    this.load.image('bush_tiles','tiles/grass_tiles.png')
    this.load.tilemapTiledJSON('game_environment', 'layers/game_environment.tmj');

    this.load.spritesheet('hero', 'tiles/Sword_Run_full.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('hero_attack', 'tiles/Sword_attack_full.png', { frameWidth: 64, frameHeight: 64 });
  }

  create() {
    this.scene.start('game');
  }
}
