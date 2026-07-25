"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function CupidCatchGame({ step, onComplete }) {
  const target = step.targetScore || 10;
  const [score, setScore] = useState(0);
  const [basketX, setBasketX] = useState(50); // percentage 0-100
  const [items, setItems] = useState([]);
  const containerRef = useRef(null);
  const basketRef = useRef(null);
  const scoreRef = useRef(score);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Track touch/mouse movement to slide the basket smoothly
  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(5, Math.min(95, x)));
  };

  const onMouseMove = (e) => handleMove(e.clientX);
  const onTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

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
      const duration = Math.random() * 0.8 + 2.0; // 2.0s to 2.8s drop duration

      setItems(prev => [
        ...prev,
        {
          id: Math.random() + Date.now(),
          x: Math.random() * 80 + 10, // 10% to 90%
          duration,
          symbol: sym
        }
      ]);
    }, 800);

    return () => clearInterval(interval);
  }, [score, target, onComplete]);

  // Collision detection loop running at native RAF speed
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

        // Check bounding box overlap with basket
        const isOverlap = !(
          itemRect.right < basketRect.left ||
          itemRect.left > basketRect.right ||
          itemRect.bottom < basketRect.top ||
          itemRect.top > basketRect.bottom
        );

        if (isOverlap) {
          // Item caught!
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
        {/* Falling items using GPU accelerated CSS keyframe animation */}
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

        {/* Basket */}
        <div
          ref={basketRef}
          style={{
            position: "absolute",
            left: `${basketX}%`,
            bottom: "8px",
            transform: "translateX(-50%)",
            fontSize: "2.5rem",
            pointerEvents: "none",
            userSelect: "none",
            transition: "left 0.05s linear"
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
