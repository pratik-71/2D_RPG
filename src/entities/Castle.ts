import Phaser from 'phaser';

export default class Castle {
  scene: Phaser.Scene;
  map: Phaser.Tilemaps.Tilemap;
  castle: Phaser.Physics.Arcade.Sprite | null;
  socket: any;
  roomCode: string;
  isCastleInitialized: boolean;  // Flag for initialization state

  constructor(scene, map, socket, roomCode) {
    this.socket = socket;
    this.roomCode = roomCode;
    this.scene = scene;
    this.map = map;
    this.castle = null;  // Ensure it's initially null
    this.isCastleInitialized = false;  // Set initialization flag to false
    this.initCastle();  // Initialize castle
  }

  initCastle() {
    const objectLayer = this.map.getObjectLayer('castle_tiles');
    const castleObject = objectLayer.objects.find(obj => obj.name === 'castle');

    if (!castleObject) {
      console.error('Castle object not found in object layer');
      return;  // Exit if castle is not found
    }

    const centerX = this.map.widthInPixels / 2;
    const centerY = this.map.heightInPixels / 2;

    // Initialize castle sprite and set physics properties
    this.castle = this.scene.physics.add.sprite(centerX, centerY, 'castle_tiles');
    this.castle.setImmovable(true);

    // Make sure the castle exists before accessing it
    if (this.castle) {
      this.castle.body.setSize(castleObject.width, castleObject.height);
      this.isCastleInitialized = true;  // Mark castle as initialized

      // Emit the deployEnemy event once the castle is initialized
      if (this.socket) {
        this.socket.emit('deployEnemy', { roomCode: this.roomCode });
      } else {
        console.error('Socket is undefined');
      }
    } else {
      console.error('Castle sprite could not be initialized');
    }
  }

  // Method to check if castle is initialized before use
  checkCastleInitialization() {
    return this.isCastleInitialized;
  }

  // You can add a method here to handle damage taken by the castle if needed
  takeDamage(amount: number) {
    if (this.castle) {
      // Logic for taking damage and potentially destroying castle
      console.log(`Castle takes ${amount} damage!`);
    }
  }
}
