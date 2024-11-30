import Phaser from 'phaser';
import Castle from '../entities/Castle';
import Hero from '../entities/Hero';
import Tree from '../entities/Tree';

export default class Game extends Phaser.Scene {
  constructor() {
    super('Game');
    this.heroes = [];  // Initialize heroes array
  }

  init(data) {
    const { playerName = 'Noobie', playerCount = 1, players = [], socketId = '' } = data || {};
    this.playerName = playerName;
    this.playerCount = playerCount;
    this.players = players;
    this.socketId = socketId;
  }

  async create() {
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

    // Create heroes for all players
    this.players.forEach((player, index) => {
      const spawnX = 500 + index * 50;
      const spawnY = 500;
      const hero = new Hero(this, spawnX, spawnY, player.name || `Player${index + 1}`, player.id);
      this.heroes.push(hero);

      // Enable physics and collisions for each hero
      this.physics.add.collider(hero.sprite, boundaryLayer);

      // Enable keyboard input for the local player only
      if (this.socketId === player.id) { // Correct comparison
        this.localHero = hero;  // Track the local player
        this.cursors = this.input.keyboard.addKeys({
          up: 'W',
          down: 'S',
          left: 'A',
          right: 'D'
        });
      }
    });

    this.castle = new Castle(this, map);
    this.treeManager = new Tree(this, map);

    // Set the camera to follow the local player's hero
    this.cameras.main.startFollow(this.localHero.sprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);

    // Set camera and world bounds
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  update() {
    // Update only the local hero
    if (this.localHero && this.cursors) {
      this.localHero.update(this.cursors);
    }
  }
}
