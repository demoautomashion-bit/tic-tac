import { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';

export default function App() {
  const [veilHidden, setVeilHidden] = useState(false);
  const [stage, setStage] = useState('envelope'); // 'envelope', 'quiz1', 'timeline', 'quiz2', 'tictactoe', 'memory', 'confession'
  
  // Envelope opening state classes ('', 'open-step1', 'open-step1 open-step2', 'open-step1 open-step2 open-step3')
  const [envOpenClass, setEnvOpenClass] = useState('');

  // Quiz 1 States
  const [selectedQuiz1Opt, setSelectedQuiz1Opt] = useState(null);
  const [quiz1Status, setQuiz1Status] = useState('idle'); // 'idle', 'correct', 'incorrect'
  const [shakeQuiz1Card, setShakeQuiz1Card] = useState(false);

  // Timeline Read Milestones checklist
  const [readMilestones, setReadMilestones] = useState({ 0: false, 1: false, 2: false, 3: false });

  // Quiz 2 States
  const [selectedQuiz2Opt, setSelectedQuiz2Opt] = useState(null);
  const [quiz2Status, setQuiz2Status] = useState('idle'); // 'idle', 'correct', 'incorrect'
  const [shakeQuiz2Card, setShakeQuiz2Card] = useState(false);

  // Tic-Tac-Toe States
  const [board, setBoard] = useState(Array(9).fill(null));
  const [playerSymbol] = useState('❤️');
  const [aiSymbol] = useState('⭕');
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameWinner, setGameWinner] = useState(null); // '❤️', '⭕', 'Draw', null
  const [gameStatus, setGameStatus] = useState('Your turn! Place a heart on the grid.');

  // Memory Match States
  const [memoryCards, setMemoryCards] = useState([]);
  const [selectedMemoryIndices, setSelectedMemoryIndices] = useState([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);

  // Final Signature Confetti
  const [sigText, setSigText] = useState('one more thing');

  const canvasRef = useRef(null);

  // Quiz 1 Data
  const quiz1Data = {
    question: "Where did we first cross paths?",
    options: [
      "The cozy local coffee shop",
      "Under the roof of the library study room",
      "Waiting at that rainy bus stop",
      "A mutual friend's birthday gathering"
    ],
    correctIndex: 2
  };

  // Quiz 2 Data
  const quiz2Data = {
    question: "What is my absolute favorite way to spend a lazy Sunday with you?",
    options: [
      "Going on an intensive hiking trail",
      "Sleeping in late and ordering takeout pancakes",
      "Spending the whole day doing household chores",
      "Running bulk errands at the supermarket"
    ],
    correctIndex: 1
  };

  // 1. Veil fadeout on load
  useEffect(() => {
    const timer = setTimeout(() => setVeilHidden(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // 2. Interactive Canvas Fireflies Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const fireflies = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
      fireflies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: -Math.random() * 0.4 - 0.15,
        opacity: Math.random() * 0.55 + 0.2,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.015,
      });
    }

    let mouse = { x: null, y: null };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (let f of fireflies) {
        f.y += f.speedY;
        f.angle += f.angleSpeed;
        f.x += f.speedX + Math.sin(f.angle) * 0.15;

        // Wrap around edges
        if (f.y < -10) f.y = height + 10;
        if (f.x < -10) f.x = width + 10;
        if (f.x > width + 10) f.x = -10;

        // Mouse repulsion
        if (mouse.x !== null && mouse.y !== null) {
          const dx = f.x - mouse.x;
          const dy = f.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            const force = (90 - dist) / 90;
            f.x += (dx / dist) * force * 2.5;
            f.y += (dy / dist) * force * 2.5;
          }
        }

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 197, 148, ${f.opacity * (0.6 + Math.sin(f.angle * 2) * 0.4)})`;
        ctx.shadowBlur = f.size * 2.5;
        ctx.shadowColor = 'rgba(230, 197, 148, 0.7)';
        ctx.fill();
      }
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  // 3. Cursor Heart Trail (fine pointers only, respects reduced motion)
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (reduceMotion || !finePointer) return;

    let lastSpawn = 0;
    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastSpawn < 120) return;
      if (Math.random() > 0.45) return;
      lastSpawn = now;

      const heart = document.createElement('div');
      heart.className = 'cursor-heart';
      const size = 10 + Math.random() * 8;
      heart.style.width = size + 'px';
      heart.style.height = (size * 0.9) + 'px';
      heart.style.left = (e.clientX - size / 2) + 'px';
      heart.style.top = (e.clientY - size / 2) + 'px';
      heart.style.setProperty('--cx', (Math.random() * 26 - 13) + 'px');
      heart.innerHTML = `<svg viewBox="0 0 32 29"><path d="M23.6 0c-3 0-5.7 1.7-7.6 4.4C14.1 1.7 11.4 0 8.4 0 3.8 0 0 3.9 0 8.8c0 8.4 8.6 13 15.4 19.6.3.3.9.3 1.2 0C23.4 21.8 32 17.2 32 8.8 32 3.9 28.2 0 23.6 0z"/></svg>`;
      
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 1200);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 4. Scroll Reveal trigger inside stages
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in');
      });
    }, { threshold: 0.1 });

    revealEls.forEach(el => io.observe(el));
    return () => revealEls.forEach(el => io.unobserve(el));
  }, [stage]);

  // 5. Timeline Line & Item Reveal
  useEffect(() => {
    if (stage !== 'timeline') return;
    const timelineLine = document.getElementById('timelineLine');
    const timelineSection = document.querySelector('.timeline');
    
    const ioLine = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && timelineLine) timelineLine.classList.add('in');
      });
    }, { threshold: 0.1 });

    if (timelineSection) ioLine.observe(timelineSection);

    const items = document.querySelectorAll('.t-item');
    const ioItem = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in');
      });
    }, { threshold: 0.2 });

    items.forEach(item => ioItem.observe(item));

    return () => {
      if (timelineSection) ioLine.unobserve(timelineSection);
      items.forEach(item => ioItem.unobserve(item));
    };
  }, [stage]);

  // 6. Reasons 3D Hover-Tilt Effect
  useEffect(() => {
    if (stage !== 'confession') return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const cards = document.querySelectorAll('.flip-card');
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
      card.style.transform = '';
    };

    cards.forEach(card => {
      const moveListener = (e) => handleMove(e, card);
      const leaveListener = () => handleLeave(card);
      card.addEventListener('mousemove', moveListener);
      card.addEventListener('mouseleave', leaveListener);

      card._moveListener = moveListener;
      card._leaveListener = leaveListener;
    });

    return () => {
      cards.forEach(card => {
        if (card._moveListener) card.removeEventListener('mousemove', card._moveListener);
        if (card._leaveListener) card.removeEventListener('mouseleave', card._leaveListener);
      });
    };
  }, [stage, flippedCards]);

  // ---------- ENVELOPE MULTI-PHASE TRANSITION ----------
  const handleOpenEnvelope = () => {
    if (envOpenClass !== '') return;

    // Step 1: Flap Opens
    setEnvOpenClass('open-step1');

    // Step 2: Letter slides out of pocket
    setTimeout(() => {
      setEnvOpenClass('open-step1 open-step2');
    }, 900);

    // Step 3: Letter scales/flies toward full screen
    setTimeout(() => {
      setEnvOpenClass('open-step1 open-step2 open-step3');
    }, 2000);

    // Step 4: Transition completely into Stage 1
    setTimeout(() => {
      setStage('quiz1');
    }, 2900);
  };

  // ---------- QUIZ 1 EVENT HANDLERS ----------
  const handleQuiz1Selection = (index) => {
    if (quiz1Status === 'correct') return;
    setSelectedQuiz1Opt(index);

    if (index === quiz1Data.correctIndex) {
      setQuiz1Status('correct');
      confetti({
        particleCount: 45,
        spread: 50,
        origin: { y: 0.8 }
      });
    } else {
      setQuiz1Status('incorrect');
      setShakeQuiz1Card(true);
      setTimeout(() => {
        setShakeQuiz1Card(false);
        setSelectedQuiz1Opt(null);
        setQuiz1Status('idle');
      }, 500);
    }
  };

  // ---------- TIMELINE CHECKLIST HANDLERS ----------
  const toggleMilestoneRead = (idx) => {
    setReadMilestones(prev => ({
      ...prev,
      [idx]: true
    }));
  };

  const allMilestonesRead = Object.values(readMilestones).every(status => status === true);

  // ---------- QUIZ 2 EVENT HANDLERS ----------
  const handleQuiz2Selection = (index) => {
    if (quiz2Status === 'correct') return;
    setSelectedQuiz2Opt(index);

    if (index === quiz2Data.correctIndex) {
      setQuiz2Status('correct');
      confetti({
        particleCount: 45,
        spread: 50,
        origin: { y: 0.8 }
      });
    } else {
      setQuiz2Status('incorrect');
      setShakeQuiz2Card(true);
      setTimeout(() => {
        setShakeQuiz2Card(false);
        setSelectedQuiz2Opt(null);
        setQuiz2Status('idle');
      }, 500);
    }
  };

  // ---------- TIC-TAC-TOE GAME LOGIC ----------
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
    if (tempBoard.every(cell => cell !== null)) return 'Draw';
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

  // AI Opponent Strategy
  useEffect(() => {
    if (isPlayerTurn || gameWinner || stage !== 'tictactoe') return;

    const aiTimer = setTimeout(() => {
      const emptyCells = board.map((cell, idx) => cell === null ? idx : null).filter(val => val !== null);
      if (emptyCells.length === 0) return;

      let aiMove = null;

      // Try to win in next move
      for (let cell of emptyCells) {
        const boardCopy = [...board];
        boardCopy[cell] = aiSymbol;
        if (checkWinner(boardCopy) === aiSymbol) {
          aiMove = cell;
          break;
        }
      }

      // Block player from winning
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

      // Choose random
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
  }, [isPlayerTurn, board, gameWinner, stage]);

  const handleGameOver = (winner) => {
    setGameWinner(winner);
    if (winner === playerSymbol) {
      setGameStatus("You win! ❤️ You've unlocked the next puzzle.");
      confetti({
        particleCount: 50,
        spread: 60,
        colors: ['#E68FA3', '#ECC695']
      });
    } else if (winner === aiSymbol) {
      setGameStatus("Looks like I won this round! Let's try again.");
    } else {
      setGameStatus("It's a draw! Let's play one more time.");
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setGameWinner(null);
    setIsPlayerTurn(true);
    setGameStatus("Your turn! Place your heart.");
  };

  // ---------- MEMORY MATCH GAME LOGIC ----------
  const symbols = ['❤️', '🌸', '🎁', '✈️', '🍿', '🧸', '🍕', '☕'];

  const initMemoryGame = () => {
    // Duplicate symbols to create 8 matching pairs
    const doubleSymbols = [...symbols, ...symbols];
    
    // Shuffle symbols
    const shuffled = doubleSymbols
      .map((sym, idx) => ({ id: idx, symbol: sym, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5);

    setMemoryCards(shuffled);
    setSelectedMemoryIndices([]);
    setMatchedPairsCount(0);
  };

  // Initialize Memory game when entering state
  useEffect(() => {
    if (stage === 'memory') {
      initMemoryGame();
    }
  }, [stage]);

  const handleMemoryCardClick = (idx) => {
    if (
      memoryCards[idx].isFlipped || 
      memoryCards[idx].isMatched || 
      selectedMemoryIndices.length >= 2
    ) return;

    // Flip current card
    const updatedCards = [...memoryCards];
    updatedCards[idx].isFlipped = true;
    setMemoryCards(updatedCards);

    const newSelections = [...selectedMemoryIndices, idx];
    setSelectedMemoryIndices(newSelections);

    if (newSelections.length === 2) {
      const [firstIdx, secondIdx] = newSelections;
      if (memoryCards[firstIdx].symbol === memoryCards[secondIdx].symbol) {
        // MATCH FOUND
        setTimeout(() => {
          const matchedCards = [...memoryCards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setMemoryCards(matchedCards);
          setSelectedMemoryIndices([]);
          setMatchedPairsCount(prev => {
            const nextCount = prev + 1;
            if (nextCount === symbols.length) {
              // ALL MATCHED
              confetti({
                particleCount: 65,
                spread: 70,
                colors: ['#E68FA3', '#ECC695']
              });
            }
            return nextCount;
          });
        }, 400);
      } else {
        // MISMATCH
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

  // ---------- FINAL CONFETTI ----------
  const handleConfetti = () => {
    confetti({
      particleCount: 95,
      spread: 80,
      startVelocity: 34,
      origin: { y: 0.65 },
      colors: ['#E68FA3', '#ECC695', '#7A0923']
    });
    setSigText('I mean it.');
  };

  // Timeline chapters
  const timelineData = [
    { title: "The day we met", date: "[Month, Year]", body: "[Placeholder — describe how you first crossed paths. Where were you, what did she say, what did you notice first?]" },
    { title: "Our first date", date: "[Month, Year]", body: "[Placeholder — where you went, the thing that made you both laugh, the moment you knew you wanted a second one.]" },
    { title: "The trip that changed things", date: "[Month, Year]", body: "[Placeholder — a trip, a late night, a hard time you got through together. Whatever made it feel real.]" },
    { title: "Still here, still us", date: "Today", body: "[Placeholder — a line about where you are now, and why you're still choosing each other.]" }
  ];

  // Reasons list data
  const reasons = [
    "The way you laugh at your own jokes before you even finish them.",
    "How you narrate what your pet is thinking, in full voice.",
    "You remember the small stuff — the order I forgot I mentioned once.",
    "The way you fall asleep mid-sentence and deny it every time.",
    "How you make even the worst days feel manageable.",
    "You're the only person whose opinion on this actually matters to me.",
    "The playlist you made me that one time, still on repeat.",
    "Just... you. All of it. Even the mornings."
  ];

  // Polaroid moments
  const polaroids = [
    { cap: "that one weekend", rot: -2 },
    { cap: "the road trip", rot: 3 },
    { cap: "your birthday", rot: -4 },
    { cap: "just because", rot: 1 },
    { cap: "the rainy day", rot: -3 },
    { cap: "the good year", rot: 4 }
  ];

  const totalTimelineRead = Object.values(readMilestones).filter(Boolean).length;

  return (
    <>
      {/* 1. Fireflies Canvas Background */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }} />

      {/* 2. Veil Preloader */}
      <div className={`veil ${veilHidden ? 'hide' : ''}`} id="veil">
        <span className="veil-text">for you...</span>
      </div>

      {/* STAGE CONTAINER SHELL */}
      <div className="stage-container">
        
        {/* STAGE 0: ENVELOPE */}
        {stage === 'envelope' && (
          <div className="stage-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="envelope-wrap">
              <div className={`envelope-scene ${envOpenClass}`} id="envScene">
                <div className="env-shadow"></div>
                <button className="envelope" onClick={handleOpenEnvelope} id="envBtn" aria-label="Open the letter">
                  <div className="env-body">
                    <div className="paper-vintage-bg"></div>
                  </div>
                  <div className="env-letter paper-vintage">
                    <div className="paper-vintage-bg"></div>
                    <p>...I've been meaning to tell you something...</p>
                  </div>
                  <div className="env-flap"></div>
                  <div className="env-seal">
                    <svg viewBox="0 0 32 29">
                      <path d="M23.6 0c-3 0-5.7 1.7-7.6 4.4C14.1 1.7 11.4 0 8.4 0 3.8 0 0 3.9 0 8.8c0 8.4 8.6 13 15.4 19.6.3.3.9.3 1.2 0C23.4 21.8 32 17.2 32 8.8 32 3.9 28.2 0 23.6 0z"/>
                    </svg>
                  </div>
                  <div className="env-label">For [Her Name]</div>
                </button>
              </div>
              <span className={`tap-prompt ${envOpenClass !== '' ? 'gone' : ''}`} id="tapPrompt">tap to open</span>
            </div>
          </div>
        )}

        {/* STAGE 1: TRIVIA QUIZ 1 */}
        {stage === 'quiz1' && (
          <div className={`stage-panel ${shakeQuiz1Card ? 'shake' : ''}`}>
            <div className="quiz-card paper-vintage">
              <div className="paper-vintage-bg"></div>
              <span className="eyebrow" style={{ color: '#7A0923' }}>chapter one</span>
              <h3>First Milestone</h3>
              <p className="question">{quiz1Data.question}</p>

              <div className="quiz-options">
                {quiz1Data.options.map((option, idx) => {
                  let optClass = '';
                  if (selectedQuiz1Opt === idx) {
                    optClass = quiz1Status === 'correct' ? 'correct' : 'incorrect';
                  }
                  return (
                    <button 
                      key={idx}
                      className={`quiz-option ${optClass}`}
                      disabled={quiz1Status === 'correct'}
                      onClick={() => handleQuiz1Selection(idx)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {quiz1Status === 'correct' && (
                <div style={{ marginTop: '2.5rem', animation: 'pageFlipIn 0.5s ease forwards' }}>
                  <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', marginBottom: '1.5rem', color: '#1b5e20' }}>
                    Correct! You remember. Now, let's explore our story...
                  </p>
                  <button className="vintage-btn" onClick={() => setStage('timeline')}>
                    Open Story
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STAGE 2: TIMELINE */}
        {stage === 'timeline' && (
          <div className="stage-panel">
            {/* Greeting */}
            <section style={{ marginBottom: '3rem' }}>
              <div className="section-inner">
                <div className="letter-card paper-vintage">
                  <div className="paper-vintage-bg"></div>
                  <p>I've been trying to find the right way to tell you this, so I built you something instead.</p>
                  <p>This isn't a card you'll lose in a drawer, or a text that gets buried under everything else. It's just... us, written down. The parts I don't say enough out loud.</p>
                  <p>So take your time. Read through each milestone carefully.</p>
                  <div className="signoff">— [Your Name]</div>
                </div>
              </div>
            </section>

            {/* Timeline */}
            <section>
              <div className="section-inner">
                <span className="eyebrow">chapter two</span>
                <div className="heart-divider">
                  <svg viewBox="0 0 32 29"><path d="M23.6 0c-3 0-5.7 1.7-7.6 4.4C14.1 1.7 11.4 0 8.4 0 3.8 0 0 3.9 0 8.8c0 8.4 8.6 13 15.4 19.6.3.3.9.3 1.2 0C23.4 21.8 32 17.2 32 8.8 32 3.9 28.2 0 23.6 0z"/></svg>
                </div>
                <h2 className="section-title">How we found each other</h2>
                <div className="timeline">
                  <div className="timeline-line" id="timelineLine"></div>

                  {timelineData.map((item, idx) => (
                    <div className="t-item" key={idx}>
                      <div className="t-card paper-vintage" onClick={() => toggleMilestoneRead(idx)}>
                        <div className="paper-vintage-bg"></div>
                        <div className="t-dot"></div>
                        <span className="t-date">{item.date}</span>
                        <h3 className="t-title">{item.title}</h3>
                        <p>{item.body}</p>
                        
                        <div className={`read-indicator ${readMilestones[idx] ? 'read' : ''}`}>
                          {readMilestones[idx] ? (
                            <>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              Read
                            </>
                          ) : (
                            'Tap to read'
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                  <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', marginBottom: '1.2rem', opacity: 0.85 }}>
                    {allMilestonesRead 
                      ? "Milestones read! Ready for the next quiz." 
                      : `Read all 4 memories to unlock the next stage. (${totalTimelineRead}/4 read)`
                    }
                  </p>
                  <button className="vintage-btn" disabled={!allMilestonesRead} onClick={() => setStage('quiz2')}>
                    Next Quiz
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* STAGE 3: TRIVIA QUIZ 2 */}
        {stage === 'quiz2' && (
          <div className={`stage-panel ${shakeQuiz2Card ? 'shake' : ''}`}>
            <div className="quiz-card paper-vintage">
              <div className="paper-vintage-bg"></div>
              <span className="eyebrow" style={{ color: '#7A0923' }}>chapter three</span>
              <h3>Secret Quirks</h3>
              <p className="question">{quiz2Data.question}</p>

              <div className="quiz-options">
                {quiz2Data.options.map((option, idx) => {
                  let optClass = '';
                  if (selectedQuiz2Opt === idx) {
                    optClass = quiz2Status === 'correct' ? 'correct' : 'incorrect';
                  }
                  return (
                    <button 
                      key={idx}
                      className={`quiz-option ${optClass}`}
                      disabled={quiz2Status === 'correct'}
                      onClick={() => handleQuiz2Selection(idx)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {quiz2Status === 'correct' && (
                <div style={{ marginTop: '2.5rem', animation: 'pageFlipIn 0.5s ease forwards' }}>
                  <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', marginBottom: '1.5rem', color: '#1b5e20' }}>
                    Absolutely correct! Now let's play a game of hearts.
                  </p>
                  <button className="vintage-btn" onClick={() => setStage('tictactoe')}>
                    Play Tic-Tac-Toe
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STAGE 4: TIC-TAC-TOE */}
        {stage === 'tictactoe' && (
          <div className="stage-panel">
            <div className="game-card paper-vintage">
              <div className="paper-vintage-bg"></div>
              <span className="eyebrow" style={{ color: '#7A0923' }}>chapter four</span>
              <h3>The Game of Hearts</h3>
              <p>Win a round of Tic-Tac-Toe to unlock the memory match grid.</p>

              <div className="game-board">
                {board.map((cell, idx) => (
                  <div 
                    key={idx} 
                    className={`game-cell ${cell ? 'occupied' : ''}`}
                    onClick={() => handleCellClick(idx)}
                  >
                    {cell}
                  </div>
                ))}
              </div>

              <div className="game-status">{gameStatus}</div>

              {gameWinner && gameWinner !== playerSymbol && (
                <button className="vintage-btn" onClick={resetGame} style={{ background: '#ECC695', marginRight: '10px' }}>
                  Try Again
                </button>
              )}

              {gameWinner === playerSymbol && (
                <div style={{ animation: 'pageFlipIn 0.5s ease forwards' }}>
                  <button className="vintage-btn" onClick={() => setStage('memory')}>
                    Open Memory Match
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STAGE 5: MEMORY MATCH */}
        {stage === 'memory' && (
          <div className="stage-panel">
            <div className="game-card paper-vintage" style={{ maxWidth: '500px' }}>
              <div className="paper-vintage-bg"></div>
              <span className="eyebrow" style={{ color: '#7A0923' }}>chapter five</span>
              <h3>Memory Match</h3>
              <p style={{ marginBottom: '1.5rem' }}>Match all 8 pairs of cards to unlock the final confession.</p>

              <div className="memory-grid">
                {memoryCards.map((card, idx) => {
                  const isFlipped = card.isFlipped || card.isMatched;
                  return (
                    <div 
                      key={card.id} 
                      className={`memory-card ${isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
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
                {matchedPairsCount === symbols.length 
                  ? "Pairs matched! The final door is open." 
                  : `Pairs matched: ${matchedPairsCount} / ${symbols.length}`
                }
              </div>

              {matchedPairsCount === symbols.length && (
                <div style={{ animation: 'pageFlipIn 0.5s ease forwards' }}>
                  <button className="vintage-btn" onClick={() => setStage('confession')}>
                    Read Confession
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STAGE 6: CONFESSION */}
        {stage === 'confession' && (
          <div className="stage-panel">
            {/* Reasons Grid */}
            <section style={{ marginBottom: '4rem' }}>
              <div className="section-inner">
                <span className="eyebrow">chapter six</span>
                <div className="heart-divider">
                  <svg viewBox="0 0 32 29"><path d="M23.6 0c-3 0-5.7 1.7-7.6 4.4C14.1 1.7 11.4 0 8.4 0 3.8 0 0 3.9 0 8.8c0 8.4 8.6 13 15.4 19.6.3.3.9.3 1.2 0C23.4 21.8 32 17.2 32 8.8 32 3.9 28.2 0 23.6 0z"/></svg>
                </div>
                <h2 className="section-title">Reasons, in no particular order</h2>
                <div className="reasons-grid" id="reasonsGrid">
                  {reasons.map((r, i) => (
                    <div 
                      key={i} 
                      className="flip-card reveal"
                    >
                      <div className="flip-inner">
                        <div className="flip-face flip-front">
                          <span className="num">{(i + 1).toString().padStart(2, '0')}</span>
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
            <section style={{ marginBottom: '4rem' }}>
              <div className="section-inner" style={{ maxWidth: '1000px' }}>
                <span className="eyebrow">chapter seven</span>
                <div className="heart-divider">
                  <svg viewBox="0 0 32 29"><path d="M23.6 0c-3 0-5.7 1.7-7.6 4.4C14.1 1.7 11.4 0 8.4 0 3.8 0 0 3.9 0 8.8c0 8.4 8.6 13 15.4 19.6.3.3.9.3 1.2 0C23.4 21.8 32 17.2 32 8.8 32 3.9 28.2 0 23.6 0z"/></svg>
                </div>
                <h2 className="section-title">Some of my favorite moments</h2>
                <div className="gallery">
                  {polaroids.map((p, i) => (
                    <div 
                      key={i} 
                      className="polaroid paper-vintage reveal" 
                      style={{ transform: `rotate(${p.rot}deg)` }}
                    >
                      <div className="paper-vintage-bg"></div>
                      <div className="polaroid-img">[ your photo here ]</div>
                      <div className="polaroid-cap">{p.cap}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Final Letter */}
            <div className="closing-card paper-vintage">
              <div className="paper-vintage-bg"></div>
              <h2>So here's the truth: every version of my future has you in it.</h2>
              <div className="sig">— always, [Your Name]</div>
              <button className="one-more" onClick={handleConfetti} id="oneMoreBtn">{sigText}</button>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer>made with more care than code, for [Her Name] · [Year]</footer>
    </>
  );
}
