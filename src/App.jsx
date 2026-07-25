import { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';

// Helper to Base64 encode / decode configuration JSON
const encodeConfig = (config) => {
  try {
    const str = JSON.stringify(config);
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    console.error(e);
    return '';
  }
};

const decodeConfig = (base64Str) => {
  try {
    const decoded = decodeURIComponent(escape(atob(base64Str)));
    return JSON.parse(decoded);
  } catch (e) {
    console.error(e);
    return null;
  }
};

const DEFAULT_FLOW = [
  { 
    id: 'envelope', 
    type: 'envelope', 
    label: 'For Her Name', 
    letter: "...I've been meaning to tell you something..." 
  },
  { 
    id: 'quiz1', 
    type: 'quiz', 
    eyebrow: 'chapter one', 
    title: 'First Milestone', 
    question: "Where did we first cross paths?", 
    options: [
      "The cozy local coffee shop",
      "Under the roof of the library study room",
      "Waiting at that rainy bus stop",
      "A mutual friend's birthday gathering"
    ], 
    correctIndex: 2, 
    successText: "Correct! You remember. Now, let's explore our story..." 
  },
  { 
    id: 'timeline', 
    type: 'timeline', 
    eyebrow: 'chapter two', 
    title: 'How we found each other', 
    intro: "I've been trying to find the right way to tell you this, so I built you something instead.\n\nThis isn't a card you'll lose in a drawer, or a text that gets buried under everything else. It's just... us, written down.\n\nSo take your time. Read through each milestone carefully.", 
    signoff: "— Your Name", 
    milestones: [
      { title: "The day we met", date: "[Month, Year]", body: "[Describe how you first crossed paths. Where were you, what did she say, what did you notice first?]" },
      { title: "Our first date", date: "[Month, Year]", body: "[Where you went, the thing that made you both laugh, the moment you knew you wanted a second one.]" },
      { title: "The trip that changed things", date: "[Month, Year]", body: "[A trip, a late night, a hard time you got through together. Whatever made it feel real.]" },
      { title: "Still here, still us", date: "Today", body: "[A line about where you are now, and why you're still choosing each other.]" }
    ] 
  },
  { 
    id: 'quiz2', 
    type: 'quiz', 
    eyebrow: 'chapter three', 
    title: 'Secret Quirks', 
    question: "What is my absolute favorite way to spend a lazy Sunday with you?", 
    options: [
      "Going on an intensive hiking trail",
      "Sleeping in late and ordering takeout pancakes",
      "Spending the whole day doing household chores",
      "Running bulk errands at the supermarket"
    ], 
    correctIndex: 1, 
    successText: "Absolutely correct! Now let's play a game of hearts." 
  },
  { 
    id: 'tictactoe', 
    type: 'tictactoe', 
    eyebrow: 'chapter four', 
    title: 'The Game of Hearts', 
    instruction: 'Win a round of Tic-Tac-Toe to unlock the next stage.' 
  },
  {
    id: 'cupidcatch',
    type: 'cupidcatch',
    eyebrow: 'chapter five',
    title: "Cupid's Catch",
    instruction: "Catch 10 falling hearts or gifts using the basket to unlock the next stage!",
    targetScore: 10
  },
  {
    id: 'connectlove',
    type: 'connectlove',
    eyebrow: 'chapter six',
    title: 'Connect the Love',
    instruction: 'Link the matching pairs together to unlock the next stage.'
  },
  {
    id: 'wordscramble',
    type: 'wordscramble',
    eyebrow: 'chapter seven',
    title: 'Romantic Word Scramble',
    instruction: 'Unscramble the letters to reveal the secret word.',
    targetWord: 'FOREVER'
  },
  {
    id: 'loverhythm',
    type: 'loverhythm',
    eyebrow: 'chapter eight',
    title: 'Love Rhythm',
    instruction: 'Tap the heart when the expanding ring perfectly aligns with it 5 times!',
    targetHits: 5
  },
  {
    id: 'polaroidpuzzle',
    type: 'polaroidpuzzle',
    eyebrow: 'chapter nine',
    title: 'Polaroid Jigsaw',
    instruction: 'Slide the tiles to complete the image.',
    imageUrl: ''
  },
  { 
    id: 'memory', 
    type: 'memory', 
    eyebrow: 'chapter ten', 
    title: 'Memory Match', 
    instruction: 'Match all pairs of cards to unlock the next stage.', 
    symbols: ['❤️', '🌸', '🎁', '✈️', '🍿', '🧸', '🍕', '☕'] 
  },
  { 
    id: 'confession', 
    type: 'confession', 
    eyebrow: 'chapter eleven', 
    title: 'Reasons, in no particular order', 
    reasons: [
      "The way you laugh at your own jokes before you even finish them.",
      "How you narrate what your pet is thinking, in full voice.",
      "You remember the small stuff — the order I forgot I mentioned once.",
      "The way you fall asleep mid-sentence and deny it every time.",
      "How you make even the worst days feel manageable.",
      "You're the only person whose opinion on this actually matters to me.",
      "The playlist you made me that one time, still on repeat.",
      "Just... you. All of it. Even the mornings."
    ], 
    polaroids: [
      { url: '', cap: "that one weekend", rot: -2 },
      { url: '', cap: "the road trip", rot: 3 },
      { url: '', cap: "your birthday", rot: -4 },
      { url: '', cap: "just because", rot: 1 },
      { url: '', cap: "the rainy day", rot: -3 },
      { url: '', cap: "the good year", rot: 4 }
    ], 
    closingLetter: "So here's the truth: every version of my future has you in it.", 
    closingSig: "— always, Your Name", 
    recipientName: "Her Name", 
    footerYear: "2026" 
  }
];

function CupidCatchGame({ step, onComplete }) {
  const target = step.targetScore || 10;
  const [score, setScore] = useState(0);
  const [basketX, setBasketX] = useState(50); // percentage 0-100
  const [items, setItems] = useState([]);
  const containerRef = useRef(null);

  // Handle touch / mouse movement inside container to move basket
  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(0, Math.min(100, x)));
  };

  const onMouseMove = (e) => handleMove(e.clientX);
  const onTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    if (score >= target) {
      confetti({ particleCount: 50, spread: 60, colors: ['#E68FA3', '#ECC695'] });
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      // Spawn a new item
      const symbols = ['❤️', '🎁', '💖', '🍭', '🧸', '🌸'];
      const sym = symbols[Math.floor(Math.random() * symbols.length)];
      setItems(prev => [
        ...prev,
        {
          id: Math.random(),
          x: Math.random() * 90 + 5, // 5% to 95%
          y: 0,
          speed: Math.random() * 2 + 3,
          symbol: sym
        }
      ]);
    }, 900);

    return () => clearInterval(interval);
  }, [score, target]);

  useEffect(() => {
    if (score >= target) return;

    let animId;
    const updatePhysics = () => {
      setItems(prev => {
        const next = [];
        for (let item of prev) {
          const nextY = item.y + item.speed;
          // Check collision with basket when y reaches around 80-90%
          if (nextY >= 82 && nextY <= 90) {
            const distance = Math.abs(item.x - basketX);
            if (distance < 12) { // Caught!
              setScore(s => s + 1);
              continue; // remove item
            }
          }
          if (nextY < 100) {
            next.push({ ...item, y: nextY });
          }
        }
        return next;
      });
      animId = requestAnimationFrame(updatePhysics);
    };
    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [basketX, score, target]);

  return (
    <div className="game-card paper-vintage" style={{ maxWidth: '480px' }}>
      <div className="paper-vintage-bg"></div>
      {step.eyebrow && <span className="eyebrow" style={{ color: '#7A0923' }}>{step.eyebrow}</span>}
      <h3>{step.title}</h3>
      <p style={{ marginBottom: '1rem' }}>{step.instruction}</p>

      <div 
        ref={containerRef}
        className="cupid-catch-container"
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
        style={{
          position: 'relative',
          height: '260px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(139, 90, 43, 0.15)',
          borderRadius: '8px',
          overflow: 'hidden',
          cursor: 'none',
          userSelect: 'none',
          touchAction: 'none',
          marginTop: '1.5rem'
        }}
      >
        {/* Falling items */}
        {items.map(item => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: `${item.x}%`,
              top: `${item.y}%`,
              fontSize: '1.5rem',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              transition: 'top 0.05s linear'
            }}
          >
            {item.symbol}
          </div>
        ))}

        {/* Basket */}
        <div
          style={{
            position: 'absolute',
            left: `${basketX}%`,
            bottom: '8px',
            transform: 'translateX(-50%)',
            fontSize: '2.5rem',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          🧺
        </div>
      </div>

      <div className="game-status" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--ink)' }}>
        Score: {score} / {target}
      </div>
    </div>
  );
}

