"use client";

import { useState } from "react";
import confetti from "canvas-confetti";

const THEMES_MINI = [
  { id: 'burgundy', name: 'Burgundy Wine', icon: '🍷' },
  { id: 'amethyst', name: 'Amethyst Violet', icon: '🔮' },
  { id: 'emerald', name: 'Emerald Forest', icon: '🌿' },
  { id: 'sapphire', name: 'Sapphire Ocean', icon: '💎' },
  { id: 'luxury-gold', name: 'Honey Gold', icon: '✨' },
  { id: 'blossom-light', name: 'Rose Blossom', icon: '🌸' }
];

export default function Quiz({ step, onComplete, currentTheme, onSelectTheme }) {
  const [selectedQuizOpt, setSelectedQuizOpt] = useState(null);
  const [quizStatus, setQuizStatus] = useState("idle");
  const [shakeQuizCard, setShakeQuizCard] = useState(false);

  const handleQuizSelection = (index) => {
    if (quizStatus === "correct") return;
    setSelectedQuizOpt(index);

    if (index === step.correctIndex) {
      setQuizStatus("correct");
      confetti({
        particleCount: 45,
        spread: 50,
        origin: { y: 0.8 }
      });
    } else {
      setQuizStatus("incorrect");
      setShakeQuizCard(true);
      setTimeout(() => {
        setShakeQuizCard(false);
        setSelectedQuizOpt(null);
        setQuizStatus("idle");
      }, 500);
    }
  };

  return (
    <div className={`stage-panel ${shakeQuizCard ? "shake" : ""}`}>
      <div className="quiz-card paper-vintage">
        <div className="paper-vintage-bg"></div>

        {/* Quiz Stage Header Theme Quick Switcher */}
        {onSelectTheme && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px stroke rgba(0,0,0,0.1)' }}>
            {step.eyebrow && <span className="eyebrow" style={{ color: "var(--ink)", margin: 0 }}>{step.eyebrow}</span>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.68rem', opacity: 0.6, marginRight: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Theme:</span>
              {THEMES_MINI.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSelectTheme(t.id)}
                  title={t.name}
                  style={{
                    border: 'none',
                    background: currentTheme === t.id ? 'rgba(0,0,0,0.12)' : 'transparent',
                    borderRadius: '6px',
                    padding: '2px 4px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    transition: 'transform 0.15s ease',
                    transform: currentTheme === t.id ? 'scale(1.2)' : 'scale(1)'
                  }}
                >
                  {t.icon}
                </button>
              ))}
            </div>
          </div>
        )}

        {!onSelectTheme && step.eyebrow && <span className="eyebrow" style={{ color: "#7A0923" }}>{step.eyebrow}</span>}
        <h3>{step.title}</h3>
        <p className="question">{step.question}</p>

        <div className="quiz-options">
          {(step.options || []).map((option, idx) => {
            let optClass = "";
            if (selectedQuizOpt === idx) {
              optClass = quizStatus === "correct" ? "correct" : "incorrect";
            }
            return (
              <button 
                key={idx}
                className={`quiz-option ${optClass}`}
                disabled={quizStatus === "correct"}
                onClick={() => handleQuizSelection(idx)}
              >
                {option}
              </button>
            );
          })}
        </div>

        {quizStatus === "correct" && (
          <div style={{ marginTop: "2.5rem", animation: "pageFlipIn 0.5s ease forwards" }}>
            <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", marginBottom: "1.5rem", color: "#1b5e20" }}>
              {step.successText}
            </p>
            <button className="vintage-btn" onClick={onComplete}>
              Continue
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
