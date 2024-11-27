// MainMenu.ts (client-side using Phaser)
import Phaser from 'phaser';
import io from 'socket.io-client';

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenu' });
  }

  preload() {
    this.load.image('background', 'tiles/background.jpg'); // Load background image
  }

  create() {
    // Connect to the Socket.IO server
    this.socket = io('http://localhost:3000');

    // Background image covering the full screen
    const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
    background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    // Main menu container for positioning
    const menuContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);

    // Title text (centered)
    const titleText = this.add.text(0, -100, 'Castle Protector', {
      fontSize: '48px',
      color: '#fff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    menuContainer.add(titleText);

    // Single Player Button (centered)
    const singlePlayerButton = this.add.text(0, 0, 'Single Player', {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setInteractive()
      .on('pointerover', () => {
        singlePlayerButton.setStyle({ color: '#ffcc00' });  // Hover effect
      })
      .on('pointerout', () => {
        singlePlayerButton.setStyle({ color: '#00ff00' });  // Reset color
      })
      .on('pointerdown', () => {
        this.scene.start('Game'); // Transition to the Game scene
      })
      .setOrigin(0.5);
    menuContainer.add(singlePlayerButton);

    // Multiplayer Button (centered)
    const multiplayerButton = this.add.text(0, 60, 'Multiplayer', {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setInteractive()
      .on('pointerover', () => {
        multiplayerButton.setStyle({ color: '#ffcc00' });  // Hover effect
      })
      .on('pointerout', () => {
        multiplayerButton.setStyle({ color: '#00ff00' });  // Reset color
      })
      .on('pointerdown', () => {
        this.createRoom(); // Create a new room
      })
      .setOrigin(0.5);
    menuContainer.add(multiplayerButton);

    // Join Game Button (centered)
    const joinGameButton = this.add.text(0, 120, 'Join Game', {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setInteractive()
      .on('pointerover', () => {
        joinGameButton.setStyle({ color: '#ffcc00' });  // Hover effect
      })
      .on('pointerout', () => {
        joinGameButton.setStyle({ color: '#00ff00' });  // Reset color
      })
      .on('pointerdown', () => {
        this.joinRoom();  // Handle joining a room
      })
      .setOrigin(0.5);
    menuContainer.add(joinGameButton);
  }

  createRoom() {
    this.socket.emit('createRoom');

    this.socket.on('roomCode', (roomCode) => {
      this.showMultiplayerWindow(roomCode); 
    });
  }

  joinRoom() {
    const roomCode = prompt("Enter room code:");
    if (roomCode) {
      this.socket.emit('joinRoom', roomCode);

      this.socket.on('roomJoined', (roomCode) => {
        this.showMultiplayerWindow(roomCode);
      });

      this.socket.on('roomNotFound', (message) => {
        alert(message);
      });
    }
  }

  showMultiplayerWindow(roomCode) {
    // Create a new container for the multiplayer window
    const multiplayerWindow = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);

    // Background of the window (semi-transparent)
    const windowBackground = this.add.graphics()
      .fillStyle(0x000000, 1)
      .fillRect(-250, -150, 500, 300);
    multiplayerWindow.add(windowBackground);

    // Window Title
    const windowTitle = this.add.text(0, -120, 'Multiplayer', {
      fontSize: '36px',
      color: '#fff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    multiplayerWindow.add(windowTitle);

    // Room code display
    const roomCodeText = this.add.text(0, -60, `Room Code: ${roomCode}`, {
      fontSize: '24px',
      color: '#fff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    multiplayerWindow.add(roomCodeText);

    // Player count display
    const playerCountText = this.add.text(0, 0, 'Players: 1', {
      fontSize: '24px',
      color: '#fff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    multiplayerWindow.add(playerCountText);

    // Start game button
    const startGameButton = this.add.text(0, 60, 'Start Game', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'Arial'
    }).setInteractive()
      .on('pointerdown', () => {
        this.socket.emit('startGame', roomCode);
      })
      .setOrigin(0.5);
    multiplayerWindow.add(startGameButton);
  }
}
