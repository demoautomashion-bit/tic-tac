"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

export default function Confession({ step }) {
  const [sigText, setSigText] = useState("one more thing");

  const getReduceMotion = () => {
    return typeof window !== "undefined" && window.matchMedia 
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches 
      : false;
  };

  useEffect(() => {
    if (getReduceMotion()) return;

    const cards = document.querySelectorAll(".flip-card");
    const handleMove = (e, card) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      const angleX = ((yc - y) / yc) * 10;
      const angleY = ((x - xc) / xc) * 10;
      card.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.02)`;
    };
    const handleLeave = (card) => {
      card.style.transform = "";
    };

    cards.forEach(card => {
      const moveListener = (e) => handleMove(e, card);
      const leaveListener = () => handleLeave(card);
      card.addEventListener("mousemove", moveListener);
      card.addEventListener("mouseleave", leaveListener);

      card._moveListener = moveListener;
      card._leaveListener = leaveListener;
    });

    return () => {
      cards.forEach(card => {
        if (card._moveListener) card.removeEventListener("mousemove", card._moveListener);
        if (card._leaveListener) card.removeEventListener("mouseleave", card._leaveListener);
      });
    };
  }, [step]);

  const handleConfetti = () => {
    confetti({
      particleCount: 95,
      spread: 80,
      startVelocity: 34,
      origin: { y: 0.65 },
      colors: ["#E68FA3", "#ECC695", "#7A0923"]
    });
    setSigText("I mean it.");
  };

  return (
    <div className="stage-panel">
      {/* Reasons Grid */}
      <section style={{ marginBottom: "4rem" }}>
        <div className="section-inner">
          {step.eyebrow && <span className="eyebrow">{step.eyebrow}</span>}
          <div className="heart-divider">
            <svg viewBox="0 0 32 29"><path d="M23.6 0c-3 0-5.7 1.7-7.6 4.4C14.1 1.7 11.4 0 8.4 0 3.8 0 0 3.9 0 8.8c0 8.4 8.6 13 15.4 19.6.3.3.9.3 1.2 0C23.4 21.8 32 17.2 32 8.8 32 3.9 28.2 0 23.6 0z"/></svg>
          </div>
          <h2 className="section-title">{step.title}</h2>
          <div className="reasons-grid" id="reasonsGrid">
            {(step.reasons || []).map((r, i) => (
              <div 
                key={i} 
                className="flip-card reveal in"
              >
                <div className="flip-inner">
                  <div className="flip-face flip-front">
                    <span className="num">{(i + 1).toString().padStart(2, "0")}</span>
                  </div>
                  <div className="flip-face flip-back paper-vintage">
                    <div className="paper-vintage-bg"></div>
                    <p>{r}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {(step.polaroids || []).length > 0 && (
        <section style={{ marginBottom: "4rem" }}>
          <div className="section-inner" style={{ maxWidth: "1000px" }}>
            <span className="eyebrow">snapshots</span>
            <div className="heart-divider">
              <svg viewBox="0 0 32 29"><path d="M23.6 0c-3 0-5.7 1.7-7.6 4.4C14.1 1.7 11.4 0 8.4 0 3.8 0 0 3.9 0 8.8c0 8.4 8.6 13 15.4 19.6.3.3.9.3 1.2 0C23.4 21.8 32 17.2 32 8.8 32 3.9 28.2 0 23.6 0z"/></svg>
            </div>
            <h2 className="section-title">Some of my favorite moments</h2>
            <div className="gallery">
              {(step.polaroids || []).map((p, i) => (
                <div 
                  key={i} 
                  className="polaroid paper-vintage reveal in" 
                  style={{ transform: `rotate(${p.rot}deg)` }}
                >
                  <div className="paper-vintage-bg"></div>
                  <div className="polaroid-img">
                    {p.url ? (
                      <img src={p.url} alt={p.cap} />
                    ) : (
                      <span>[ your photo here ]</span>
                    )}
                  </div>
                  <div className="polaroid-cap">{p.cap}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final Letter */}
      <div className="closing-card paper-vintage">
        <div className="paper-vintage-bg"></div>
        <h2>{step.closingLetter}</h2>
        <div className="sig">{step.closingSig}</div>
        <button type="button" className="one-more" onClick={handleConfetti} id="oneMoreBtn">
          <span>{sigText}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </button>
      </div>
    </div>
  );
}
