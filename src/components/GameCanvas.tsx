import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import Preloader from '../scenes/Preloader';
import Game from '../scenes/Game';
import "../App.css"; // Ensure this CSS file contains styles for the container

const GameCanvas: React.FC = () => {
  const phaserGame = useRef<Phaser.Game | null>(null);
  
  // State to track health
  const [heroHealth, setHeroHealth] = useState(100);
  const [castleHealth, setCastleHealth] = useState(100);

  // State to track players and enemies count
  const [playersCount, setPlayersCount] = useState(1); 
  const [enemiesCount, setEnemiesCount] = useState(10); 

  // State to handle message input
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!phaserGame.current) {
      phaserGame.current = new Phaser.Game({
        type: Phaser.AUTO,
        scale: {
          mode: Phaser.Scale.RESIZE,
          parent: 'phaser-container',
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
          default: 'arcade',
          arcade: { gravity: { y: 0 } },
        },
        scene: [Preloader, Game],
      });
    }

    return () => {
      phaserGame.current?.destroy(true);
      phaserGame.current = null;
    };
  }, []);

  // Update health bars when health changes
  const updateHeroHealth = (damage: number) => {
    setHeroHealth(prevHealth => Math.max(prevHealth - damage, 0)); // Prevent negative health
  };

  const updateCastleHealth = (damage: number) => {
    setCastleHealth(prevHealth => Math.max(prevHealth - damage, 0)); // Prevent negative health
  };

  // Handle message input
  const handleSendMessage = () => {
    // Handle sending the message logic
    setMessage(''); // Clear input after sending
  };

  return (
    <div className="game-container">
      {/* Game canvas */}
      <div id="phaser-container" className="phaser-container"></div>

      <div className="data-panel">
       
        <div className="first-column">  
          <div className="health-bar">
          <h3>Hero Health   </h3>
            <div className="health-fill" style={{ width: `${heroHealth}%` }}></div>
          </div>
                   
          <div className="health-bar">
          <h3>Castle Health</h3>
            <div className="health-fill" style={{ width: `${castleHealth}%` }}></div>
          </div>
        </div>

        {/* Second Column: Players and Enemies */}
        <div className="second-column">
          <h6>Numebr Of Players: {playersCount}</h6>
          <h6>Number Of Enemies: {enemiesCount}</h6>
        </div>

        {/* Third Column: Message Input and Send Button */}
        <div className="third-column">
          <input
            type="text"
            className="message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message"
          />
          <button className="send-button" onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;
