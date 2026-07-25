"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

export default function ConnectLoveGame({ step, onComplete }) {
  const initialPairs = [
    { id: 1, left: "🔑", right: "🔒", matchId: 1 },
    { id: 2, left: "✉️", right: "📬", matchId: 2 },
    { id: 3, left: "☕", right: "🍩", matchId: 3 },
    { id: 4, left: "🧸", right: "🎀", matchId: 4 }
  ];

  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [connections, setConnections] = useState([]); // Array of { leftId, rightId }
  const [shakeId, setShakeId] = useState(null);

  useEffect(() => {
    // Shuffle the items for matching
    const shuffledLeft = [...initialPairs].sort(() => Math.random() - 0.5);
    const shuffledRight = [...initialPairs].sort(() => Math.random() - 0.5);
    setLeftItems(shuffledLeft);
    setRightItems(shuffledRight);
  }, []);

  const handleLeftClick = (item) => {
    if (connections.some(c => c.leftId === item.id)) return;
    setSelectedLeft(item);
  };

  const handleRightClick = (item) => {
    if (!selectedLeft) return;
    if (connections.some(c => c.rightId === item.id)) return;

    if (selectedLeft.matchId === item.matchId) {
      const newConnections = [...connections, { leftId: selectedLeft.id, rightId: item.id }];
      setConnections(newConnections);
      setSelectedLeft(null);

      // Check if all connected
      if (newConnections.length === initialPairs.length) {
        setTimeout(() => {
          confetti({ particleCount: 50, spread: 60, colors: ["#E68FA3", "#ECC695"] });
          onComplete();
        }, 500);
      }
    } else {
      setShakeId(item.id);
      setTimeout(() => setShakeId(null), 500);
      setSelectedLeft(null);
    }
  };

  return (
    <div className="game-card paper-vintage" style={{ maxWidth: "480px" }}>
      <div className="paper-vintage-bg"></div>
      {step.eyebrow && <span className="eyebrow" style={{ color: "#7A0923" }}>{step.eyebrow}</span>}
      <h3>{step.title}</h3>
      <p>{step.instruction}</p>

      <div className="connect-love-container" style={{ display: "flex", justifyContent: "space-between", margin: "2rem 0", gap: "2rem" }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
          {leftItems.map(item => {
            const isSelected = selectedLeft?.id === item.id;
            const isConnected = connections.some(c => c.leftId === item.id);
            return (
              <button
                key={`left-${item.id}`}
                onClick={() => handleLeftClick(item)}
                className={`connect-btn ${isSelected ? "selected" : ""} ${isConnected ? "connected" : ""}`}
                style={{
                  padding: "1rem",
                  fontSize: "1.5rem",
                  borderRadius: "12px",
                  border: isSelected ? "2px solid var(--rose-pink)" : "1px solid rgba(139, 90, 43, 0.2)",
                  background: isConnected ? "rgba(230,143,163,0.15)" : isSelected ? "rgba(230,143,163,0.1)" : "rgba(255,255,255,0.4)",
                  cursor: isConnected ? "default" : "pointer",
                  opacity: isConnected ? 0.6 : 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "60px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease"
                }}
              >
                {item.left}
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
          {rightItems.map(item => {
            const isConnected = connections.some(c => c.rightId === item.id);
            const isShaking = shakeId === item.id;
            return (
              <button
                key={`right-${item.id}`}
                onClick={() => handleRightClick(item)}
                className={`connect-btn ${isShaking ? "shake" : ""} ${isConnected ? "connected" : ""}`}
                style={{
                  padding: "1rem",
                  fontSize: "1.5rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(139, 90, 43, 0.2)",
                  background: isConnected ? "rgba(230,143,163,0.15)" : "rgba(255,255,255,0.4)",
                  cursor: isConnected || !selectedLeft ? "default" : "pointer",
                  opacity: isConnected ? 0.6 : 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "60px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease"
                }}
              >
                {item.right}
              </button>
            );
          })}
        </div>
      </div>

      <div className="game-status">
        {connections.length === initialPairs.length
          ? "All connected! ❤️"
          : selectedLeft 
            ? "Now select the matching item on the right!" 
            : "Select an item on the left to start."}
      </div>
    </div>
  );
}
