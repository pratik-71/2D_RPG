import Phaser from 'phaser';

export default class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    // Load assets needed for the game
    this.load.spritesheet('hero', 'tiles/Sword_Run_full.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('hero_attack', 'tiles/Sword_attack_full.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('zombie_run', 'tiles/Zombie_Run_full.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('zombie_attack', 'tiles/Zombie_attack_full.png', { frameWidth: 64, frameHeight: 64 });

    this.load.image('dungeon_tiles', 'tiles/dungeon_tiles.png');
    this.load.image('enemy_spawn_tiles', 'tiles/enemy_spawn_tiles.png');
    this.load.image('road_tiles', 'tiles/enemy_spawn_tiles.png');
    this.load.image('boundry_water_tiles', 'tiles/boundry_water_tiles.png');
    this.load.image('grass_tiles', 'tiles/ground_up_tiles.png');
    this.load.image('castle_tiles','tiles/castle_tiles.png');
    this.load.image('ground_up_tiles','tiles/ground_up_tiles.png');
    this.load.image('tree_tiles', 'tiles/tree_tiles.png');
    this.load.image('graphics_tiles','tiles/graphics_tiles.png')
    this.load.image('stone_tiles','tiles/stone_tiles.png')
    this.load.image('fence_tiles','tiles/fence_tiles.png')
    this.load.tilemapTiledJSON('game_environment', 'layers/game_environment.tmj');
  }

  create() {
    this.scene.start('MainMenu'); // Start the MainMenu scene after preloading
  }
}
