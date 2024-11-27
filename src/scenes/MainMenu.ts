import Phaser from 'phaser';
import io from 'socket.io-client';

export default class MainMenu extends Phaser.Scene {
  private socket: any;
  private playerCountText: Phaser.GameObjects.Text;
  private multiplayerWindow: Phaser.GameObjects.Container | null = null;
  private roomCode: string | null = null;
  private playerNameTexts: Phaser.GameObjects.Text[] = []; // To store player name text objects

  constructor() {
    super({ key: 'MainMenu' });
  }

  preload() {
    this.load.image('background', 'tiles/background.jpg'); // Load background image
  }

  create() {
    this.socket = io('http://localhost:3000'); // Connect to the Socket.IO server

    // Background setup
    const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
    background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    // Menu container for positioning
    const menuContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);

    // Title text
    const titleText = this.add.text(0, -100, 'Castle Protector', {
      fontSize: '48px',
      color: '#fff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    menuContainer.add(titleText);

    // Single Player Button
    const singlePlayerButton = this.createButton('Single Player', 0, () => {
      this.scene.start('Game'); // Transition to the Game scene
    });
    menuContainer.add(singlePlayerButton);

    // Multiplayer Button
    const multiplayerButton = this.createButton('Multiplayer', 60, () => {
      this.createRoom(); // Create a new room
    });
    menuContainer.add(multiplayerButton);

    // Join Game Button
    const joinGameButton = this.createButton('Join Game', 120, () => {
      this.joinRoom();  // Handle joining a room
    });
    menuContainer.add(joinGameButton);

    // Listen for room state updates for all clients
    this.socket.on('updateRoomState', (roomCode: string, playerCount: number, playerNames: string[]) => {
      this.showMultiplayerWindow(roomCode);
      this.updatePlayerCount(playerCount, playerNames);
    });
  }

  createButton(text: string, yOffset: number, callback: () => void): Phaser.GameObjects.Text {
    const button = this.add.text(0, yOffset, text, {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setInteractive()
      .on('pointerover', () => button.setStyle({ color: '#ffcc00' }))
      .on('pointerout', () => button.setStyle({ color: '#00ff00' }))
      .on('pointerdown', callback)
      .setOrigin(0.5);
    return button;
  }

  createRoom() {
    this.socket.emit('createRoom');
    this.socket.on('roomCode', (roomCode: string) => {
      this.roomCode = roomCode;
      this.showMultiplayerWindow(roomCode);
    });
  }

  joinRoom() {
    const roomCode = prompt("Enter room code:");
    if (roomCode) {
      this.socket.emit('joinRoom', roomCode);
      this.socket.on('roomJoined', (roomCode: string) => {
        this.showMultiplayerWindow(roomCode);
      });
      this.socket.on('roomNotFound', (message: string) => {
        alert(message);
      });
    }
  }

  showMultiplayerWindow(roomCode: string) {
    if (!this.multiplayerWindow) {
      this.multiplayerWindow = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);

      const windowBackground = this.add.graphics()
        .fillStyle(0x000000, 1)
        .fillRect(-250, -150, 500, 300);
      this.multiplayerWindow.add(windowBackground);

      const roomCodeText = this.add.text(0, -60, `Room Code: ${roomCode}`, {
        fontSize: '24px',
        color: '#fff'
      }).setOrigin(0.5);
      this.multiplayerWindow.add(roomCodeText);

      this.playerCountText = this.add.text(0, -20, 'Players: 1', {
        fontSize: '24px',
        color: '#fff'
      }).setOrigin(0.5);
      this.multiplayerWindow.add(this.playerCountText);

      const startGameButton = this.add.text(0, 100, 'Start Game', {
        fontSize: '24px',
        color: '#00ff00'
      }).setInteractive()
        .on('pointerdown', () => {
          this.socket.emit('startGame', roomCode);
        })
        .setOrigin(0.5);
      this.multiplayerWindow.add(startGameButton);
    }
  }

  updatePlayerCount(playerCount: number, playerNames: string[]) {
    if (this.playerCountText) {
      this.playerCountText.setText(`Players: ${playerCount}`);
    }

    // Clear previous player names
    this.playerNameTexts.forEach(text => text.destroy());
    this.playerNameTexts = [];

    // Display each player name dynamically
    playerNames.forEach((name, index) => {
      const playerText = this.add.text(0, 20 + index * 30, `Player ${index + 1}: ${name}`, {
        fontSize: '20px',
        color: '#fff'
      }).setOrigin(0.5);
      this.multiplayerWindow?.add(playerText);
      this.playerNameTexts.push(playerText);
    });
  }
}
