import Phaser from 'phaser';
import Castle from '../entities/Castle';
import Hero from '../entities/Hero';

export default class Game extends Phaser.Scene {
  constructor() {
    super('game');
  }

  create() {
    const map = this.make.tilemap({ key: 'game_environment' });
    
    // Load tilesets
    const dungeon_tileset = map.addTilesetImage('duneon', 'dungeon_tiles');
    const grass_tiles_tileset = map.addTilesetImage('grass_tiles', 'grass_tiles');
    const enemy_spawn_tiles_tileset = map.addTilesetImage('enemy_spawn_tiles', 'enemy_spawn_tiles');
    const castle_show_tiles = map.addTilesetImage('castle_tiles', 'castle_show_tiles');

    // Create layers
     map.createLayer('grass_tiles', grass_tiles_tileset, 0, 0);
     map.createLayer('enemy_spawn_tiles', enemy_spawn_tiles_tileset, 0, 0);
    const boundaryLayer = map.createLayer('boundry', dungeon_tileset, 0, 0);
    const castleLayer = map.createLayer('castle_show_tiles', castle_show_tiles, 0, 0);

    // Set collision for the boundary layer using tile indices
    boundaryLayer?.setCollisionByExclusion([-1]);
    castleLayer?.setCollisionByExclusion([-1])  // Exclude non-collidable tiles (usually -1)
    // Or, if you need a specific range, make sure to match the tile range you want
    // boundaryLayer.setCollisionBetween(1, 147);

    // Initialize castle
    this.castle = new Castle(this, map);

    // Create hero entity
    this.hero = new Hero(this, 200, 100);  

    // Enable keyboard input
    this.cursors = this.input.keyboard.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D'
    });

    // Add collision between the hero and layers
    this.physics.add.collider(this.hero.sprite, boundaryLayer);
    this.physics.add.collider(this.hero.sprite, castleLayer);
  }

  update() {
    this.hero.update(this.cursors);
  }
}
