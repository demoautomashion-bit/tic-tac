"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

export default function MemoryGame({ step, onComplete }) {
  const [memoryCards, setMemoryCards] = useState([]);
  const [selectedMemoryIndices, setSelectedMemoryIndices] = useState([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);

  const initMemoryGame = () => {
    const symbolsList = step.symbols || ["❤️", "🌸", "🎁", "✈️", "🍿", "🧸", "🍕", "☕"];
    const doubleSymbols = [...symbolsList, ...symbolsList];
    const shuffled = doubleSymbols
      .map((sym, idx) => ({ id: idx, symbol: sym, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5);

    setMemoryCards(shuffled);
    setSelectedMemoryIndices([]);
    setMatchedPairsCount(0);
  };

  useEffect(() => {
    initMemoryGame();
  }, [step]);

  const handleMemoryCardClick = (idx) => {
    if (
      memoryCards[idx].isFlipped || 
      memoryCards[idx].isMatched || 
      selectedMemoryIndices.length >= 2
    ) return;

    const updatedCards = [...memoryCards];
    updatedCards[idx].isFlipped = true;
    setMemoryCards(updatedCards);

    const newSelections = [...selectedMemoryIndices, idx];
    setSelectedMemoryIndices(newSelections);

    const symbolsLength = step.symbols?.length || 8;

    if (newSelections.length === 2) {
      const [firstIdx, secondIdx] = newSelections;
      if (memoryCards[firstIdx].symbol === memoryCards[secondIdx].symbol) {
        setTimeout(() => {
          const matchedCards = [...memoryCards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setMemoryCards(matchedCards);
          setSelectedMemoryIndices([]);
          setMatchedPairsCount(prev => {
            const nextCount = prev + 1;
            if (nextCount === symbolsLength) {
              confetti({
                particleCount: 65,
                spread: 70,
                colors: ["#E68FA3", "#ECC695"]
              });
            }
            return nextCount;
          });
        }, 400);
      } else {
        setTimeout(() => {
          const resetCards = [...memoryCards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setMemoryCards(resetCards);
          setSelectedMemoryIndices([]);
        }, 1000);
      }
    }
  };

  const totalCards = memoryCards.length;
  let memoryCols = 4;
  if (totalCards <= 4) memoryCols = 2;
  else if (totalCards <= 12 && totalCards % 3 === 0) memoryCols = 3;
  else memoryCols = 4;

  return (
    <div className="game-card paper-vintage" style={{ maxWidth: "500px" }}>
      <div className="paper-vintage-bg"></div>
      {step.eyebrow && <span className="eyebrow" style={{ color: "#7A0923" }}>{step.eyebrow}</span>}
      <h3>{step.title}</h3>
      <p style={{ marginBottom: "1.5rem" }}>{step.instruction}</p>

      <div className="memory-grid" style={{ "--grid-cols": memoryCols }}>
        {memoryCards.map((card, idx) => {
          const isFlipped = card.isFlipped || card.isMatched;
          return (
            <div 
              key={card.id} 
              className={`memory-card ${isFlipped ? "flipped" : ""} ${card.isMatched ? "matched" : ""}`}
              onClick={() => handleMemoryCardClick(idx)}
            >
              <div className="memory-card-inner">
                <div className="memory-card-face memory-card-front"></div>
                <div className="memory-card-face memory-card-back">
                  <div className="paper-vintage-bg"></div>
                  {card.symbol}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="game-status">
        {matchedPairsCount === (step.symbols?.length || 8) 
          ? "Pairs matched! Continue to the next stage." 
          : `Pairs matched: ${matchedPairsCount} / ${step.symbols?.length || 8}`
        }
      </div>

      {matchedPairsCount === (step.symbols?.length || 8) && (
        <div style={{ animation: "pageFlipIn 0.5s ease forwards" }}>
          <button className="vintage-btn" onClick={onComplete}>
            Continue
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
