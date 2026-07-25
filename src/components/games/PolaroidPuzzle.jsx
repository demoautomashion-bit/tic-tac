"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

export default function PolaroidPuzzleGame({ step, onComplete }) {
  const [board, setBoard] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const [isSolved, setIsSolved] = useState(false);

  const getAdjacentMoves = (index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const moves = [];
    if (row > 0) moves.push(index - 3);
    if (row < 2) moves.push(index + 3);
    if (col > 0) moves.push(index - 1);
    if (col < 2) moves.push(index + 1);
    return moves;
  };

  const shufflePuzzle = () => {
    let currentBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    let emptyIndex = 8;

    for (let i = 0; i < 40; i++) {
      const validMoves = getAdjacentMoves(emptyIndex);
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      currentBoard[emptyIndex] = currentBoard[randomMove];
      currentBoard[randomMove] = 8;
      emptyIndex = randomMove;
    }
    setBoard(currentBoard);
    setIsSolved(false);
  };

  useEffect(() => {
    shufflePuzzle();
  }, [step.imageUrl]);

  const handleTileClick = (index) => {
    if (isSolved) return;
    const emptyIndex = board.indexOf(8);
    const validMoves = getAdjacentMoves(index);

    if (validMoves.includes(emptyIndex)) {
      const newBoard = [...board];
      newBoard[emptyIndex] = board[index];
      newBoard[index] = 8;
      setBoard(newBoard);

      const solved = newBoard.every((val, idx) => val === idx);
      if (solved) {
        setIsSolved(true);
        setTimeout(() => {
          confetti({ particleCount: 50, spread: 60, colors: ["#E68FA3", "#ECC695"] });
          onComplete();
        }, 500);
      }
    }
  };

  const imageUrl = step.imageUrl || "";

  return (
    <div className="game-card paper-vintage" style={{ maxWidth: "440px" }}>
      <div className="paper-vintage-bg"></div>
      {step.eyebrow && <span className="eyebrow" style={{ color: "#7A0923" }}>{step.eyebrow}</span>}
      <h3>{step.title}</h3>
      <p>{step.instruction}</p>

      {/* Grid container */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "4px",
          width: "300px",
          height: "300px",
          margin: "2rem auto",
          background: "rgba(139, 90, 43, 0.1)",
          padding: "4px",
          borderRadius: "8px",
          border: "1px solid rgba(139, 90, 43, 0.2)"
        }}
      >
        {board.map((tileValue, index) => {
          const isEmpty = tileValue === 8;
          const targetRow = Math.floor(tileValue / 3);
          const targetCol = tileValue % 3;

          const bgX = (targetCol * 50) + "%";
          const bgY = (targetRow * 50) + "%";

          return (
            <div
              key={index}
              onClick={() => handleTileClick(index)}
              style={{
                borderRadius: "4px",
                cursor: isEmpty || isSolved ? "default" : "pointer",
                background: isEmpty 
                  ? "transparent" 
                  : imageUrl 
                    ? `url(${imageUrl})` 
                    : "linear-gradient(135deg, var(--rose-pink), var(--champagne))",
                backgroundSize: "300px 300px",
                backgroundPosition: `${bgX} ${bgY}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                fontWeight: "bold",
                color: imageUrl ? "transparent" : "var(--bg-dark-1)",
                boxShadow: isEmpty ? "none" : "inset 0 0 10px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.1)",
                transition: "background 0.2s, transform 0.1s ease",
                position: "relative",
                aspectRatio: "1 / 1"
              }}
            >
              {!isEmpty && !imageUrl && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: "1.4rem" }}>❤️</span>
                  <span style={{ fontSize: "0.65rem", opacity: 0.6, marginTop: "-4px" }}>{tileValue + 1}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="game-status">
        {isSolved ? "Solved! Beautiful. ❤️" : "Click tiles next to the empty space to slide."}
      </div>

      {!isSolved && (
        <button className="vintage-btn" onClick={shufflePuzzle} style={{ background: "#ECC695", fontSize: "0.7rem", padding: "0.5rem 1rem" }}>
          Reset Puzzle
        </button>
      )}
    </div>
  );
}
