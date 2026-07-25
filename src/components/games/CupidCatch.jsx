"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function CupidCatchGame({ step, onComplete }) {
  const target = step.targetScore || 10;
  const [score, setScore] = useState(0);
  const [basketX, setBasketX] = useState(50); // percentage 0-100
  const [items, setItems] = useState([]);
  const containerRef = useRef(null);
  const basketXRef = useRef(basketX);
  const scoreRef = useRef(score);

  useEffect(() => {
    basketXRef.current = basketX;
  }, [basketX]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Handle touch / mouse movement inside container to move basket
  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(0, Math.min(100, x)));
  };

  const onMouseMove = (e) => handleMove(e.clientX);
  const onTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    if (score >= target) {
      confetti({ particleCount: 50, spread: 60, colors: ["#E68FA3", "#ECC695"] });
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      // Spawn a new item
      const symbols = ["❤️", "🎁", "💖", "🍭", "🧸", "🌸"];
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      setItems(prev => [
        ...prev,
        {
          id: Math.random(),
          x: Math.random() * 90 + 5, // 5% to 95%
          y: 0,
          speed: Math.random() * 0.4 + 0.6,
          symbol: sym
        }
      ]);
    }, 900);

    return () => clearInterval(interval);
  }, [score, target, onComplete]);

  useEffect(() => {
    if (scoreRef.current >= target) return;

    let animId;
    const updatePhysics = () => {
      if (scoreRef.current >= target) return;
      setItems(prev => {
        const next = [];
        for (let item of prev) {
          const nextY = item.y + item.speed;
          // Check collision with basket when y reaches around 82-90%
          if (nextY >= 82 && nextY <= 90) {
            const distance = Math.abs(item.x - basketXRef.current);
            if (distance < 12) { // Caught!
              setScore(s => s + 1);
              continue; // remove item
            }
          }
          if (nextY < 100) {
            next.push({ ...item, y: nextY });
          }
        }
        return next;
      });
      animId = requestAnimationFrame(updatePhysics);
    };
    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [target]);

  return (
    <div className="game-card paper-vintage" style={{ maxWidth: "480px" }}>
      <div className="paper-vintage-bg"></div>
      {step.eyebrow && <span className="eyebrow" style={{ color: "#7A0923" }}>{step.eyebrow}</span>}
      <h3>{step.title}</h3>
      <p style={{ marginBottom: "1rem" }}>{step.instruction}</p>

      <div 
        ref={containerRef}
        className="cupid-catch-container"
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
        style={{
          position: "relative",
          height: "260px",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(139, 90, 43, 0.15)",
          borderRadius: "8px",
          overflow: "hidden",
          cursor: "none",
          userSelect: "none",
          touchAction: "none",
          marginTop: "1.5rem"
        }}
      >
        {/* Falling items */}
        {items.map(item => (
          <div
            key={item.id}
            style={{
              position: "absolute",
              left: `${item.x}%`,
              top: `${item.y}%`,
              fontSize: "1.5rem",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none"
            }}
          >
            {item.symbol}
          </div>
        ))}

        {/* Basket */}
        <div
          style={{
            position: "absolute",
            left: `${basketX}%`,
            bottom: "8px",
            transform: "translateX(-50%)",
            fontSize: "2.5rem",
            pointerEvents: "none",
            userSelect: "none"
          }}
        >
          🧺
        </div>
      </div>

      <div className="game-status" style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--ink)" }}>
        Score: {score} / {target}
      </div>
    </div>
  );
}
