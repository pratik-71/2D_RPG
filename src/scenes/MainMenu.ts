import Phaser from 'phaser';
import io from 'socket.io-client';

export default class MainMenu extends Phaser.Scene {
  private socket: any;
  private playerName: string = 'Noobie'; // Default player name
  private playerNameText: Phaser.GameObjects.Text;
  private nameInputBox: Phaser.GameObjects.DOMElement | null = null;
  private overlay: Phaser.GameObjects.Rectangle | null = null;
  private playerCountText: Phaser.GameObjects.Text;
  private multiplayerWindow: Phaser.GameObjects.Container | null = null;
  private playerNameTexts: Phaser.GameObjects.Text[] = []; // List to store player name texts
  private closeButton: HTMLElement | null = null; // Close button for multiplayer window
  private isHost: boolean = false;

  constructor() {
    super({ key: 'MainMenu' });
  }

  preload() {
    this.load.image('background', 'tiles/background.jpg');
  }

  create() {
    this.socket = io('http://localhost:3000');

    // Background setup
    const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
    background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    // Display player name and change button
    this.playerNameText = this.add.text(20, 20, `${this.playerName} - Change Name`, {
      fontSize: '24px',
      color: '#fff',
      fontFamily: 'Arial',
    }).setInteractive()
      .on('pointerdown', () => {
        this.openNameChangeWindow();
      });

    // Menu setup
    const menuContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    const titleText = this.add.text(0, -100, 'Castle Protector', {
      fontSize: '48px',
      color: '#fff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    menuContainer.add(titleText);

    // Buttons for game modes
    menuContainer.add(this.createButton('Single Player', 0, () => this.scene.start('Game')));
    menuContainer.add(this.createButton('Multiplayer', 60, () => this.createRoom()));
    menuContainer.add(this.createButton('Join Game', 120, () => this.joinRoom()));

    // Listen for room state updates
    this.socket.on('updateRoomState', (roomCode: string, playerCount: number, playerNames: string[],hostId:string) => {
      this.isHost = (this.socket.id === hostId); 
      this.showMultiplayerWindow(roomCode, playerNames, this.isHost);
      this.updatePlayerCount(playerCount, playerNames);
    });
  }

  createButton(text: string, yOffset: number, callback: () => void): Phaser.GameObjects.Text {
    return this.add.text(0, yOffset, text, {
      fontSize: '32px',
      color: '#00ff00',
      fontFamily: 'Arial',
    }).setInteractive()
      .on('pointerover', (button: Phaser.GameObjects.Text) => button.setStyle({ color: '#ffcc00' }))
      .on('pointerout', (button: Phaser.GameObjects.Text) => button.setStyle({ color: '#00ff00' }))
      .on('pointerdown', callback)
      .setOrigin(0.5);
  }

  openNameChangeWindow() {
    if (this.nameInputBox) return; // Prevent multiple windows

    // Create a transparent overlay
    this.overlay = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.5 // Semi-transparent black background
    ).setInteractive(); // Catch all clicks

    // Create HTML for the input box window
    const inputHTML = `
      <div style="background-color: rgba(0, 0, 0, 1); padding: 20px; border-radius: 10px; text-align: center; width: 300px;display:flex;justify-content:center; align-items:center;flex-direction:column">
        <input type="text" id="nameInput" style="width: 200px; height: 30px; font-size: 20px; margin-bottom: 10px;" placeholder="Enter new name" value="${this.playerName}">
        <button id="confirmButton" style="width: 100px; height: 30px; font-size: 20px; display:flex;justify-content:center; align-items:center">OK</button>
      </div>
    `;

    // Create a DOM element for the input box and add it to the scene
    this.nameInputBox = this.add.dom(this.cameras.main.centerX, this.cameras.main.centerY).createFromHTML(inputHTML);

    // Listen for button clicks inside the DOM element
    this.nameInputBox.addListener('click');
    this.nameInputBox.on('click', (event: any) => {
      if (event.target.id === 'confirmButton') {
        const inputElement = this.nameInputBox.getChildByID('nameInput') as HTMLInputElement;
        if (inputElement.value.trim()) {
          this.playerName = inputElement.value.trim(); // Update the player name
          this.playerNameText.setText(`${this.playerName} - Change Name`); // Update the displayed name
        }
        this.closeNameChangeWindow();
      }
    });
  }

  closeNameChangeWindow() {
    if (this.nameInputBox) {
      this.nameInputBox.destroy(); // Remove the input box
      this.nameInputBox = null;
    }
    if (this.overlay) {
      this.overlay.destroy(); // Remove the overlay
      this.overlay = null;
    }
  }

  createRoom() {
    this.socket.emit('createRoom', { name: this.playerName });  // Send player name to backend
  }

  joinRoom() {
    const roomCode = prompt('Enter room code:');
    if (roomCode) {
      this.socket.emit('joinRoom', { roomCode, name: this.playerName }); // Send player name to backend
    }
  }

  showMultiplayerWindow(roomCode: string, playerNames: string[],isHost:boolean) {
    if (!this.multiplayerWindow) {
      this.multiplayerWindow = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);

      const windowBackground = this.add.graphics()
        .fillStyle(0x000000, 1)
        .fillRect(-250, -150, 500, 300);
      this.multiplayerWindow.add(windowBackground);

      const roomCodeText = this.add.text(0, -80, `Room Code: ${roomCode}`, {
        fontSize: '24px',
        color: '#fff'
      }).setOrigin(0.5);
      this.multiplayerWindow.add(roomCodeText);

      this.playerCountText = this.add.text(0, -40, `Players: ${playerNames.length}`, {
        fontSize: '24px',
        color: '#fff'
      }).setOrigin(0.5);
      this.multiplayerWindow.add(this.playerCountText);

      // Close button (DOM element)
      this.closeButton = document.createElement('button');
      this.closeButton.innerHTML = 'X';
      this.closeButton.style.position = 'absolute';
      this.closeButton.style.left = `${this.cameras.main.centerX + 210}px`;
      this.closeButton.style.top = `${this.cameras.main.centerY - 160}px`;
      this.closeButton.style.fontSize = '12px';
      this.closeButton.style.color = 'white';
      this.closeButton.style.padding = '5px 10px'
      document.body.appendChild(this.closeButton); // Append button to the body

      // Handle button click
      this.closeButton.addEventListener('click', () => {
        this.socket.emit('closeRoom', this.currentRoomCode);
        this.closeMultiplayerWindow();
      });

      this.socket.on('roomClosed', () => {
        alert("Room got closed");
      });

      if (isHost) {
        // Show the "Start Game" button for the host
        const startButton = this.add.text(-60, 100, 'Start Game', {
          fontSize: '24px',
          color: '#00ff00',
          fontFamily: 'Arial',
          backgroundColor: '#444',
          padding: { x: 10, y: 5 },
        }).setInteractive()
          .on('pointerdown', () => {
            this.socket.emit('startGame', roomCode);
          });
        this.multiplayerWindow.add(startButton);
      } else {
        // Show the "Waiting for host to start the game" message for non-hosts
        const waitingText = this.add.text(0, 100, 'Waiting for host to start the game...', {
          fontSize: '20px',
          color: '#ffcc00',
          fontFamily: 'Arial',
        }).setOrigin(0.5);
        this.multiplayerWindow.add(waitingText);
      }

      // Make the close button functional but outside Phaser's event system
      windowBackground.setInteractive({ useHandCursor: true }).on('pointerdown', (pointer) => pointer.stopPropagation());
    }
    this.updatePlayerCount(playerNames.length, playerNames);
  }

