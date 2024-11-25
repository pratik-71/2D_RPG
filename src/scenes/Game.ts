import Phaser from 'phaser';
import Castle from '../entities/Castle';
import Hero from '../entities/Hero';

export default class Game extends Phaser.Scene {
  constructor() {
    super('game');
  }


  create() {
    const map = this.make.tilemap({ key: 'game_environment' });
    const dungeon_tileset = map.addTilesetImage('duneon', 'dungeon_tiles');
    const grass_tiles_tileset = map.addTilesetImage('grass_tiles', 'grass_tiles');
    const enemy_spawn_tiles_tileset = map.addTilesetImage('enemy_spawn_tiles', 'enemy_spawn_tiles');
    const castle_show_tiles = map.addTilesetImage('castle_tiles','castle_show_tiles')
    map.createLayer('grass_tiles', grass_tiles_tileset,0,0);
    map.createLayer('enemy_spawn_tiles', enemy_spawn_tiles_tileset,0,0);  
    map.createLayer('boundry', dungeon_tileset,0,0);
    map.createLayer('castle_show_tiles',castle_show_tiles,0,0)



    this.castle = new Castle(this, map);
    
     // Create hero entity
     this.hero = new Hero(this, 200, 100);  
     this.input.keyboard.enabled = true;
     this.cursors = this.input.keyboard.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D'
    });

  }

  update() {
    this.hero.update(this.cursors);
  }
}
