import Phaser from 'phaser';
import Castle from '../entities/Castle';
import Hero from '../entities/Hero';
import Tree from '../entities/tree';


export default class Game extends Phaser.Scene {
  constructor() {
    super('Game');
  }
  
  init(){
   const {playerName,playerCount,players} = this.data
   this.playerName = playerName
   this.playerCount = playerCount
   this.players = players
  }

  create() {
    const map = this.make.tilemap({ key: 'game_environment' });
    
    // Load tilesets
    const dungeon_tileset = map.addTilesetImage('duneon', 'dungeon_tiles');
    const grass_tiles_tileset = map.addTilesetImage('grass_tiles', 'grass_tiles');
    const boundry_water_tiles = map.addTilesetImage('boundry_water_tiles','boundry_water_tiles');
    const enemy_spawn_tiles_tileset = map.addTilesetImage('enemy_spawn_tiles', 'enemy_spawn_tiles');
    const ground_up_tiles = map.addTilesetImage('ground_up_tiles', 'ground_up_tiles');
    const road_tiles = map.addTilesetImage('enemy_spawn_tiles', 'road_tiles');
    
    // Create layers
    map.createLayer('grass_tiles', grass_tiles_tileset, 0, 0);
    map.createLayer('enemy_spawn_tiles', enemy_spawn_tiles_tileset, 0, 0);
    map.createLayer('road_tiles', road_tiles, 0, 0);
    map.createLayer('ground_up_tiles', ground_up_tiles, 0, 0);
    map.createLayer('boundry_water_tiles', boundry_water_tiles, 0, 0);
    const boundaryLayer = map.createLayer('boundry', dungeon_tileset, 0, 0);
    boundaryLayer.setCollisionByExclusion([-1]);


    this.hero = new Hero(this, 500, 500,this.playerName);
    this.castle = new Castle(this, map);
    this.treeManager = new Tree(this, map);
    

    // Add physics collider for hero and boundaries
    this.physics.add.collider(this.hero.sprite, boundaryLayer);

    // Set the camera to follow the hero sprite
    this.cameras.main.startFollow(this.hero.sprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);

    // Set camera bounds to prevent scrolling beyond the map
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Enable keyboard input
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