function ConnectLoveGame({ step, onComplete }) {
  const initialPairs = [
    { id: 1, left: '🔑', right: '🔒', matchId: 1 },
    { id: 2, left: '✉️', right: '📬', matchId: 2 },
    { id: 3, left: '☕', right: '🍩', matchId: 3 },
    { id: 4, left: '🧸', right: '🎀', matchId: 4 }
  ];

  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [connections, setConnections] = useState([]); // Array of { leftId, rightId }
  const [shakeId, setShakeId] = useState(null);

  useEffect(() => {
    // Shuffle the items for matching
    const shuffledLeft = [...initialPairs].sort(() => Math.random() - 0.5);
    const shuffledRight = [...initialPairs].sort(() => Math.random() - 0.5);
    setLeftItems(shuffledLeft);
    setRightItems(shuffledRight);
  }, []);

  const handleLeftClick = (item) => {
    // If already connected, do nothing
    if (connections.some(c => c.leftId === item.id)) return;
    setSelectedLeft(item);
  };

  const handleRightClick = (item) => {
    if (!selectedLeft) return;
    // If already connected, do nothing
    if (connections.some(c => c.rightId === item.id)) return;

    if (selectedLeft.matchId === item.matchId) {
      const newConnections = [...connections, { leftId: selectedLeft.id, rightId: item.id }];
      setConnections(newConnections);
      setSelectedLeft(null);

      // Check if all connected
      if (newConnections.length === initialPairs.length) {
        setTimeout(() => {
          confetti({ particleCount: 50, spread: 60, colors: ['#E68FA3', '#ECC695'] });
          onComplete();
        }, 500);
      }
    } else {
      // Shaking feedback
      setShakeId(item.id);
      setTimeout(() => setShakeId(null), 500);
      setSelectedLeft(null);
    }
  };

  return (
    <div className="game-card paper-vintage" style={{ maxWidth: '480px' }}>
      <div className="paper-vintage-bg"></div>
      {step.eyebrow && <span className="eyebrow" style={{ color: '#7A0923' }}>{step.eyebrow}</span>}
      <h3>{step.title}</h3>
      <p>{step.instruction}</p>

      <div className="connect-love-container" style={{ display: 'flex', justifyContent: 'space-between', margin: '2rem 0', gap: '2rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          {leftItems.map(item => {
            const isSelected = selectedLeft?.id === item.id;
            const isConnected = connections.some(c => c.leftId === item.id);
            return (
              <button
                key={`left-${item.id}`}
                onClick={() => handleLeftClick(item)}
                className={`connect-btn ${isSelected ? 'selected' : ''} ${isConnected ? 'connected' : ''}`}
                style={{
                  padding: '1rem',
                  fontSize: '1.5rem',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid var(--rose-pink)' : '1px solid rgba(139, 90, 43, 0.2)',
                  background: isConnected ? 'rgba(230,143,163,0.15)' : isSelected ? 'rgba(230,143,163,0.1)' : 'rgba(255,255,255,0.4)',
                  cursor: isConnected ? 'default' : 'pointer',
                  opacity: isConnected ? 0.6 : 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '60px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.left}
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          {rightItems.map(item => {
            const isConnected = connections.some(c => c.rightId === item.id);
            const isShaking = shakeId === item.id;
            return (
              <button
                key={`right-${item.id}`}
                onClick={() => handleRightClick(item)}
                className={`connect-btn ${isShaking ? 'shake' : ''} ${isConnected ? 'connected' : ''}`}
                style={{
                  padding: '1rem',
                  fontSize: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 90, 43, 0.2)',
                  background: isConnected ? 'rgba(230,143,163,0.15)' : 'rgba(255,255,255,0.4)',
                  cursor: isConnected || !selectedLeft ? 'default' : 'pointer',
                  opacity: isConnected ? 0.6 : 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '60px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.right}
              </button>
            );
          })}
        </div>
      </div>

      <div className="game-status">
        {connections.length === initialPairs.length
          ? "All connected! ❤️"
          : selectedLeft 
            ? "Now select the matching item on the right!" 
            : "Select an item on the left to start."}
      </div>
    </div>
  );
}

function WordScrambleGame({ step, onComplete }) {
  const originalWord = (step.targetWord || 'FOREVER').toUpperCase();
  const [scrambled, setScrambled] = useState([]);
  const [guess, setGuess] = useState([]);

  useEffect(() => {
    // Generate scrambled letters with index to ensure uniqueness
    const letterObjs = originalWord.split('').map((char, index) => ({ id: index, char }));
    // Scramble until it is different from the original word
    let shuffled = [...letterObjs];
    do {
      shuffled.sort(() => Math.random() - 0.5);
    } while (shuffled.map(l => l.char).join('') === originalWord && originalWord.length > 1);

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
      const currentWord = guess.map(l => l.char).join('');
      if (currentWord === originalWord) {
        setTimeout(() => {
          confetti({ particleCount: 50, spread: 60, colors: ['#E68FA3', '#ECC695'] });
          onComplete();
        }, 400);
      }
    }
  }, [guess, originalWord]);

  return (
    <div className="game-card paper-vintage" style={{ maxWidth: '480px' }}>
      <div className="paper-vintage-bg"></div>
      {step.eyebrow && <span className="eyebrow" style={{ color: '#7A0923' }}>{step.eyebrow}</span>}
      <h3>{step.title}</h3>
      <p>{step.instruction}</p>

      {/* Target Word Slots */}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', margin: '2rem 0', minHeight: '50px' }}>
        {Array.from({ length: originalWord.length }).map((_, idx) => {
          const letter = guess[idx];
          return (
            <div
              key={idx}
              onClick={() => letter && handleGuessClick(letter)}
              style={{
                width: '45px',
                height: '45px',
                borderBottom: '2px solid var(--ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                cursor: letter ? 'pointer' : 'default',
                fontFamily: 'var(--sans)',
                background: letter ? 'rgba(230,143,163,0.1)' : 'transparent',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              {letter?.char || ''}
            </div>
          );
        })}
      </div>

      {/* Scrambled Letters Pool */}
      <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {scrambled.map(letter => (
          <button
            key={letter.id}
            onClick={() => handleScrambledClick(letter)}
            className="vintage-btn"
            style={{
              padding: '0.6rem 1rem',
              minWidth: '40px',
              fontSize: '1.2rem',
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              borderRadius: '8px',
              background: 'var(--champagne)'
            }}
          >
            {letter.char}
          </button>
        ))}
      </div>

      <div className="game-status">
        {guess.length === originalWord.length && guess.map(l => l.char).join('') !== originalWord
          ? "Not quite! Click letters to send them back."
          : "Tap letters to arrange them."}
      </div>
    </div>
  );
}

function LoveRhythmGame({ step, onComplete }) {
  const target = step.targetHits || 5;
  const [hits, setHits] = useState(0);
  const [feedback, setFeedback] = useState('Get Ready...');
  const [feedbackClass, setFeedbackClass] = useState('');
  const [ringScale, setRingScale] = useState(2.0);
  const ringScaleRef = useRef(2.0);

  useEffect(() => {
    if (hits >= target) {
      confetti({ particleCount: 50, spread: 60, colors: ['#E68FA3', '#ECC695'] });
      onComplete();
      return;
    }

    let lastTime = Date.now();
    let animId;

    const gameLoop = () => {
      const now = Date.now();
      const elapsed = now - lastTime;
      lastTime = now;

      // Decrement scale
      let nextScale = ringScaleRef.current - elapsed * 0.0008; // speed of ring shrinking
      if (nextScale <= 0.8) {
        nextScale = 2.2; // reset
        setFeedback('Miss! 💔');
        setFeedbackClass('miss');
      }
      ringScaleRef.current = nextScale;
      setRingScale(nextScale);

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [hits, target]);

  const handleTap = () => {
    if (hits >= target) return;

    const currentScale = ringScaleRef.current;
    // Perfect range is around 1.0 (exact match with the central heart circle which is ~1.0 scale)
    const diff = Math.abs(currentScale - 1.0);

    if (diff < 0.12) {
      setHits(h => h + 1);
      setFeedback('PERFECT! ❤️');
      setFeedbackClass('perfect');
      ringScaleRef.current = 2.2; // reset ring
    } else if (diff < 0.28) {
      setHits(h => h + 1);
      setFeedback('GREAT! ✨');
      setFeedbackClass('great');
      ringScaleRef.current = 2.2; // reset ring
    } else {
      setFeedback('Too Early/Late! 💔');
      setFeedbackClass('miss');
    }
  };

  return (
    <div className="game-card paper-vintage" style={{ maxWidth: '480px' }}>
      <div className="paper-vintage-bg"></div>
      {step.eyebrow && <span className="eyebrow" style={{ color: '#7A0923' }}>{step.eyebrow}</span>}
      <h3>{step.title}</h3>
      <p>{step.instruction}</p>

      {/* Rhythm Tap Visual Area */}
      <div
        onClick={handleTap}
        style={{
          position: 'relative',
          height: '220px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(139, 90, 43, 0.12)',
          borderRadius: '12px',
          margin: '2rem 0',
          cursor: 'pointer',
          userSelect: 'none',
          touchAction: 'manipulation'
        }}
      >
        {/* Pulsing ring */}
        <div
          style={{
            position: 'absolute',
            width: '80px',
            height: '80px',
            border: '2.5px solid var(--rose-pink)',
            borderRadius: '50%',
            transform: `scale(${ringScale})`,
            pointerEvents: 'none',
            opacity: Math.max(0, 1 - (ringScale - 1) / 1.2),
            boxShadow: '0 0 10px var(--rose-pink)'
          }}
        />

        {/* Target Ring */}
        <div
          style={{
            position: 'absolute',
            width: '80px',
            height: '80px',
            border: '2px dashed var(--ink)',
            borderRadius: '50%',
            pointerEvents: 'none',
            opacity: 0.4
          }}
        />

        {/* Central Heart Button/Indicator */}
        <div
          style={{
            position: 'absolute',
            fontSize: '3rem',
            pointerEvents: 'none',
            animation: 'heartbeat 1.5s infinite'
          }}
        >
          ❤️
        </div>

        {/* Tap overlay instructions */}
        <div style={{ position: 'absolute', bottom: '10px', fontSize: '0.75rem', opacity: 0.5 }}>
          TAP ANYWHERE TO MATCH
        </div>
      </div>

      <div className={`game-status ${feedbackClass}`} style={{ fontSize: '1.2rem', fontWeight: 'bold', minHeight: '30px' }}>
        {feedback}
      </div>

      <div className="game-status" style={{ marginTop: '0.5rem' }}>
        Progress: {hits} / {target} Hits
      </div>
    </div>
  );
}

function PolaroidPuzzleGame({ step, onComplete }) {
  const [board, setBoard] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const [isSolved, setIsSolved] = useState(false);

  // Checks if a tile can move to the empty spot (value 8)
  const getAdjacentMoves = (index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const moves = [];
    if (row > 0) moves.push(index - 3); // Up
    if (row < 2) moves.push(index + 3); // Down
    if (col > 0) moves.push(index - 1); // Left
    if (col < 2) moves.push(index + 1); // Right
    return moves;
  };

  const shufflePuzzle = () => {
    let currentBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    let emptyIndex = 8;

    // Perform 40 random valid swaps to ensure solvability
    for (let i = 0; i < 40; i++) {
      const validMoves = getAdjacentMoves(emptyIndex);
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      // Swap
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

      // Check if solved
      const solved = newBoard.every((val, idx) => val === idx);
      if (solved) {
        setIsSolved(true);
        setTimeout(() => {
          confetti({ particleCount: 50, spread: 60, colors: ['#E68FA3', '#ECC695'] });
          onComplete();
        }, 500);
      }
    }
  };

  const imageUrl = step.imageUrl || '';

  return (
    <div className="game-card paper-vintage" style={{ maxWidth: '440px' }}>
      <div className="paper-vintage-bg"></div>
      {step.eyebrow && <span className="eyebrow" style={{ color: '#7A0923' }}>{step.eyebrow}</span>}
      <h3>{step.title}</h3>
      <p>{step.instruction}</p>

      {/* Grid container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '4px',
          width: '300px',
          height: '300px',
          margin: '2rem auto',
          background: 'rgba(139, 90, 43, 0.1)',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid rgba(139, 90, 43, 0.2)'
        }}
      >
        {board.map((tileValue, index) => {
          const isEmpty = tileValue === 8;
          const targetRow = Math.floor(tileValue / 3);
          const targetCol = tileValue % 3;

          // CSS properties for background position slicing
          const bgX = (targetCol * 50) + '%';
          const bgY = (targetRow * 50) + '%';

          return (
            <div
              key={index}
              onClick={() => handleTileClick(index)}
              style={{
                borderRadius: '4px',
                cursor: isEmpty || isSolved ? 'default' : 'pointer',
                background: isEmpty 
                  ? 'transparent' 
                  : imageUrl 
                    ? `url(${imageUrl})` 
                    : 'linear-gradient(135deg, var(--rose-pink), var(--champagne))',
                backgroundSize: '300px 300px',
                backgroundPosition: `${bgX} ${bgY}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: imageUrl ? 'transparent' : 'var(--bg-dark-1)',
                boxShadow: isEmpty ? 'none' : 'inset 0 0 10px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.1)',
                transition: 'background 0.2s, transform 0.1s ease',
                position: 'relative',
                aspectRatio: '1 / 1'
              }}
            >
              {/* Default graphic if no image is uploaded: cute heart or numbers */}
              {!isEmpty && !imageUrl && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.4rem' }}>❤️</span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '-4px' }}>{tileValue + 1}</span>
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
        <button className="vintage-btn" onClick={shufflePuzzle} style={{ background: '#ECC695', fontSize: '0.7rem', padding: '0.5rem 1rem' }}>
          Reset Puzzle
        </button>
      )}
    </div>
  );
}

export default function App() {
  const [flowConfig, setFlowConfig] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Envelope opening state classes
  const [envOpenClass, setEnvOpenClass] = useState('');

  // General Quiz States
  const [selectedQuizOpt, setSelectedQuizOpt] = useState(null);
  const [quizStatus, setQuizStatus] = useState('idle'); // 'idle', 'correct', 'incorrect'
  const [shakeQuizCard, setShakeQuizCard] = useState(false);

  // Timeline Milestone progress
  const [readMilestones, setReadMilestones] = useState({});

  // Tic-Tac-Toe States
  const [board, setBoard] = useState(Array(9).fill(null));
  const [playerSymbol] = useState('❤️');
  const [aiSymbol] = useState('⭕');
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameWinner, setGameWinner] = useState(null);
  const [gameStatus, setGameStatus] = useState('Your turn! Place a heart on the grid.');

  // Memory Match States
  const [memoryCards, setMemoryCards] = useState([]);
  const [selectedMemoryIndices, setSelectedMemoryIndices] = useState([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);

  // Confession states
  const [sigText, setSigText] = useState('one more thing');

  const canvasRef = useRef(null);

  // Initialize flowConfig from URL hash, localStorage, or defaults
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cardParam = params.get('card');
    
    if (cardParam) {
      const decoded = decodeConfig(cardParam);
      if (decoded && Array.isArray(decoded)) {
        setFlowConfig(decoded);
        return;
      }
    }

    const saved = localStorage.getItem('custom_flow_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setFlowConfig(parsed);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    setFlowConfig(DEFAULT_FLOW);
  }, []);

  const resetGameStates = () => {
    setSelectedQuizOpt(null);
    setQuizStatus('idle');
    setShakeQuizCard(false);
    setReadMilestones({});
    setBoard(Array(9).fill(null));
    setGameWinner(null);
    setIsPlayerTurn(true);
    setGameStatus('Your turn! Place a heart on the grid.');
    setMemoryCards([]);
    setSelectedMemoryIndices([]);
    setMatchedPairsCount(0);
    setSigText('one more thing');
  };

  const currentStep = flowConfig[currentStepIndex] || {};

  const handleNextStep = () => {
    resetGameStates();
    if (currentStepIndex < flowConfig.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    resetGameStates();
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Helper for safe matchMedia checks
  const getReduceMotion = () => {
    return typeof window !== 'undefined' && window.matchMedia 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
      : false;
  };

  const getFinePointer = () => {
    return typeof window !== 'undefined' && window.matchMedia 
      ? window.matchMedia('(pointer: fine)').matches 
      : true;
  };

  // 1. Interactive Canvas Fireflies Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (getReduceMotion()) return;

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
        ctx.fillStyle = `rgba(236, 198, 149, ${f.opacity * (0.6 + Math.sin(f.angle * 2) * 0.4)})`;
        ctx.shadowBlur = f.size * 2.5;
        ctx.shadowColor = 'rgba(236, 198, 149, 0.7)';
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

  // 2. Cursor Heart Trail
  useEffect(() => {
    if (getReduceMotion() || !getFinePointer()) return;

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

  // 3. Scroll Reveal trigger inside stages
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in');
      });
    }, { threshold: 0.1 });

    revealEls.forEach(el => io.observe(el));
    return () => revealEls.forEach(el => io.unobserve(el));
  }, [currentStepIndex, flowConfig]);

  // 4. Timeline Line & Item Reveal
  useEffect(() => {
    if (currentStep.type !== 'timeline') return;
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
  }, [currentStepIndex, flowConfig]);

  // 5. Reasons 3D Hover-Tilt Effect
  useEffect(() => {
    if (currentStep.type !== 'confession') return;
    if (getReduceMotion()) return;

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
  }, [currentStepIndex, flowConfig]);

  // ---------- ENVELOPE MULTI-PHASE TRANSITION ----------
  const handleOpenEnvelope = () => {
    if (envOpenClass !== '') return;

    setEnvOpenClass('open-step1');

    setTimeout(() => {
      setEnvOpenClass('open-step1 open-step2');
    }, 900);

    setTimeout(() => {
      setEnvOpenClass('open-step1 open-step2 open-step3');
    }, 2000);

    setTimeout(() => {
      handleNextStep();
      setEnvOpenClass('');
    }, 2900);
  };

  // ---------- QUIZ EVENT HANDLERS ----------
  const handleQuizSelection = (index) => {
    if (quizStatus === 'correct') return;
    setSelectedQuizOpt(index);

    if (index === currentStep.correctIndex) {
      setQuizStatus('correct');
      confetti({
        particleCount: 45,
        spread: 50,
        origin: { y: 0.8 }
      });
    } else {
      setQuizStatus('incorrect');
      setShakeQuizCard(true);
      setTimeout(() => {
        setShakeQuizCard(false);
        setSelectedQuizOpt(null);
        setQuizStatus('idle');
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

  const milestonesLength = currentStep.milestones?.length || 0;
  const totalTimelineRead = Object.values(readMilestones).filter(Boolean).length;
  const allMilestonesRead = milestonesLength > 0 && totalTimelineRead === milestonesLength;

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

  useEffect(() => {
    if (isPlayerTurn || gameWinner || currentStep.type !== 'tictactoe') return;

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
  }, [isPlayerTurn, board, gameWinner, currentStep]);

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

  const resetTicTacToe = () => {
    setBoard(Array(9).fill(null));
    setGameWinner(null);
    setIsPlayerTurn(true);
    setGameStatus("Your turn! Place your heart.");
  };

  // ---------- MEMORY MATCH GAME LOGIC ----------
  const initMemoryGame = () => {
    const symbolsList = currentStep.symbols || ['❤️', '🌸', '🎁', '✈️', '🍿', '🧸', '🍕', '☕'];
    const doubleSymbols = [...symbolsList, ...symbolsList];
    const shuffled = doubleSymbols
      .map((sym, idx) => ({ id: idx, symbol: sym, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5);

    setMemoryCards(shuffled);
    setSelectedMemoryIndices([]);
    setMatchedPairsCount(0);
  };

  useEffect(() => {
    if (currentStep.type === 'memory') {
      initMemoryGame();
    }
  }, [currentStepIndex, flowConfig]);

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

    const symbolsLength = currentStep.symbols?.length || 8;

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
                colors: ['#E68FA3', '#ECC695']
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

  // Memory Grid columns calculator
  const totalCards = memoryCards.length;
  let memoryCols = 4;
  if (totalCards <= 4) memoryCols = 2;
  else if (totalCards <= 12 && totalCards % 3 === 0) memoryCols = 3;
  else memoryCols = 4;

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

  // ---------- CUSTOMIZER OPERATIONS ----------
  const handleSaveToLocalStorage = (updatedFlow) => {
    localStorage.setItem('custom_flow_config', JSON.stringify(updatedFlow));
    setFlowConfig(updatedFlow);
    resetGameStates();
    setCurrentStepIndex(0);
  };

  const handleResetToDefault = () => {
    if (window.confirm("Reset all customizations to default template?")) {
      localStorage.removeItem('custom_flow_config');
      setFlowConfig(DEFAULT_FLOW);
      resetGameStates();
      setCurrentStepIndex(0);
      setEditingStepIndex(null);
    }
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newFlow = [...flowConfig];
    const temp = newFlow[index];
    newFlow[index] = newFlow[index - 1];
    newFlow[index - 1] = temp;
    handleSaveToLocalStorage(newFlow);
    if (editingStepIndex === index) setEditingStepIndex(index - 1);
    else if (editingStepIndex === index - 1) setEditingStepIndex(index);
  };

  const handleMoveDown = (index) => {
    if (index === flowConfig.length - 1) return;
    const newFlow = [...flowConfig];
    const temp = newFlow[index];
    newFlow[index] = newFlow[index + 1];
    newFlow[index + 1] = temp;
    handleSaveToLocalStorage(newFlow);
    if (editingStepIndex === index) setEditingStepIndex(index + 1);
    else if (editingStepIndex === index + 1) setEditingStepIndex(index);
  };

  const handleDeleteStep = (index) => {
    if (flowConfig.length <= 1) {
      alert("You need at least one step in the flow!");
      return;
    }
    if (window.confirm("Are you sure you want to delete this step?")) {
      const newFlow = flowConfig.filter((_, i) => i !== index);
      handleSaveToLocalStorage(newFlow);
      setEditingStepIndex(null);
    }
  };

  const handleAddStep = (type) => {
    const newStep = { id: `step_${Date.now()}`, type };
    if (type === 'quiz') {
      newStep.eyebrow = 'new chapter';
      newStep.title = 'Custom Trivia';
      newStep.question = 'Change this question?';
      newStep.options = ['Option A', 'Option B', 'Option C', 'Option D'];
      newStep.correctIndex = 0;
      newStep.successText = 'Correct answer!';
    } else if (type === 'timeline') {
      newStep.eyebrow = 'new chapter';
      newStep.title = 'Custom Timeline';
      newStep.intro = 'An introduction to our milestones...';
      newStep.signoff = '— Your Name';
      newStep.milestones = [{ title: 'Milestone Title', date: 'Date/Year', body: 'Milestone description goes here...' }];
    } else if (type === 'tictactoe') {
      newStep.eyebrow = 'new chapter';
      newStep.title = 'The Game of Hearts';
      newStep.instruction = 'Win a game of Tic-Tac-Toe to continue.';
    } else if (type === 'memory') {
      newStep.eyebrow = 'new chapter';
      newStep.title = 'Memory Match';
      newStep.instruction = 'Match the cards to proceed.';
      newStep.symbols = ['❤️', '⭐', '🎈', '☀️', '☕', '🧁', '🎵', '🎨'];
    } else if (type === 'cupidcatch') {
      newStep.eyebrow = 'new chapter';
      newStep.title = "Cupid's Catch";
      newStep.instruction = 'Catch 10 hearts or gifts to proceed.';
      newStep.targetScore = 10;
    } else if (type === 'connectlove') {
      newStep.eyebrow = 'new chapter';
      newStep.title = 'Connect the Love';
      newStep.instruction = 'Link the matching pairs together to proceed.';
    } else if (type === 'wordscramble') {
      newStep.eyebrow = 'new chapter';
      newStep.title = 'Romantic Word Scramble';
      newStep.instruction = 'Unscramble the letters to reveal the secret word.';
      newStep.targetWord = 'FOREVER';
    } else if (type === 'loverhythm') {
      newStep.eyebrow = 'new chapter';
      newStep.title = 'Love Rhythm';
      newStep.instruction = 'Tap the heart when the expanding ring perfectly aligns with it.';
      newStep.targetHits = 5;
    } else if (type === 'polaroidpuzzle') {
      newStep.eyebrow = 'new chapter';
      newStep.title = 'Polaroid Jigsaw';
      newStep.instruction = 'Slide the tiles to complete the image.';
      newStep.imageUrl = '';
    } else if (type === 'confession') {
      newStep.eyebrow = 'new chapter';
      newStep.title = 'Our Final Chapter';
      newStep.reasons = ['Reason number one...'];
      newStep.polaroids = [{ url: '', cap: "Caption", rot: 0 }];
      newStep.closingLetter = "The final love note text...";
      newStep.closingSig = "— always, Your Name";
      newStep.recipientName = "Her Name";
      newStep.footerYear = "2026";
    }

    const newFlow = [...flowConfig, newStep];
    handleSaveToLocalStorage(newFlow);
    setEditingStepIndex(newFlow.length - 1);
  };

  const handleUpdateStepProperty = (index, property, value) => {
    const newFlow = [...flowConfig];
    newFlow[index] = { ...newFlow[index], [property]: value };
    handleSaveToLocalStorage(newFlow);
  };

  const generateSharingLink = () => {
    const hash = encodeConfig(flowConfig);
    const origin = window.location.origin + window.location.pathname;
    const link = `${origin}?card=${hash}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <>
      {/* 1. Fireflies Background */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }} />

      {/* Floating Customize Toggle Button */}
      <button 
        className="customizer-toggle" 
        onClick={() => setIsCustomizerOpen(!isCustomizerOpen)}
        aria-label="Toggle customizer panel"
      >
        ⚙️
      </button>

      {/* CUSTOMIZER PANEL SIDEBAR */}
      <div className={`customizer-panel ${isCustomizerOpen ? 'open' : ''}`}>
        <div className="customizer-header">
          <h2>Card Customizer</h2>
          <button className="close-btn" onClick={() => setIsCustomizerOpen(false)}>×</button>
        </div>

        <div className="customizer-content">
          <div className="customizer-section">
            <h3>Manage Flow & Steps</h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}>
              Arrange the sequence of mini-games and quizzes below:
            </p>
            {flowConfig.map((step, idx) => (
              <div className="game-list-item" key={step.id}>
                <div className="game-list-item-header">
                  <span className="game-title-badge">
                    {idx + 1}. {step.type} {step.title ? `(${step.title})` : ''}
                  </span>
                  <div className="game-controls">
                    <button className="game-ctrl-btn" disabled={idx === 0} onClick={() => handleMoveUp(idx)}>▲</button>
                    <button className="game-ctrl-btn" disabled={idx === flowConfig.length - 1} onClick={() => handleMoveDown(idx)}>▼</button>
                    <button className="game-ctrl-btn" onClick={() => setEditingStepIndex(editingStepIndex === idx ? null : idx)}>✏️</button>
                    <button className="game-ctrl-btn" onClick={() => handleDeleteStep(idx)}>×</button>
                  </div>
                </div>

                {editingStepIndex === idx && (
                  <div className="game-edit-form">
                    <div className="custom-input-group">
                      <label>Eyebrow Text</label>
                      <input 
                        type="text" 
                        value={step.eyebrow || ''} 
                        onChange={(e) => handleUpdateStepProperty(idx, 'eyebrow', e.target.value)} 
                      />
                    </div>
                    {step.type !== 'envelope' && (
                      <div className="custom-input-group">
                        <label>Title</label>
                        <input 
                          type="text" 
                          value={step.title || ''} 
                          onChange={(e) => handleUpdateStepProperty(idx, 'title', e.target.value)} 
                        />
                      </div>
                    )}

                    {/* Step-specific configurations */}
                    {step.type === 'envelope' && (
                      <>
                        <div className="custom-input-group">
                          <label>Envelope Label (To:)</label>
                          <input 
                            type="text" 
                            value={step.label || ''} 
                            onChange={(e) => handleUpdateStepProperty(idx, 'label', e.target.value)} 
                          />
                        </div>
                        <div className="custom-input-group">
                          <label>Inside Letter Sneak-peek</label>
                          <input 
                            type="text" 
                            value={step.letter || ''} 
                            onChange={(e) => handleUpdateStepProperty(idx, 'letter', e.target.value)} 
                          />
                        </div>
                      </>
                    )}

                    {step.type === 'quiz' && (
                      <>
                        <div className="custom-input-group">
                          <label>Question</label>
                          <textarea 
                            rows="2"
                            value={step.question || ''} 
                            onChange={(e) => handleUpdateStepProperty(idx, 'question', e.target.value)} 
                          />
                        </div>
                        <div className="custom-input-group">
                          <label>Options (select radio for correct answer)</label>
                          {(step.options || []).map((opt, oIdx) => (
                            <div key={oIdx} className="option-edit-row">
                              <input 
                                type="radio" 
                                name={`correct-${idx}`} 
                                checked={step.correctIndex === oIdx}
                                onChange={() => handleUpdateStepProperty(idx, 'correctIndex', oIdx)}
                              />
                              <input 
                                type="text" 
                                value={opt} 
                                onChange={(e) => {
                                  const nextOpts = [...step.options];
                                  nextOpts[oIdx] = e.target.value;
                                  handleUpdateStepProperty(idx, 'options', nextOpts);
                                }}
                              />
                              <button 
                                className="game-ctrl-btn" 
                                disabled={(step.options || []).length <= 2}
                                onClick={() => {
                                  const nextOpts = step.options.filter((_, o) => o !== oIdx);
                                  let nextCorrect = step.correctIndex;
                                  if (nextCorrect >= nextOpts.length) {
                                    nextCorrect = nextOpts.length - 1;
                                  }
                                  const nextStep = { ...step, options: nextOpts, correctIndex: nextCorrect };
                                  const newFlow = [...flowConfig];
                                  newFlow[idx] = nextStep;
                                  handleSaveToLocalStorage(newFlow);
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button 
                            className="editor-btn-secondary"
                            onClick={() => {
                              const nextOpts = [...(step.options || []), `Option ${(step.options || []).length + 1}`];
                              handleUpdateStepProperty(idx, 'options', nextOpts);
                            }}
                          >
                            + Add Option
                          </button>
                        </div>
                        <div className="custom-input-group">
                          <label>Success Text</label>
                          <input 
                            type="text" 
                            value={step.successText || ''} 
                            onChange={(e) => handleUpdateStepProperty(idx, 'successText', e.target.value)} 
                          />
                        </div>
                      </>
                    )}

                    {step.type === 'timeline' && (
                      <>
                        <div className="custom-input-group">
                          <label>Intro Paragraphs</label>
                          <textarea 
                            rows="3"
                            value={step.intro || ''} 
                            onChange={(e) => handleUpdateStepProperty(idx, 'intro', e.target.value)} 
                          />
                        </div>
                        <div className="custom-input-group">
                          <label>Signoff Name</label>
                          <input 
                            type="text" 
                            value={step.signoff || ''} 
                            onChange={(e) => handleUpdateStepProperty(idx, 'signoff', e.target.value)} 
                          />
                        </div>
                        <div className="custom-input-group">
                          <label>Milestones</label>
                          {(step.milestones || []).map((ms, mIdx) => (
                            <div key={mIdx} style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.5rem' }}>
                              <input 
                                type="text" 
                                placeholder="Milestone Title"
                                value={ms.title} 
                                style={{ marginBottom: '0.25rem' }}
                                onChange={(e) => {
                                  const nextMs = [...step.milestones];
                                  nextMs[mIdx] = { ...nextMs[mIdx], title: e.target.value };
                                  handleUpdateStepProperty(idx, 'milestones', nextMs);
                                }}
                              />
                              <input 
                                type="text" 
                                placeholder="Date/Year"
                                value={ms.date}
                                style={{ marginBottom: '0.25rem' }}
                                onChange={(e) => {
                                  const nextMs = [...step.milestones];
                                  nextMs[mIdx] = { ...nextMs[mIdx], date: e.target.value };
                                  handleUpdateStepProperty(idx, 'milestones', nextMs);
                                }}
                              />
                              <textarea 
                                placeholder="Body text"
                                value={ms.body}
                                rows="2"
                                onChange={(e) => {
                                  const nextMs = [...step.milestones];
                                  nextMs[mIdx] = { ...nextMs[mIdx], body: e.target.value };
                                  handleUpdateStepProperty(idx, 'milestones', nextMs);
                                }}
                              />
                              <button 
                                className="game-ctrl-btn" 
                                style={{ marginTop: '0.25rem', width: 'auto', padding: '0 0.5rem' }}
                                onClick={() => {
                                  const nextMs = step.milestones.filter((_, i) => i !== mIdx);
                                  handleUpdateStepProperty(idx, 'milestones', nextMs);
                                }}
                              >
                                Delete Milestone
                              </button>
                            </div>
                          ))}
                          <button 
                            className="editor-btn-secondary"
                            onClick={() => {
                              const nextMs = [...(step.milestones || []), { title: 'New Event', date: 'Date', body: 'Description' }];
                              handleUpdateStepProperty(idx, 'milestones', nextMs);
                            }}
                          >
                            + Add Milestone
                          </button>
                        </div>
                      </>
                    )}

                    {step.type === 'tictactoe' && (
                      <div className="custom-input-group">
                        <label>Instruction Text</label>
                        <input 
                          type="text" 
                          value={step.instruction || ''} 
                          onChange={(e) => handleUpdateStepProperty(idx, 'instruction', e.target.value)} 
                        />
                      </div>
                    )}

                    {step.type === 'memory' && (
                      <>
                        <div className="custom-input-group">
                          <label>Instruction Text</label>
                          <input 
                            type="text" 
                            value={step.instruction || ''} 
                            onChange={(e) => handleUpdateStepProperty(idx, 'instruction', e.target.value)} 
                          />
                        </div>
                        <div className="custom-input-group">
                          <label>Memory Pairs (Text or Emojis)</label>
                          {(step.symbols || []).map((sym, sIdx) => (
                            <div key={sIdx} className="option-edit-row">
                              <input 
                                type="text" 
                                value={sym} 
                                onChange={(e) => {
                                  const nextSyms = [...step.symbols];
                                  nextSyms[sIdx] = e.target.value;
                                  handleUpdateStepProperty(idx, 'symbols', nextSyms);
                                }}
                              />
                              <button 
                                className="game-ctrl-btn" 
                                disabled={(step.symbols || []).length <= 2}
                                onClick={() => {
                                  const nextSyms = step.symbols.filter((_, s) => s !== sIdx);
                                  handleUpdateStepProperty(idx, 'symbols', nextSyms);
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button 
                            className="editor-btn-secondary"
                            onClick={() => {
                              const nextSyms = [...(step.symbols || []), '❓'];
                              handleUpdateStepProperty(idx, 'symbols', nextSyms);
                            }}
                          >
                            + Add Card Pair
                          </button>
                        </div>
                      </>
                    )}
                    
                    {step.type === 'cupidcatch' && (
                      <>
                        <div className="custom-input-group">
                          <label>Instruction Text</label>
                          <input 
                            type="text" 
                            value={step.instruction || ''} 
                            onChange={(e) => handleUpdateStepProperty(idx, 'instruction', e.target.value)} 
                          />
                        </div>
                        <div className="custom-input-group">
                          <label>Target Score</label>
                          <input 
                            type="number" 
                            value={step.targetScore || 10} 
                            onChange={(e) => handleUpdateStepProperty(idx, 'targetScore', parseInt(e.target.value) || 10)} 
                          />
                        </div>
                      </>
                    )}

                    {step.type === 'connectlove' && (
                      <div className="custom-input-group">
                        <label>Instruction Text</label>
                        <input 
                          type="text" 
                          value={step.instruction || ''} 
                          onChange={(e) => handleUpdateStepProperty(idx, 'instruction', e.target.value)} 
                        />
                      </div>
                    )}

                    {step.type === 'wordscramble' && (
                      <>
                        <div className="custom-input-group">
                          <label>Instruction Text</label>
                          <input 
                            type="text" 
                            value={step.instruction || ''} 
                            onChange={(e) => handleUpdateStepProperty(idx, 'instruction', e.target.value)} 
                          />
                        </div>
                        <div className="custom-input-group">
                          <label>Target Word</label>
                          <input 
                            type="text" 
                            value={step.targetWord || 'FOREVER'} 
                            onChange={(e) => handleUpdateStepProperty(idx, 'targetWord', e.target.value.toUpperCase())} 
                          />
                        </div>
                      </>
                    )}

                    {step.type === 'loverhythm' && (
                      <>
                        <div className="custom-input-group">
                          <label>Instruction Text</label>
                          <input 
                            type="text" 
                            value={step.instruction || ''} 
                            onChange={(e) => handleUpdateStepProperty(idx, 'instruction', e.target.value)} 
                          />
                        </div>
                        <div className="custom-input-group">
                          <label>Target Hits</label>
                          <input 
                            type="number" 
                            value={step.targetHits || 5} 
                            onChange={(e) => handleUpdateStepProperty(idx, 'targetHits', parseInt(e.target.value) || 5)} 
                          />
                        </div>
                      </>
                    )}

                    {step.type === 'polaroidpuzzle' && (
                      <>
                        <div className="custom-input-group">
                          <label>Instruction Text</label>
                          <input 
                            type="text" 
                            value={step.instruction || ''} 
                            onChange={(e) => handleUpdateStepProperty(idx, 'instruction', e.target.value)} 
                          />
                        </div>
                        <div className="custom-input-group">
                          <label>Image URL (Optional)</label>
                          <input 
                            type="text" 
                            value={step.imageUrl || ''} 
                            placeholder="Leave blank for heart pattern"
                            onChange={(e) => handleUpdateStepProperty(idx, 'imageUrl', e.target.value)} 
                          />
                        </div>
                      </>
                    )}

                    {step.type === 'confession' && (
                      <>
                        <div className="custom-input-group">
                          <label>Recipient Name</label>
                          <input 
                            type="text" 
                            value={step.recipientName || ''} 
                            onChange={(e) => handleUpdateStepProperty(idx, 'recipientName', e.target.value)} 
                          />
                        </div>
                        <div className="custom-input-group">
                          <label>Closing Signature</label>
                          <input 
                            type="text" 
                            value={step.closingSig || ''} 
                            onChange={(e) => handleUpdateStepProperty(idx, 'closingSig', e.target.value)} 
                          />
                        </div>
                        <div className="custom-input-group">
                          <label>Closing Love Note</label>
                          <textarea 
                            rows="3"
                            value={step.closingLetter || ''} 
                            onChange={(e) => handleUpdateStepProperty(idx, 'closingLetter', e.target.value)} 
                          />
                        </div>
                        <div className="custom-input-group">
                          <label>Confession Reasons (one per line)</label>
                          <textarea 
                            rows="5"
                            value={(step.reasons || []).join('\n')} 
                            onChange={(e) => {
                              const nextReasons = e.target.value.split('\n').filter(Boolean);
                              handleUpdateStepProperty(idx, 'reasons', nextReasons);
                            }} 
                          />
                        </div>
                        <div className="custom-input-group">
                          <label>Snapshots (Polaroids)</label>
                          {(step.polaroids || []).map((pol, pIdx) => (
                            <div key={pIdx} style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.5rem' }}>
                              <input 
                                type="text" 
                                placeholder="Image URL (http...)"
                                value={pol.url || ''} 
                                style={{ marginBottom: '0.25rem' }}
                                onChange={(e) => {
                                  const nextPols = [...step.polaroids];
                                  nextPols[pIdx] = { ...nextPols[pIdx], url: e.target.value };
                                  handleUpdateStepProperty(idx, 'polaroids', nextPols);
                                }}
                              />
                              <input 
                                type="text" 
                                placeholder="Caption"
                                value={pol.cap || ''}
                                style={{ marginBottom: '0.25rem' }}
                                onChange={(e) => {
                                  const nextPols = [...step.polaroids];
                                  nextPols[pIdx] = { ...nextPols[pIdx], cap: e.target.value };
                                  handleUpdateStepProperty(idx, 'polaroids', nextPols);
                                }}
                              />
                              <button 
                                className="game-ctrl-btn" 
                                style={{ marginTop: '0.25rem', width: 'auto', padding: '0 0.5rem' }}
                                onClick={() => {
                                  const nextPols = step.polaroids.filter((_, p) => p !== pIdx);
                                  handleUpdateStepProperty(idx, 'polaroids', nextPols);
                                }}
                              >
                                Delete Polaroid
                              </button>
                            </div>
                          ))}
                          <button 
                            className="editor-btn-secondary"
                            onClick={() => {
                              const nextPols = [...(step.polaroids || []), { url: '', cap: 'New memory', rot: Math.random() * 8 - 4 }];
                              handleUpdateStepProperty(idx, 'polaroids', nextPols);
                            }}
                          >
                            + Add Polaroid
                          </button>
                        </div>
                        <div className="custom-input-group">
                          <label>Footer Year</label>
                          <input 
                            type="text" 
                            value={step.footerYear || ''} 
                            onChange={(e) => handleUpdateStepProperty(idx, 'footerYear', e.target.value)} 
                          />
                        </div>
                      </>
                    )}

                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="customizer-section">
            <h3>Add New Chapter</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button className="editor-btn-secondary" style={{ marginTop: 0 }} onClick={() => handleAddStep('quiz')}>+ Quiz</button>
              <button className="editor-btn-secondary" style={{ marginTop: 0 }} onClick={() => handleAddStep('timeline')}>+ Timeline</button>
              <button className="editor-btn-secondary" style={{ marginTop: 0 }} onClick={() => handleAddStep('tictactoe')}>+ TicTacToe</button>
              <button className="editor-btn-secondary" style={{ marginTop: 0 }} onClick={() => handleAddStep('memory')}>+ Memory</button>
              <button className="editor-btn-secondary" style={{ marginTop: 0 }} onClick={() => handleAddStep('cupidcatch')}>+ Cupid's Catch</button>
              <button className="editor-btn-secondary" style={{ marginTop: 0 }} onClick={() => handleAddStep('connectlove')}>+ Connect Love</button>
              <button className="editor-btn-secondary" style={{ marginTop: 0 }} onClick={() => handleAddStep('wordscramble')}>+ Scramble</button>
              <button className="editor-btn-secondary" style={{ marginTop: 0 }} onClick={() => handleAddStep('loverhythm')}>+ Rhythm</button>
              <button className="editor-btn-secondary" style={{ marginTop: 0 }} onClick={() => handleAddStep('polaroidpuzzle')}>+ Jigsaw</button>
            </div>
            <button className="editor-btn-secondary" onClick={() => handleAddStep('confession')}>+ Final Confession</button>
          </div>
        </div>

        <div className="customizer-footer">
          <button className="editor-btn-primary" onClick={generateSharingLink}>
            {copiedLink ? "✓ Copied Link!" : "Copy Shareable Link"}
          </button>
          <button className="editor-btn-secondary" style={{ borderStyle: 'solid', marginTop: 0 }} onClick={handleResetToDefault}>
            Reset to Default Flow
          </button>
        </div>
      </div>

      {/* STAGE CONTAINER SHELL */}
      <div className="stage-container">
        {/* Render indicator of current position */}
        {flowConfig.length > 1 && (
          <div style={{ position: 'absolute', top: '1rem', left: '1.5rem', fontFamily: 'var(--sans)', fontSize: '0.75rem', opacity: 0.6 }}>
            Chapter {currentStepIndex + 1} of {flowConfig.length}
          </div>
        )}

        {/* STEP 0: ENVELOPE */}
        {currentStep.type === 'envelope' && (
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
                    <p>{currentStep.letter}</p>
                  </div>
                  <div className="env-flap"></div>
                  <div className="env-seal">
                    <svg viewBox="0 0 32 29">
                      <path d="M23.6 0c-3 0-5.7 1.7-7.6 4.4C14.1 1.7 11.4 0 8.4 0 3.8 0 0 3.9 0 8.8c0 8.4 8.6 13 15.4 19.6.3.3.9.3 1.2 0C23.4 21.8 32 17.2 32 8.8 32 3.9 28.2 0 23.6 0z"/>
                    </svg>
                  </div>
                  <div className="env-label">{currentStep.label}</div>
                </button>
              </div>
              <span className={`tap-prompt ${envOpenClass !== '' ? 'gone' : ''}`} id="tapPrompt">tap to open</span>
            </div>
          </div>
        )}

        {/* STEP TYPE: QUIZ */}
        {currentStep.type === 'quiz' && (
          <div className={`stage-panel ${shakeQuizCard ? 'shake' : ''}`}>
            <div className="quiz-card paper-vintage">
              <div className="paper-vintage-bg"></div>
              {currentStep.eyebrow && <span className="eyebrow" style={{ color: '#7A0923' }}>{currentStep.eyebrow}</span>}
              <h3>{currentStep.title}</h3>
              <p className="question">{currentStep.question}</p>

              <div className="quiz-options">
                {(currentStep.options || []).map((option, idx) => {
                  let optClass = '';
                  if (selectedQuizOpt === idx) {
                    optClass = quizStatus === 'correct' ? 'correct' : 'incorrect';
                  }
                  return (
                    <button 
                      key={idx}
                      className={`quiz-option ${optClass}`}
                      disabled={quizStatus === 'correct'}
                      onClick={() => handleQuizSelection(idx)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {quizStatus === 'correct' && (
                <div style={{ marginTop: '2.5rem', animation: 'pageFlipIn 0.5s ease forwards' }}>
                  <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', marginBottom: '1.5rem', color: '#1b5e20' }}>
                    {currentStep.successText}
                  </p>
                  <button className="vintage-btn" onClick={handleNextStep}>
                    Continue
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP TYPE: TIMELINE */}
        {currentStep.type === 'timeline' && (
          <div className="stage-panel">
            <section style={{ marginBottom: '3rem' }}>
              <div className="section-inner">
                <div className="letter-card paper-vintage">
                  <div className="paper-vintage-bg"></div>
                  {(currentStep.intro || '').split('\n\n').map((para, pIdx) => (
                    <p key={pIdx}>{para}</p>
                  ))}
                  <div className="signoff">{currentStep.signoff}</div>
                </div>
              </div>
            </section>

            <section>
              <div className="section-inner">
                {currentStep.eyebrow && <span className="eyebrow">{currentStep.eyebrow}</span>}
                <div className="heart-divider">
                  <svg viewBox="0 0 32 29"><path d="M23.6 0c-3 0-5.7 1.7-7.6 4.4C14.1 1.7 11.4 0 8.4 0 3.8 0 0 3.9 0 8.8c0 8.4 8.6 13 15.4 19.6.3.3.9.3 1.2 0C23.4 21.8 32 17.2 32 8.8 32 3.9 28.2 0 23.6 0z"/></svg>
                </div>
                <h2 className="section-title">{currentStep.title}</h2>
                <div className="timeline">
                  <div className="timeline-line" id="timelineLine"></div>

                  {(currentStep.milestones || []).map((item, idx) => (
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
                      ? "Milestones read! Ready to continue." 
                      : `Read all ${milestonesLength} memories to unlock the next stage. (${totalTimelineRead}/${milestonesLength} read)`
                    }
                  </p>
                  <button className="vintage-btn" disabled={!allMilestonesRead} onClick={handleNextStep}>
                    Continue
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* STEP TYPE: TIC-TAC-TOE */}
        {currentStep.type === 'tictactoe' && (
          <div className="stage-panel">
            <div className="game-card paper-vintage">
              <div className="paper-vintage-bg"></div>
              {currentStep.eyebrow && <span className="eyebrow" style={{ color: '#7A0923' }}>{currentStep.eyebrow}</span>}
              <h3>{currentStep.title}</h3>
              <p>{currentStep.instruction}</p>

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
                <button className="vintage-btn" onClick={resetTicTacToe} style={{ background: '#ECC695', marginRight: '10px' }}>
                  Try Again
                </button>
              )}

              {gameWinner === playerSymbol && (
                <div style={{ animation: 'pageFlipIn 0.5s ease forwards' }}>
                  <button className="vintage-btn" onClick={handleNextStep}>
                    Continue
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP TYPE: CUPID CATCH */}
        {currentStep.type === 'cupidcatch' && (
          <div className="stage-panel" style={{ display: 'flex', justifyContent: 'center' }}>
            <CupidCatchGame step={currentStep} onComplete={handleNextStep} />
          </div>
        )}

        {/* STEP TYPE: CONNECT LOVE */}
        {currentStep.type === 'connectlove' && (
          <div className="stage-panel" style={{ display: 'flex', justifyContent: 'center' }}>
            <ConnectLoveGame step={currentStep} onComplete={handleNextStep} />
          </div>
        )}

        {/* STEP TYPE: WORD SCRAMBLE */}
        {currentStep.type === 'wordscramble' && (
          <div className="stage-panel" style={{ display: 'flex', justifyContent: 'center' }}>
            <WordScrambleGame step={currentStep} onComplete={handleNextStep} />
          </div>
        )}

        {/* STEP TYPE: LOVE RHYTHM */}
        {currentStep.type === 'loverhythm' && (
          <div className="stage-panel" style={{ display: 'flex', justifyContent: 'center' }}>
            <LoveRhythmGame step={currentStep} onComplete={handleNextStep} />
          </div>
        )}

        {/* STEP TYPE: POLAROID PUZZLE */}
        {currentStep.type === 'polaroidpuzzle' && (
          <div className="stage-panel" style={{ display: 'flex', justifyContent: 'center' }}>
            <PolaroidPuzzleGame step={currentStep} onComplete={handleNextStep} />
          </div>
        )}

        {/* STEP TYPE: MEMORY */}
        {currentStep.type === 'memory' && (
          <div className="stage-panel">
            <div className="game-card paper-vintage" style={{ maxWidth: '500px' }}>
              <div className="paper-vintage-bg"></div>
              {currentStep.eyebrow && <span className="eyebrow" style={{ color: '#7A0923' }}>{currentStep.eyebrow}</span>}
              <h3>{currentStep.title}</h3>
              <p style={{ marginBottom: '1.5rem' }}>{currentStep.instruction}</p>

              <div className="memory-grid" style={{ '--grid-cols': memoryCols }}>
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
                {matchedPairsCount === (currentStep.symbols?.length || 8) 
                  ? "Pairs matched! Continue to the next stage." 
                  : `Pairs matched: ${matchedPairsCount} / ${currentStep.symbols?.length || 8}`
                }
              </div>

              {matchedPairsCount === (currentStep.symbols?.length || 8) && (
                <div style={{ animation: 'pageFlipIn 0.5s ease forwards' }}>
                  <button className="vintage-btn" onClick={handleNextStep}>
                    Continue
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP TYPE: CONFESSION */}
        {currentStep.type === 'confession' && (
          <div className="stage-panel">
            {/* Reasons Grid */}
            <section style={{ marginBottom: '4rem' }}>
              <div className="section-inner">
                {currentStep.eyebrow && <span className="eyebrow">{currentStep.eyebrow}</span>}
                <div className="heart-divider">
                  <svg viewBox="0 0 32 29"><path d="M23.6 0c-3 0-5.7 1.7-7.6 4.4C14.1 1.7 11.4 0 8.4 0 3.8 0 0 3.9 0 8.8c0 8.4 8.6 13 15.4 19.6.3.3.9.3 1.2 0C23.4 21.8 32 17.2 32 8.8 32 3.9 28.2 0 23.6 0z"/></svg>
                </div>
                <h2 className="section-title">{currentStep.title}</h2>
                <div className="reasons-grid" id="reasonsGrid">
                  {(currentStep.reasons || []).map((r, i) => (
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
            {(currentStep.polaroids || []).length > 0 && (
              <section style={{ marginBottom: '4rem' }}>
                <div className="section-inner" style={{ maxWidth: '1000px' }}>
                  <span className="eyebrow">snapshots</span>
                  <div className="heart-divider">
                    <svg viewBox="0 0 32 29"><path d="M23.6 0c-3 0-5.7 1.7-7.6 4.4C14.1 1.7 11.4 0 8.4 0 3.8 0 0 3.9 0 8.8c0 8.4 8.6 13 15.4 19.6.3.3.9.3 1.2 0C23.4 21.8 32 17.2 32 8.8 32 3.9 28.2 0 23.6 0z"/></svg>
                  </div>
                  <h2 className="section-title">Some of my favorite moments</h2>
                  <div className="gallery">
                    {(currentStep.polaroids || []).map((p, i) => (
                      <div 
                        key={i} 
                        className="polaroid paper-vintage reveal" 
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
              <h2>{currentStep.closingLetter}</h2>
              <div className="sig">{currentStep.closingSig}</div>
              <button className="one-more" onClick={handleConfetti} id="oneMoreBtn">{sigText}</button>
            </div>
          </div>
        )}

        {/* Navigation buttons at the bottom if not inside envelope */}
        {currentStep.type !== 'envelope' && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center', zIndex: 10, position: 'relative' }}>
            <button className="vintage-btn" style={{ background: 'transparent', border: '1px solid rgba(236,198,149,0.3)', color: 'var(--champagne)' }} onClick={handlePrevStep}>
              ← Back
            </button>
            {currentStep.type !== 'quiz' && 
             currentStep.type !== 'tictactoe' && 
             currentStep.type !== 'memory' && 
             currentStep.type !== 'timeline' && 
             currentStep.type !== 'cupidcatch' && 
             currentStep.type !== 'connectlove' && 
             currentStep.type !== 'wordscramble' && 
             currentStep.type !== 'loverhythm' && 
             currentStep.type !== 'polaroidpuzzle' && 
             currentStepIndex < flowConfig.length - 1 && (
              <button className="vintage-btn" onClick={handleNextStep}>
                Skip / Next →
              </button>
            )}
          </div>
        )}

      </div>

      {/* Footer */}
      {currentStep.type === 'confession' && (
        <footer>made with more care than code, for {currentStep.recipientName} · {currentStep.footerYear}</footer>
      )}
    </>
  );
}
