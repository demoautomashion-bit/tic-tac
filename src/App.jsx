import { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';

export default function App() {
  const [veilHidden, setVeilHidden] = useState(false);
  const [opened, setOpened] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});
  const [sigText, setSigText] = useState('one more thing');
  
  const envSceneRef = useRef(null);
  const canvasRef = useRef(null);

  // 1. Veil Fadeout on mount
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

  // 3. Cursor Heart Trail (respects reduced motion & mouse fine pointers)
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

  // 4. Scroll Reveal via IntersectionObserver
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in');
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => io.observe(el));
    return () => revealEls.forEach(el => io.unobserve(el));
  }, []);

  // 5. Timeline Line & Item Reveal
  useEffect(() => {
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
    }, { threshold: 0.25 });

    items.forEach(item => ioItem.observe(item));

    return () => {
      if (timelineSection) ioLine.unobserve(timelineSection);
      items.forEach(item => ioItem.unobserve(item));
    };
  }, []);

  // 6. Reasons 3D Tilt Effect
  useEffect(() => {
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
        card.removeEventListener('mousemove', card._moveListener);
        card.removeEventListener('mouseleave', card._leaveListener);
      });
    };
  }, [flippedCards]);

  const toggleCard = (index) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleConfetti = () => {
    confetti({
      particleCount: 95,
      spread: 80,
      startVelocity: 34,
      origin: { y: 0.65 },
      colors: ['#D4A59A', '#E6C594', '#8A2D3C']
    });
    setSigText('I mean it.');
  };

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

  // Polaroid gallery photo data
  const polaroids = [
    { cap: "that one weekend", rot: -2 },
    { cap: "the road trip", rot: 3 },
    { cap: "your birthday", rot: -4 },
    { cap: "just because", rot: 1 },
    { cap: "the rainy day", rot: -3 },
    { cap: "the good year", rot: 4 }
  ];

  return (
    <>
      {/* 1. Fireflies Canvas Background */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }} />

      {/* 2. Veil Preloader */}
      <div className={`veil ${veilHidden ? 'hide' : ''}`} id="veil">
        <span className="veil-text">for you...</span>
      </div>

      {/* 3. Hero / Envelope Section */}
      <section className="hero">
        <div className="envelope-wrap">
          <div className={`envelope-scene ${opened ? 'open' : ''}`} ref={envSceneRef} id="envScene">
            <div className="env-shadow"></div>
            <button className="envelope" onClick={() => setOpened(true)} id="envBtn" aria-label="Open the letter">
              <div className="env-body"></div>
              <div className="env-letter paper-vintage">
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
          <span className={`tap-prompt ${opened ? 'gone' : ''}`} id="tapPrompt">tap to open</span>
        </div>
        <div className={`scrolldown ${opened ? 'show' : ''}`} id="scrollDown">
          <span>keep going</span>
          <span className="line"></span>
        </div>
      </section>

      {/* 4. Opening Letter Section */}
      <section id="letterSection">
        <div className="section-inner reveal" id="letterCard">
          <div className="letter-card paper-vintage">
            <p>I've been trying to find the right way to tell you this, so I built you something instead.</p>
            <p>This isn't a card you'll lose in a drawer, or a text that gets buried under everything else. It's just... us, written down. The parts I don't say enough out loud.</p>
            <p>So take your time. Scroll slowly. This one's just for you.</p>
            <div className="signoff">— [Your Name]</div>
          </div>
        </div>
      </section>

      {/* 5. Chapter 1: Timeline Section */}
      <section>
        <div className="section-inner">
          <span className="eyebrow reveal">chapter one</span>
          <div className="heart-divider reveal">
            <svg viewBox="0 0 32 29"><path d="M23.6 0c-3 0-5.7 1.7-7.6 4.4C14.1 1.7 11.4 0 8.4 0 3.8 0 0 3.9 0 8.8c0 8.4 8.6 13 15.4 19.6.3.3.9.3 1.2 0C23.4 21.8 32 17.2 32 8.8 32 3.9 28.2 0 23.6 0z"/></svg>
          </div>
          <h2 className="section-title reveal">How we found each other</h2>
          <div className="timeline">
            <div className="timeline-line" id="timelineLine"></div>

            <div className="t-item">
              <div className="t-card paper-vintage">
                <div className="t-dot"></div>
                <span className="t-date">[Month, Year]</span>
                <h3 className="t-title">The day we met</h3>
                <p>[Placeholder — describe how you first crossed paths. Where were you, what did she say, what did you notice first?]</p>
              </div>
            </div>

            <div className="t-item">
              <div className="t-card paper-vintage">
                <div className="t-dot"></div>
                <span className="t-date">[Month, Year]</span>
                <h3 className="t-title">Our first date</h3>
                <p>[Placeholder — where you went, the thing that made you both laugh, the moment you knew you wanted a second one.]</p>
              </div>
            </div>

            <div className="t-item">
              <div className="t-card paper-vintage">
                <div className="t-dot"></div>
                <span className="t-date">[Month, Year]</span>
                <h3 className="t-title">The trip that changed things</h3>
                <p>[Placeholder — a trip, a late night, a hard time you got through together. Whatever made it feel real.]</p>
              </div>
            </div>

            <div className="t-item">
              <div className="t-card paper-vintage">
                <div className="t-dot"></div>
                <span className="t-date">Today</span>
                <h3 className="t-title">Still here, still us</h3>
                <p>[Placeholder — a line about where you are now, and why you're still choosing each other.]</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Chapter 2: Reasons Section */}
      <section>
        <div className="section-inner">
          <span className="eyebrow reveal">chapter two</span>
          <div className="heart-divider reveal">
            <svg viewBox="0 0 32 29"><path d="M23.6 0c-3 0-5.7 1.7-7.6 4.4C14.1 1.7 11.4 0 8.4 0 3.8 0 0 3.9 0 8.8c0 8.4 8.6 13 15.4 19.6.3.3.9.3 1.2 0C23.4 21.8 32 17.2 32 8.8 32 3.9 28.2 0 23.6 0z"/></svg>
          </div>
          <h2 className="section-title reveal">Reasons, in no particular order</h2>
          <div className="reasons-grid" id="reasonsGrid">
            {reasons.map((r, i) => (
              <div 
                key={i} 
                className={`flip-card reveal ${flippedCards[i] ? 'flipped' : ''}`}
                onClick={() => toggleCard(i)}
              >
                <div className="flip-inner">
                  <div className="flip-face flip-front">
                    <span className="num">{(i + 1).toString().padStart(2, '0')}</span>
                  </div>
                  <div className="flip-face flip-back paper-vintage">
                    <p>{r}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Chapter 3: Gallery Section */}
      <section>
        <div className="section-inner" style={{ maxWidth: '1000px' }}>
          <span className="eyebrow reveal">chapter three</span>
          <div className="heart-divider reveal">
            <svg viewBox="0 0 32 29"><path d="M23.6 0c-3 0-5.7 1.7-7.6 4.4C14.1 1.7 11.4 0 8.4 0 3.8 0 0 3.9 0 8.8c0 8.4 8.6 13 15.4 19.6.3.3.9.3 1.2 0C23.4 21.8 32 17.2 32 8.8 32 3.9 28.2 0 23.6 0z"/></svg>
          </div>
          <h2 className="section-title reveal">Some of my favorite moments</h2>
          <div className="gallery" id="gallery">
            {polaroids.map((p, i) => (
              <div 
                key={i} 
                className="polaroid paper-vintage reveal" 
                style={{ transform: `rotate(${p.rot}deg)` }}
              >
                <div className="polaroid-img">[ your photo here ]</div>
                <div className="polaroid-cap">{p.cap}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Closing Section */}
      <section className="closing">
        <h2 className="reveal" id="closingText">So here's the truth: every version of my future has you in it.</h2>
        <div className="sig reveal" id="closingSig">— always, [Your Name]</div>
        <button className="one-more reveal" onClick={handleConfetti} id="oneMoreBtn">{sigText}</button>
      </section>

      {/* 9. Footer */}
      <footer>made with more care than code, for [Her Name] · [Year]</footer>
    </>
  );
}
