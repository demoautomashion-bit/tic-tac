"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

export default function WordScrambleGame({ step, onComplete }) {
  const originalWord = (step.targetWord || "FOREVER").toUpperCase();
  const [scrambled, setScrambled] = useState([]);
  const [guess, setGuess] = useState([]);

  useEffect(() => {
    const letterObjs = originalWord.split("").map((char, index) => ({ id: index, char }));
    let shuffled = [...letterObjs];
    do {
      shuffled.sort(() => Math.random() - 0.5);
    } while (shuffled.map(l => l.char).join("") === originalWord && originalWord.length > 1);

    setScrambled(shuffled);
    setGuess([]);
  }, [originalWord]);

  const handleScrambledClick = (letterObj) => {
    setScrambled(prev => prev.filter(l => l.id !== letterObj.id));
    setGuess(prev => [...prev, letterObj]);
  };

  const handleGuessClick = (letterObj) => {
    setGuess(prev => prev.filter(l => l.id !== letterObj.id));
    setScrambled(prev => [...prev, letterObj]);
  };

  useEffect(() => {
    if (guess.length === originalWord.length && guess.length > 0) {
      const currentWord = guess.map(l => l.char).join("");
      if (currentWord === originalWord) {
        setTimeout(() => {
          confetti({ particleCount: 50, spread: 60, colors: ["#E68FA3", "#ECC695"] });
          onComplete();
        }, 400);
      }
    }
  }, [guess, originalWord, onComplete]);

  return (
    <div className="game-card paper-vintage" style={{ maxWidth: "480px" }}>
      <div className="paper-vintage-bg"></div>
      {step.eyebrow && <span className="eyebrow" style={{ color: "#7A0923" }}>{step.eyebrow}</span>}
      <h3>{step.title}</h3>
      <p>{step.instruction}</p>

      {/* Target Word Slots */}
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", margin: "2rem 0", minHeight: "50px" }}>
        {Array.from({ length: originalWord.length }).map((_, idx) => {
          const letter = guess[idx];
          return (
            <div
              key={idx}
              onClick={() => letter && handleGuessClick(letter)}
              style={{
                width: "45px",
                height: "45px",
                borderBottom: "2px solid var(--ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: "bold",
                cursor: letter ? "pointer" : "default",
                fontFamily: "var(--sans)",
                background: letter ? "rgba(230,143,163,0.1)" : "transparent",
                borderRadius: "4px",
                transition: "all 0.2s ease"
              }}
            >
              {letter?.char || ""}
            </div>
          );
        })}
      </div>

      {/* Scrambled Letters Pool */}
      <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
        {scrambled.map(letter => (
          <button
            key={letter.id}
            onClick={() => handleScrambledClick(letter)}
            className="vintage-btn"
            style={{
              padding: "0.6rem 1rem",
              minWidth: "40px",
              fontSize: "1.2rem",
              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              borderRadius: "8px",
              background: "var(--champagne)"
            }}
          >
            {letter.char}
          </button>
        ))}
      </div>

      <div className="game-status">
        {guess.length === originalWord.length && guess.map(l => l.char).join("") !== originalWord
          ? "Not quite! Click letters to send them back."
          : "Tap letters to arrange them."}
      </div>
    </div>
  );
}
