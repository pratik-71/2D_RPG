import Phaser from "phaser";
import Castle from "../entities/Castle";
import Hero from "../entities/Hero";
import Tree from "../entities/Tree";
import { toast } from "react-toastify";
import EventBus from "../EventBus";
import Zombie from "../entities/Zombie";

export default class Game extends Phaser.Scene {
  socket: any;
  

  constructor() {
    super("Game");
    this.heroes = []; // Initialize heroes array
    this.zombiesGroup = null;
    this.zombies = [];
    this.heroesById = {}
  }

  init(data) {
    const {
      playerName = "Noobie",
      playerCount = 1,
      players = [],
      socketId = "",
      roomCode,
      socket,
    } = data || {};
    this.playerName = playerName;
    this.playerCount = playerCount;
    this.players = players;
    this.socketId = socketId;
    this.roomCode = roomCode;
    this.socket = socket;

    EventBus.on("handleSendMessages", this.handleSendMessage.bind(this));
  }

  addNewPlayerToGame(id, name, x, y, health) {
    const hero = new Hero(this, x, y, name, id, this.socket, this.players);
    this.heroes.push(hero);
    if (this.socketId === id) {
      this.localHero = hero;
      this.cursors = this.input.keyboard.addKeys({
        up: "W",
        down: "S",
        left: "A",
        right: "D",
        attack: Phaser.Input.Keyboard.KeyCodes.SPACE,
      });
    }
    toast.success(`${name} has Joined The Game `, {
      position: "top-center",
      autoClose: 1000,
      hideProgressBar: true,
      closeOnClick: false,
      closeButton: false,
    });
  }