  closeMultiplayerWindow() {
    if (this.multiplayerWindow) {
      this.multiplayerWindow.destroy();
      this.multiplayerWindow = null;
    }
  
    // Remove the close button
    if (this.closeButton) {
      this.closeButton.removeEventListener('click', this.closeMultiplayerWindow);
      document.body.removeChild(this.closeButton); // Remove the close button from the document
      this.closeButton = null;
    }
  
    // Emit disconnectPlayer event to server
    if (this.socket && this.playerName) {
      // Assume roomCode is accessible (you can pass it as a parameter or store it)
      this.socket.emit('disconnectPlayer', this.currentRoomCode, this.playerName); // Replace `this.currentRoomCode` with actual room code
    }
  
    // Destroy player name texts
    this.playerNameTexts.forEach(text => text.destroy());
    this.playerNameTexts = [];
  }
  

  updatePlayerCount(playerCount: number, playerNames: string[]) {
    this.playerCountText.setText(`Players: ${playerCount}`);
  
    // Clear previous player name texts
    this.playerNameTexts.forEach(text => text.destroy());
    this.playerNameTexts = [];
  
    // Add player names (ensure it's a string)
    playerNames.forEach((name, index) => {
      const playerText = this.add.text(0, 20 + index * 25, `Player ${index + 1}: ${String(name)}`, { // Convert name to string just in case
        fontSize: '18px', // Reduced font size
        color: '#fff'
      }).setOrigin(0.5);
      this.multiplayerWindow.add(playerText);
      this.playerNameTexts.push(playerText);
    });
  }
  
}
