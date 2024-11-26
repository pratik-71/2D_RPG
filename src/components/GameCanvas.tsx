import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import Preloader from '../scenes/Preloader';
import MainMenu from '../scenes/MainMenu';
import Game from '../scenes/Game';
import '../App.css';

const GameCanvas: React.FC = () => {
  const phaserGame = useRef<Phaser.Game | null>(null);

  // State for health tracking
  const [heroHealth, setHeroHealth] = useState(100);
  const [castleHealth, setCastleHealth] = useState(100);

  // State for players and enemies count
  const [playersCount, setPlayersCount] = useState(1);
  const [enemiesCount, setEnemiesCount] = useState(10);

  // State for messages
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
          arcade: { gravity: { y: 0 }, debug: false },
        },
        scene: [Preloader, MainMenu, Game], // Order: Preloader first, then MainMenu, then Game
      });
    }

    return () => {
      phaserGame.current?.destroy(true);
      phaserGame.current = null;
    };
  }, []);

  const handleSendMessage = () => {
    console.log('Message sent:', message);
    setMessage('');
  };

  return (
    <div className="game-container">
      <div id="phaser-container" className="phaser-container"></div>

      {/* Data Panel */}
      <div className="data-panel">
        <div className="first-column">
          <div className="health-bar">
            <h3>Hero Health</h3>
            <div className="health-fill" style={{ width: `${heroHealth}%` }}></div>
          </div>

          <div className="health-bar">
            <h3>Castle Health</h3>
            <div className="health-fill" style={{ width: `${castleHealth}%` }}></div>
          </div>
        </div>

        <div className="second-column">
          <h6>Number of Players: {playersCount}</h6>
          <h6>Number of Enemies: {enemiesCount}</h6>
        </div>

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
