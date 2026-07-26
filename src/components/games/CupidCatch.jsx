"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function CupidCatchGame({ step, onComplete }) {
  const target = step.targetScore || 10;
  const [score, setScore] = useState(0);
  const [items, setItems] = useState([]);
  const containerRef = useRef(null);
  const basketRef = useRef(null);
  const scoreRef = useRef(score);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Smooth GPU position update function
  const updateBasketPosition = (clientX) => {
    if (!containerRef.current || !basketRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const clampedX = Math.max(25, Math.min(rect.width - 25, relativeX));
    basketRef.current.style.transform = `translate3d(${clampedX}px, 0, 0) translateX(-50%)`;
  };

  const handlePointerMove = (e) => {
    requestAnimationFrame(() => updateBasketPosition(e.clientX));
  };

  // Center basket on initial render
  useEffect(() => {
    if (containerRef.current && basketRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      updateBasketPosition(rect.left + rect.width / 2);
    }
  }, []);

  // Spawn falling items
  useEffect(() => {
    if (score >= target) {
      confetti({ particleCount: 50, spread: 60, colors: ["#E68FA3", "#ECC695"] });
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      if (scoreRef.current >= target) return;
      const symbols = ["❤️", "🎁", "💖", "🍭", "🧸", "🌸"];
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      const duration = Math.random() * 0.8 + 2.0;

      setItems(prev => [
        ...prev,
        {
          id: Math.random() + Date.now(),
          x: Math.random() * 80 + 10,
          duration,
          symbol: sym
        }
      ]);
    }, 800);

    return () => clearInterval(interval);
  }, [score, target, onComplete]);

  // Collision detection loop
  useEffect(() => {
    if (scoreRef.current >= target) return;

    let animId;
    const checkCollisions = () => {
      if (!basketRef.current || !containerRef.current) {
        animId = requestAnimationFrame(checkCollisions);
        return;
      }

      const basketRect = basketRef.current.getBoundingClientRect();
      const itemElements = containerRef.current.querySelectorAll(".falling-item");

      itemElements.forEach(el => {
        const itemRect = el.getBoundingClientRect();
        const itemId = el.getAttribute("data-id");

        const isOverlap = !(
          itemRect.right < basketRect.left ||
          itemRect.left > basketRect.right ||
          itemRect.bottom < basketRect.top ||
          itemRect.top > basketRect.bottom
        );

        if (isOverlap) {
          setScore(s => {
            const nextScore = s + 1;
            scoreRef.current = nextScore;
            return nextScore;
          });
          setItems(prev => prev.filter(i => String(i.id) !== itemId));
        }
      });

      animId = requestAnimationFrame(checkCollisions);
    };

    animId = requestAnimationFrame(checkCollisions);
    return () => cancelAnimationFrame(animId);
  }, [target]);

  const handleAnimationEnd = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="game-card paper-vintage" style={{ maxWidth: "480px", width: "100%" }}>
      <div className="paper-vintage-bg"></div>
      {step.eyebrow && <span className="eyebrow" style={{ color: "#7A0923" }}>{step.eyebrow}</span>}
      <h3>{step.title}</h3>
      <p style={{ marginBottom: "1rem" }}>{step.instruction}</p>

      <div 
        ref={containerRef}
        className="cupid-catch-container"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerMove}
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
          marginTop: "1.5rem",
          width: "100%"
        }}
      >
        {/* Falling items */}
        {items.map(item => (
          <div
            key={item.id}
            data-id={item.id}
            className="falling-item"
            onAnimationEnd={() => handleAnimationEnd(item.id)}
            style={{
              position: "absolute",
              left: `${item.x}%`,
              top: 0,
              fontSize: "1.6rem",
              pointerEvents: "none",
              willChange: "transform",
              animation: `smoothFall ${item.duration}s linear forwards`
            }}
          >
            {item.symbol}
          </div>
        ))}

        {/* Basket with zero-latency GPU transform */}
        <div
          ref={basketRef}
          style={{
            position: "absolute",
            left: 0,
            bottom: "8px",
            fontSize: "2.5rem",
            pointerEvents: "none",
            userSelect: "none",
            willChange: "transform"
          }}
        >
          🧺
        </div>
      </div>

      <style jsx>{`
        @keyframes smoothFall {
          0% {
            transform: translate(-50%, -30px);
          }
          100% {
            transform: translate(-50%, 270px);
          }
        }
      `}</style>

      <div className="game-status" style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--ink)", marginTop: "1rem" }}>
        Score: {score} / {target}
      </div>
    </div>
  );
}
