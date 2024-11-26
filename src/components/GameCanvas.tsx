import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import Preloader from '../scenes/Preloader';
import Game from '../scenes/Game';
import "../App.css"; // Ensure this CSS file contains styles for the container

const GameCanvas: React.FC = () => {
  const phaserGame = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!phaserGame.current) {
      phaserGame.current = new Phaser.Game({
        type: Phaser.AUTO,
        scale: {
          mode: Phaser.Scale.RESIZE, // Resize dynamically to fit container
          parent: 'phaser-container',
          autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game
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

  return <div id="phaser-container" style={{ width: '98vw', height: '97vh', overflow: 'hidden' }}></div>;
};

export default GameCanvas;
