import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import Preloader from "../scenes/Preloader";
import MainMenu from "../scenes/MainMenu";
import Game from "../scenes/Game";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";
import EventBus from "../EventBus";

const GameCanvas: React.FC = () => {
  const phaserGame = useRef<Phaser.Game | null>(null);

  const [heroHealth, setHeroHealth] = useState(20);
  const [castleHealth, setCastleHealth] = useState(100);

  const [playersCount, setPlayersCount] = useState(1);
  const [enemiesCount, setEnemiesCount] = useState(10);

  // State for messages
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ text: string, sender: string, socketId: string }[]>([]);
  const [localSocketId, setLocalSocketId] = useState<string>("");


  const updateHeroHealth = (healthIncrease: number, socketId: string, socket: any, roomCode: string) => {
    setHeroHealth((prevHealth) => Math.min(prevHealth + healthIncrease, 100));
    if (updatedHealth <= 0) {
      socket.emit("updatePlayerIsDead", { socketId, isDead: true, roomCode });
    }
    return updatedHealth;
  };

  const handleShowMessages = (data, localId) => {
    console.log(data); // For debugging
    const { message, playerName, socketId } = data;
    setLocalSocketId(localId);
    const newMessage = {
      text: message,
      sender: playerName,
      socketId: socketId,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };
  

  const handleSendMessage = () => {
      EventBus.emit("handleSendMessages",message)
  };

  useEffect(() => {
    if (!phaserGame.current) {
      phaserGame.current = new Phaser.Game({
        type: Phaser.AUTO,
        scale: {
          mode: Phaser.Scale.RESIZE,
          parent: "phaser-container",
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
          default: "arcade",
          arcade: { gravity: { y: 0 } },
        },
        dom: {
          createContainer: true,
        },
        scene: [Preloader, MainMenu, Game],
        input: {
          keyboard: true,
        },
      });
    }
    EventBus.on("updateHeroHealth", updateHeroHealth);
    EventBus.on("ShowMessages", handleShowMessages);

    return () => {
      EventBus.off("updateHeroHealth", updateHeroHealth);
      EventBus.off("ShowMessages",handleShowMessages);
      phaserGame.current?.destroy(true);
      phaserGame.current = null;
    };
  }, []);

  return (
    <div className="game-container">
      <div id="phaser-container" className="phaser-container"></div>

      {/* Data Panel */}
      <div className="data-panel">
        {/* Health and Players Info */}
        <div className="first-column">
          {/* Hero's Health */}
          <div className="health-bar">
            <h3>Hero's Health</h3>
            <div className="health-background">
              <div className="health-fill" style={{ width: `${heroHealth}%` }}></div>
            </div>
          </div>
          {/* Castle Health */}
          <div className="health-bar">
            <h3>Castle Health</h3>
            <div className="health-background">
              <div className="health-fill" style={{ width: `${castleHealth}%` }}></div>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="chat-container">
  <div className="chat-messages">
    {messages.map((msg, index) => (
      <div
        key={index}
        className={`message ${msg.socketId === localSocketId ? "left" : "right"}`}
      >
        <span className="message-sender">{msg.sender}:</span>
        <span className="message-text">{msg.text}</span>
      </div>
    ))}
  </div>
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

      {/* ToastContainer for showing notifications */}
      <ToastContainer limit={3} />
    </div>
  );
};

export default GameCanvas;
