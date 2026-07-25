"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

export default function TicTacToeGame({ step, onComplete }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [playerSymbol] = useState("❤️");
  const [aiSymbol] = useState("⭕");
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameWinner, setGameWinner] = useState(null);
  const [gameStatus, setGameStatus] = useState("Your turn! Place a heart on the grid.");

  const winCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const checkWinner = (tempBoard) => {
    for (let combo of winCombos) {
      const [a, b, c] = combo;
      if (tempBoard[a] && tempBoard[a] === tempBoard[b] && tempBoard[a] === tempBoard[c]) {
        return tempBoard[a];
      }
    }
    if (tempBoard.every(cell => cell !== null)) return "Draw";
    return null;
  };

  const handleCellClick = (index) => {
    if (board[index] || gameWinner || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = playerSymbol;
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      handleGameOver(winner);
    } else {
      setIsPlayerTurn(false);
      setGameStatus("Computer is choosing...");
    }
  };

  useEffect(() => {
    if (isPlayerTurn || gameWinner) return;

    const aiTimer = setTimeout(() => {
      const emptyCells = board.map((cell, idx) => cell === null ? idx : null).filter(val => val !== null);
      if (emptyCells.length === 0) return;

      let aiMove = null;

      // Try to win
      for (let cell of emptyCells) {
        const boardCopy = [...board];
        boardCopy[cell] = aiSymbol;
        if (checkWinner(boardCopy) === aiSymbol) {
          aiMove = cell;
          break;
        }
      }

      // Block player
      if (aiMove === null) {
        for (let cell of emptyCells) {
          const boardCopy = [...board];
          boardCopy[cell] = playerSymbol;
          if (checkWinner(boardCopy) === playerSymbol) {
            aiMove = cell;
            break;
          }
        }
      }

      // Random choice
      if (aiMove === null) {
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        aiMove = emptyCells[randomIndex];
      }

      const newBoard = [...board];
      newBoard[aiMove] = aiSymbol;
      setBoard(newBoard);

      const winner = checkWinner(newBoard);
      if (winner) {
        handleGameOver(winner);
      } else {
        setIsPlayerTurn(true);
        setGameStatus("Your turn! Place your heart.");
      }
    }, 600);

    return () => clearTimeout(aiTimer);
  }, [isPlayerTurn, board, gameWinner]);

  const handleGameOver = (winner) => {
    setGameWinner(winner);
    if (winner === playerSymbol) {
      setGameStatus("You win! ❤️ You've unlocked the next puzzle.");
      confetti({
        particleCount: 50,
        spread: 60,
        colors: ["#E68FA3", "#ECC695"]
      });
    } else if (winner === aiSymbol) {
      setGameStatus("Looks like I won this round! Let's try again.");
    } else {
      setGameStatus("It's a draw! Let's play one more time.");
    }
  };

  const resetTicTacToe = () => {
    setBoard(Array(9).fill(null));
    setGameWinner(null);
    setIsPlayerTurn(true);
    setGameStatus("Your turn! Place your heart.");
  };

  return (
    <div className="game-card paper-vintage">
      <div className="paper-vintage-bg"></div>
      {step.eyebrow && <span className="eyebrow" style={{ color: "#7A0923" }}>{step.eyebrow}</span>}
      <h3>{step.title}</h3>
      <p>{step.instruction}</p>

      <div className="game-board">
        {board.map((cell, idx) => (
          <div 
            key={idx} 
            className={`game-cell ${cell ? "occupied" : ""}`}
            onClick={() => handleCellClick(idx)}
          >
            {cell}
          </div>
        ))}
      </div>

      <div className="game-status">{gameStatus}</div>

      {gameWinner && gameWinner !== playerSymbol && (
        <button className="vintage-btn" onClick={resetTicTacToe} style={{ background: "#ECC695", marginRight: "10px" }}>
          Try Again
        </button>
      )}

      {gameWinner === playerSymbol && (
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
