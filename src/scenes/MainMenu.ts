import Phaser from 'phaser';

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenu' });
  }

  preload() {
    this.load.image('background', 'tiles/background.jpg'); // Load background image
  }

  create() {
    // Background image covering the full screen
    const background = this.add.image(0, 0, 'background')
      .setOrigin(0, 0); // Set the origin to top-left corner to ensure it starts from (0, 0)

    // Set the background image to cover the entire screen by scaling it to the canvas size
    background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    // Main menu container for positioning
    const menuContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);

    // Title text (centered)
    const titleText = this.add.text(0, -100, 'Castle Protector', {
      fontSize: '48px',
      color: '#fff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5); // Center title text horizontally
    menuContainer.add(titleText);

    // Single Player Button (centered)
    const singlePlayerButton = this.add.text(0, 0, 'Single Player', {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
      .setInteractive()
      .on('pointerover', () => {
        singlePlayerButton.setStyle({ color: '#ffcc00' }); // Hover effect
      })
      .on('pointerout', () => {
        singlePlayerButton.setStyle({ color: '#00ff00' }); // Reset color
      })
      .on('pointerdown', () => {
        this.scene.start('Game'); // Transition to the Game scene
      })
      .setOrigin(0.5); // Center the button horizontally
    menuContainer.add(singlePlayerButton);

    // Multiplayer Button (centered)
    const multiplayerButton = this.add.text(0, 60, 'Multiplayer', {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
      .setInteractive()
      .on('pointerover', () => {
        multiplayerButton.setStyle({ color: '#ffcc00' }); // Hover effect
      })
      .on('pointerout', () => {
        multiplayerButton.setStyle({ color: '#00ff00' }); // Reset color
      })
      .on('pointerdown', () => {
        this.showMultiplayerWindow(); // Show multiplayer window
      })
      .setOrigin(0.5); // Center the button horizontally
    menuContainer.add(multiplayerButton);

    // Join Game Button (centered)
    const joinGameButton = this.add.text(0, 120, 'Join Game', {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
      .setInteractive()
      .on('pointerover', () => {
        joinGameButton.setStyle({ color: '#ffcc00' }); // Hover effect
      })
      .on('pointerout', () => {
        joinGameButton.setStyle({ color: '#00ff00' }); // Reset color
      })
      .on('pointerdown', () => {
        console.log('Join Game mode coming soon!');
      })
      .setOrigin(0.5); // Center the button horizontally
    menuContainer.add(joinGameButton);
  }

  showMultiplayerWindow() {
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

    // Display the unique code (temporary hardcoded '12345')
    const uniqueCodeText = this.add.text(0, -60, 'Room Code: 12345', {
      fontSize: '28px',
      color: '#fff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);
    multiplayerWindow.add(uniqueCodeText);

    // Waiting for players text
    const waitingText = this.add.text(0, 0, 'Waiting for players to join...', {
      fontSize: '24px',
      color: '#fff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);
    multiplayerWindow.add(waitingText);

    // Available players
    const playersText = this.add.text(0, 40, 'Player 1\nPlayer 2', {
      fontSize: '24px',
      color: '#fff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);
    multiplayerWindow.add(playersText);

    // Start Game Button
    const startGameButton = this.add.text(0, 120, 'Start Game', {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    })
      .setInteractive()
      .on('pointerover', () => {
        startGameButton.setStyle({ color: '#ffcc00' }); // Hover effect
      })
      .on('pointerout', () => {
        startGameButton.setStyle({ color: '#00ff00' }); // Reset color
      })
      .on('pointerdown', () => {
        console.log('Starting Game...');
        // Transition to the Game scene or launch the multiplayer functionality here
        this.scene.start('Game');
      })
      .setOrigin(0.5); // Center the button horizontally
    multiplayerWindow.add(startGameButton);

    // Close the multiplayer window when clicked outside (optional)
    this.input.on('pointerdown', (pointer) => {
      if (!multiplayerWindow.getBounds().contains(pointer.x, pointer.y)) {
        multiplayerWindow.setVisible(false); // Hide the window when clicking outside
      }
    });
  }
}
