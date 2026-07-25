"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function LoveRhythmGame({ step, onComplete }) {
  const target = step.targetHits || 5;
  const [hits, setHits] = useState(0);
  const [feedback, setFeedback] = useState("Get Ready...");
  const [feedbackClass, setFeedbackClass] = useState("");
  const [ringScale, setRingScale] = useState(2.0);
  const ringScaleRef = useRef(2.0);

  useEffect(() => {
    if (hits >= target) {
      confetti({ particleCount: 50, spread: 60, colors: ["#E68FA3", "#ECC695"] });
      onComplete();
      return;
    }

    let lastTime = Date.now();
    let animId;

    const gameLoop = () => {
      const now = Date.now();
      const elapsed = now - lastTime;
      lastTime = now;

      let nextScale = ringScaleRef.current - elapsed * 0.0008;
      if (nextScale <= 0.8) {
        nextScale = 2.2;
        setFeedback("Miss! 💔");
        setFeedbackClass("miss");
      }
      ringScaleRef.current = nextScale;
      setRingScale(nextScale);

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [hits, target, onComplete]);

  const handleTap = () => {
    if (hits >= target) return;

    const currentScale = ringScaleRef.current;
    const diff = Math.abs(currentScale - 1.0);

    if (diff < 0.12) {
      setHits(h => h + 1);
      setFeedback("PERFECT! ❤️");
      setFeedbackClass("perfect");
      ringScaleRef.current = 2.2;
    } else if (diff < 0.28) {
      setHits(h => h + 1);
      setFeedback("GREAT! ✨");
      setFeedbackClass("great");
      ringScaleRef.current = 2.2;
    } else {
      setFeedback("Too Early/Late! 💔");
      setFeedbackClass("miss");
    }
  };

  return (
    <div className="game-card paper-vintage" style={{ maxWidth: "480px" }}>
      <div className="paper-vintage-bg"></div>
      {step.eyebrow && <span className="eyebrow" style={{ color: "#7A0923" }}>{step.eyebrow}</span>}
      <h3>{step.title}</h3>
      <p>{step.instruction}</p>

      {/* Rhythm Tap Visual Area */}
      <div
        onClick={handleTap}
        style={{
          position: "relative",
          height: "220px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(139, 90, 43, 0.12)",
          borderRadius: "12px",
          margin: "2rem 0",
          cursor: "pointer",
          userSelect: "none",
          touchAction: "manipulation"
        }}
      >
        {/* Pulsing ring */}
        <div
          style={{
            position: "absolute",
            width: "80px",
            height: "80px",
            border: "2.5px solid var(--rose-pink)",
            borderRadius: "50%",
            transform: `scale(${ringScale})`,
            pointerEvents: "none",
            opacity: Math.max(0, 1 - (ringScale - 1) / 1.2),
            boxShadow: "0 0 10px var(--rose-pink)"
          }}
        />

        {/* Target Ring */}
        <div
          style={{
            position: "absolute",
            width: "80px",
            height: "80px",
            border: "2px dashed var(--ink)",
            borderRadius: "50%",
            pointerEvents: "none",
            opacity: 0.4
          }}
        />

        {/* Central Heart Button/Indicator */}
        <div
          style={{
            position: "absolute",
            fontSize: "3rem",
            pointerEvents: "none",
            animation: "heartbeat 1.5s infinite"
          }}
        >
          ❤️
        </div>

        {/* Tap overlay instructions */}
        <div style={{ position: "absolute", bottom: "10px", fontSize: "0.75rem", opacity: 0.5 }}>
          TAP ANYWHERE TO MATCH
        </div>
      </div>

      <div className={`game-status ${feedbackClass}`} style={{ fontSize: "1.2rem", fontWeight: "bold", minHeight: "30px" }}>
        {feedback}
      </div>

      <div className="game-status" style={{ marginTop: "0.5rem" }}>
        Progress: {hits} / {target} Hits
      </div>
    </div>
  );
}