  async create() {
    
    const map = this.make.tilemap({ key: "game_environment" });

    const dungeon_tileset = map.addTilesetImage("duneon", "dungeon_tiles");
    const grass_tiles_tileset = map.addTilesetImage(
      "grass_tiles",
      "grass_tiles"
    );
    const boundry_water_tiles = map.addTilesetImage(
      "boundry_water_tiles",
      "boundry_water_tiles"
    );
    const enemy_spawn_tiles_tileset = map.addTilesetImage(
      "enemy_spawn_tiles",
      "enemy_spawn_tiles"
    );
    const ground_up_tiles = map.addTilesetImage(
      "ground_up_tiles",
      "ground_up_tiles"
    );
    const graphics_tiles = map.addTilesetImage(
      'graphics_tiles',
      'graphics_tiles'
    )
    const stone_tiles = map.addTilesetImage(
      'stone_tiles',
      'stone_tiles'
    )
    const fence_tiles = map.addTilesetImage(
      'fence_tiles','fence_tiles'
    )
    const road_tiles = map.addTilesetImage("enemy_spawn_tiles", "road_tiles");

    // Create layers
    map.createLayer("grass_tiles", grass_tiles_tileset, 0, 0);
    map.createLayer("road_tiles", road_tiles, 0, 0);
  
    map.createLayer("enemy_spawn_tiles", enemy_spawn_tiles_tileset, 0, 0);
    map.createLayer('graphics_tiles',graphics_tiles,0,0)
    map.createLayer('stone_tiles',stone_tiles,0,0)
    map.createLayer('fence_tiles',fence_tiles,0,0)
    map.createLayer("ground_up_tiles", ground_up_tiles, 0, 0);
    map.createLayer("boundry_water_tiles", boundry_water_tiles, 0, 0);
    const boundaryLayer = map.createLayer("boundry", dungeon_tileset, 0, 0);
    boundaryLayer.setCollisionByExclusion([-1]);

    this.castle = new Castle(this, map, this.socket, this.roomCode);

    // Create heroes for all players
    this.players.forEach((player, index) => {
      const spawnX = 500 + index * 50;
      const spawnY = 500;
      const hero = new Hero(
        this,
        spawnX,
        spawnY,
        player.name || `Player${index + 1}`,
        player.id,
        this.socket,
        this.players
      );
      this.heroes.push(hero);
      this.heroesById[player.id] = {
        hero: hero,
        sprite: hero.sprite,
    };
    // Add the player's ID and name directly to the sprite for easy access
this.heroesById[player.id].sprite.id = player.id;
this.heroesById[player.id].sprite.name = player.name; // Assuming `player.name` exists
this.heroesById[player.id].sprite.health = player.health || 100; // Default health if not provided
    
      
      this.physics.add.collider(hero.sprite, boundaryLayer);
      this.physics.add.collider(hero.sprite, this.castle.castle);
      // Enable keyboard input for the local player only
      if (this.socketId === player.id) {
        this.localHero = hero; // Track the local player
        this.cursors = this.input.keyboard.addKeys({
          up: "W",
          down: "S",
          left: "A",
          right: "D",
          attack: Phaser.Input.Keyboard.KeyCodes.SPACE, // Add attack key
        });
      }
    });

    this.treeManager = new Tree(
      this,
      map,
      this.socket,
      this.roomCode,
      this.socketId
    );

    this.zombie = new Zombie(
      this,
      map,
      this.socket,
      this.socketId,
      this.roomCode,
      this.heroesById
    );
    this.zombiesGroup = this.physics.add.group();

    this.cameras.main.startFollow(this.localHero.sprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // After setting up heroes and zombies, add collision detection
    this.heroes.forEach((hero) => {
      this.zombies.forEach((zombie) => {
        this.physics.add.collider(
          zombie.sprite,
          hero.sprite,
          (zombie, hero) => {
            if (zombie && hero) {
              alert("000000000")
              hero.takeDamage(5); 
              zombie.sprite.anims.play("zombie-attack", true); 
              hero.sprite.anims.play("hero_attack", true); 
            }
          }
        );
      });
    });

    // Listen for player updates
    this.socket.on("updatePlayers", (updatedPlayers) => {
      updatedPlayers.forEach((playerData) => {
        if (playerData.id !== this.socketId) {
          const hero = this.heroes.find((h) => h.socketId === playerData.id);
          if (hero) {
            hero.sprite.setPosition(playerData.x, playerData.y);
            hero.nameText.setPosition(playerData.x, playerData.y - 20);
            if (playerData.isAttacking) {
              hero.sprite.anims.play("attack", true); // Play attack animation
            } else if (playerData.isMoving) {
              hero.sprite.anims.play(`walk-${playerData.direction}`, true);
            } else {
              hero.sprite.anims.stop();
              hero.sprite.setFrame(0); // Idle frame
            }
          }
        }
      });
    });

    // Listen for attack events from other players
    this.socket.on("playerAttacked", (attackData) => {
      const { socketId, x, y, direction, attackAnimationKey } = attackData;
      const attackingHero = this.heroes.find((h) => h.socketId === socketId);
      if (attackingHero) {
        attackingHero.sprite.setPosition(x, y); // Update position if necessary
        attackingHero.sprite.anims.play(attackAnimationKey, true); // Play attack animation
      }
    });

    // Listen for the updatePlayerIsDead event
    this.socket.on("PlayerIsDead", (playerData) => {
      const { id, isDead } = playerData; // Destructure the player data
      if (id == this.socketId) {
        toast.warning(`You are dead!`, {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: false,
          closeButton: false,
        });
        this.scene.start("MainMenu");
      } else {
        const hero = this.heroes.find((h) => h.socketId == id); // Find the hero by socketId
        if (hero && isDead) {
          toast.warning(`${hero.playerName} is dead!`, {
            position: "top-center",
            autoClose: 1000,
            hideProgressBar: true,
            closeOnClick: false,
            closeButton: false,
          });
          if (hero.sprite) {
            hero.sprite.setVisible(false);
          }
          this.heroes = this.heroes.filter((h) => h.socketId != id);
        }
      }
    });

    this.socket.on("GameHasStarted", (newPlayerData) => {
      const { id, name, x, y, health } = newPlayerData;
      this.addNewPlayerToGame(id, name, x, y, health);
    });

    this.socket.on("receiveMessage", (data) => {
      EventBus.emit("ShowMessages", data, this.socketId);
    });

    // In Game.js (or Game.ts)
    this.socket.on("spawnEnemy", (zombieData) => {
      const { x, y } = zombieData;
      if (this.castle.isCastleInitialized) {
        const zombie = new Zombie(this, x, y, this.castle,this.socketId,zombieData);
        this.zombiesGroup.add(zombie.sprite);
        this.zombies.push(zombie); // Track zombies for updates
        zombie.sprite.setScale(0.6);
        zombie.sprite.setData("instance", zombie);
      }
    });

    
  }

  handleSendMessage(message) {
    if (this.socket && message.trim()) {
      const data = {
        message,
        playerName: this.playerName,
        roomCode: this.roomCode,
        socketId: this.socketId,
      };
      // Send the message to the server
      this.socket.emit("sendMessage", data, this.socketId);
    }
  }

  update() {
    if (this.localHero && this.cursors) {
      this.localHero.update(this.cursors);
    }

    this.zombies.forEach((zombie) => {
      zombie.update();
    });
  }
}
