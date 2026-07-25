"use client";

import { useState } from "react";
import confetti from "canvas-confetti";

export default function Quiz({ step, onComplete }) {
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
        {step.eyebrow && <span className="eyebrow" style={{ color: "#7A0923" }}>{step.eyebrow}</span>}
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
