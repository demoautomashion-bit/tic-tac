"use client";

import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";

import Envelope from "@/components/Envelope";
import Quiz from "@/components/Quiz";
import Timeline from "@/components/Timeline";
import MemoryGame from "@/components/MemoryGame";
import Confession from "@/components/Confession";
import CustomizerPanel from "@/components/CustomizerPanel";

import ThemeSelector from "@/components/ThemeSelector";
import DynamicBackground from "@/components/DynamicBackground";

import TicTacToeGame from "@/components/games/TicTacToe";
import CupidCatchGame from "@/components/games/CupidCatch";
import ConnectLoveGame from "@/components/games/ConnectLove";
import WordScrambleGame from "@/components/games/WordScramble";
import LoveRhythmGame from "@/components/games/LoveRhythm";
import PolaroidPuzzleGame from "@/components/games/PolaroidPuzzle";

const DEFAULT_FLOW = [
  { 
    id: "envelope", 
    type: "envelope", 
    label: "For Her Name", 
    letter: "...I've been meaning to tell you something..." 
  },
  { 
    id: "quiz1", 
    type: "quiz", 
    eyebrow: "chapter one", 
    title: "First Milestone", 
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
    id: "timeline", 
    type: "timeline", 
    eyebrow: "chapter two", 
    title: "How we found each other", 
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
    id: "quiz2", 
    type: "quiz", 
    eyebrow: "chapter three", 
    title: "Secret Quirks", 
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
    id: "tictactoe", 
    type: "tictactoe", 
    eyebrow: "chapter four", 
    title: "The Game of Hearts", 
    instruction: "Win a round of Tic-Tac-Toe to unlock the next stage." 
  },
  {
    id: "cupidcatch",
    type: "cupidcatch",
    eyebrow: "chapter five",
    title: "Cupid's Catch",
    instruction: "Catch 10 falling hearts or gifts using the basket to unlock the next stage!",
    targetScore: 10
  },
  {
    id: "connectlove",
    type: "connectlove",
    eyebrow: "chapter six",
    title: "Connect the Love",
    instruction: "Link the matching pairs together to unlock the next stage."
  },
  {
    id: "wordscramble",
    type: "wordscramble",
    eyebrow: "chapter seven",
    title: "Romantic Word Scramble",
    instruction: "Unscramble the letters to reveal the secret word.",
    targetWord: "FOREVER"
  },
  {
    id: "loverhythm",
    type: "loverhythm",
    eyebrow: "chapter eight",
    title: "Love Rhythm",
    instruction: "Tap the heart when the expanding ring perfectly aligns with it 5 times!",
    targetHits: 5
  },
  {
    id: "polaroidpuzzle",
    type: "polaroidpuzzle",
    eyebrow: "chapter nine",
    title: "Polaroid Jigsaw",
    instruction: "Slide the tiles to complete the image.",
    imageUrl: ""
  },
  { 
    id: "memory", 
    type: "memory", 
    eyebrow: "chapter ten", 
    title: "Memory Match", 
    instruction: "Match all pairs of cards to unlock the next stage.", 
    symbols: ["❤️", "🌸", "🎁", "✈️", "🍿", "🧸", "🍕", "☕"] 
  },
  { 
    id: "confession", 
    type: "confession", 
    eyebrow: "chapter eleven", 
    title: "Reasons, in no particular order", 
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
      { url: "", cap: "that one weekend", rot: -2 },
      { url: "", cap: "the road trip", rot: 3 },
      { url: "", cap: "your birthday", rot: -4 },
      { url: "", cap: "just because", rot: 1 },
      { url: "", cap: "the rainy day", rot: -3 },
      { url: "", cap: "the good year", rot: 4 }
    ], 
    closingLetter: "So here's the truth: every version of my future has you in it.", 
    closingSig: "— always, Your Name", 
    recipientName: "Her Name", 
    footerYear: "2026" 
  }
];

import ShareModal from "@/components/ShareModal";
import { encodeCardPayload, decodeCardPayload } from "@/utils/urlSerializer";
import { saveCardPayloadToCloud, fetchCardPayloadFromCloud } from "@/utils/cardStorage";


export default function Home() {
  const [flowConfig, setFlowConfig] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('burgundy');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [activeCloudId, setActiveCloudId] = useState(null);
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    async function loadCardData() {
      const params = new URLSearchParams(window.location.search);
      const cloudId = params.get("c");
      const cardParam = params.get("card");
      
      // 1. Try short cloud ID parameter first (e.g. ?c=binId)
      // When a short ID URL is opened, strictly bypass localStorage!
      if (cloudId) {
        const cloudData = await fetchCardPayloadFromCloud(cloudId);
        if (cloudData && cloudData.flow && Array.isArray(cloudData.flow)) {
          setFlowConfig(cloudData.flow);
          setActiveCloudId(cloudId);
          if (cloudData.theme) {
            setCurrentTheme(cloudData.theme);
            document.documentElement.setAttribute('data-theme', cloudData.theme);
          }
          return;
        }
      }

      // 2. Legacy encoded parameter fallback (?card=...)
      if (cardParam) {
        const decoded = decodeCardPayload(cardParam);
        if (decoded && decoded.flow && Array.isArray(decoded.flow)) {
          setFlowConfig(decoded.flow);
          if (decoded.theme) {
            setCurrentTheme(decoded.theme);
            document.documentElement.setAttribute('data-theme', decoded.theme);
          }
          return;
        }
      }

      // 3. Only read from local storage if NO share URL parameters are present
      const savedTheme = localStorage.getItem('app_color_theme');
      if (savedTheme) {
        setCurrentTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        document.documentElement.setAttribute('data-theme', 'burgundy');
      }

      const saved = localStorage.getItem("custom_flow_config");
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
    }

    loadCardData();
  }, []);

  // Update share link state when configuration or theme changes
  useEffect(() => {
    if (flowConfig.length === 0) return;
    
    // If we have an active short cloud ID, set the share URL
    if (activeCloudId) {
      const shortUrl = `${window.location.origin}${window.location.pathname}?c=${activeCloudId}`;
      setShareUrl(shortUrl);
      window.history.replaceState(null, "", `?c=${activeCloudId}`);
    } else {
      // Clear shareUrl until short ID is generated on share click
      setShareUrl("");
    }
  }, [flowConfig, currentTheme, activeCloudId]);

  const generateSharingLink = async () => {
    setIsGeneratingShareLink(true);
    setIsShareModalOpen(true);

    // Save payload to native same-origin endpoint to get short ID
    const binId = await saveCardPayloadToCloud(flowConfig, currentTheme);
    if (binId) {
      setActiveCloudId(binId);
      const shortUrl = `${window.location.origin}${window.location.pathname}?c=${binId}`;
      setShareUrl(shortUrl);
      window.history.replaceState(null, "", `?c=${binId}`);
    }
    setIsGeneratingShareLink(false);
  };

  const handleNextStep = () => {
    if (currentStepIndex < flowConfig.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const getReduceMotion = () => {
    return typeof window !== "undefined" && window.matchMedia 
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches 
      : false;
  };

  const getFinePointer = () => {
    return typeof window !== "undefined" && window.matchMedia 
      ? window.matchMedia("(pointer: fine)").matches 
      : true;
  };

  // Fireflies Animation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (getReduceMotion()) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

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

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (let f of fireflies) {
        f.y += f.speedY;
        f.angle += f.angleSpeed;
        f.x += f.speedX + Math.sin(f.angle) * 0.15;

        if (f.y < -10) f.y = height + 10;
        if (f.x < -10) f.x = width + 10;
        if (f.x > width + 10) f.x = -10;

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
        ctx.shadowColor = "rgba(236, 198, 149, 0.7)";
        ctx.fill();
      }
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Heart Trail Cursor Effect
  useEffect(() => {
    if (getReduceMotion() || !getFinePointer()) return;

    let lastSpawn = 0;
    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastSpawn < 120) return;
      if (Math.random() > 0.45) return;
      lastSpawn = now;

      const heart = document.createElement("div");
      heart.className = "cursor-heart";
      const size = 10 + Math.random() * 8;
      heart.style.width = size + "px";
      heart.style.height = (size * 0.9) + "px";
      heart.style.left = (e.clientX - size / 2) + "px";
      heart.style.top = (e.clientY - size / 2) + "px";
      heart.style.setProperty("--cx", (Math.random() * 26 - 13) + "px");
      heart.innerHTML = `<svg viewBox="0 0 32 29"><path d="M23.6 0c-3 0-5.7 1.7-7.6 4.4C14.1 1.7 11.4 0 8.4 0 3.8 0 0 3.9 0 8.8c0 8.4 8.6 13 15.4 19.6.3.3.9.3 1.2 0C23.4 21.8 32 17.2 32 8.8 32 3.9 28.2 0 23.6 0z"/></svg>`;
      
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 1200);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSaveToLocalStorage = (updatedFlow) => {
    localStorage.setItem("custom_flow_config", JSON.stringify(updatedFlow));
    setFlowConfig(updatedFlow);
    setActiveCloudId(null);
    setCurrentStepIndex(0);
  };

  const handleResetToDefault = () => {
    if (window.confirm("Reset all customizations to default template?")) {
      localStorage.removeItem("custom_flow_config");
      setFlowConfig(DEFAULT_FLOW);
      setActiveCloudId(null);
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
    if (type === "quiz") {
      newStep.eyebrow = "new chapter";
      newStep.title = "Custom Trivia";
      newStep.question = "Change this question?";
      newStep.options = ["Option A", "Option B", "Option C", "Option D"];
      newStep.correctIndex = 0;
      newStep.successText = "Correct answer!";
    } else if (type === "timeline") {
      newStep.eyebrow = "new chapter";
      newStep.title = "Custom Timeline";
      newStep.intro = "An introduction to our milestones...";
      newStep.signoff = "— Your Name";
      newStep.milestones = [{ title: "Milestone Title", date: "Date/Year", body: "Milestone description goes here..." }];
    } else if (type === "tictactoe") {
      newStep.eyebrow = "new chapter";
      newStep.title = "The Game of Hearts";
      newStep.instruction = "Win a game of Tic-Tac-Toe to continue.";
    } else if (type === "memory") {
      newStep.eyebrow = "new chapter";
      newStep.title = "Memory Match";
      newStep.instruction = "Match the cards to proceed.";
      newStep.symbols = ["❤️", "⭐", "🎈", "☀️", "☕", "🧁", "🎵", "🎨"];
    } else if (type === "cupidcatch") {
      newStep.eyebrow = "new chapter";
      newStep.title = "Cupid's Catch";
      newStep.instruction = "Catch 10 hearts or gifts to proceed.";
      newStep.targetScore = 10;
    } else if (type === "connectlove") {
      newStep.eyebrow = "new chapter";
      newStep.title = "Connect the Love";
      newStep.instruction = "Link the matching pairs together to proceed.";
    } else if (type === "wordscramble") {
      newStep.eyebrow = "new chapter";
      newStep.title = "Romantic Word Scramble";
      newStep.instruction = "Unscramble the letters to reveal the secret word.";
      newStep.targetWord = "FOREVER";
    } else if (type === "loverhythm") {
      newStep.eyebrow = "new chapter";
      newStep.title = "Love Rhythm";
      newStep.instruction = "Tap the heart when the expanding ring perfectly aligns with it.";
      newStep.targetHits = 5;
    } else if (type === "polaroidpuzzle") {
      newStep.eyebrow = "new chapter";
      newStep.title = "Polaroid Jigsaw";
      newStep.instruction = "Slide the tiles to complete the image.";
      newStep.imageUrl = "";
    } else if (type === "confession") {
      newStep.eyebrow = "new chapter";
      newStep.title = "Our Final Chapter";
      newStep.reasons = ["Reason number one..."];
      newStep.polaroids = [{ url: "", cap: "Caption", rot: 0 }];
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

  const handleSelectTheme = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('app_color_theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  };

  const handleCopyShareUrl = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const currentStep = flowConfig[currentStepIndex] || {};

  return (
    <>
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }} />

      <button 
        className="customizer-toggle" 
        onClick={() => setIsCustomizerOpen(!isCustomizerOpen)}
        aria-label="Toggle customizer panel"
      >
        ⚙️
      </button>

      <CustomizerPanel
        isCustomizerOpen={isCustomizerOpen}
        setIsCustomizerOpen={setIsCustomizerOpen}
        flowConfig={flowConfig}
        editingStepIndex={editingStepIndex}
        setEditingStepIndex={setEditingStepIndex}
        copiedLink={copiedLink}
        generateSharingLink={generateSharingLink}
        onOpenShareModal={generateSharingLink}
        handleResetToDefault={handleResetToDefault}
        handleMoveUp={handleMoveUp}
        handleMoveDown={handleMoveDown}
        handleDeleteStep={handleDeleteStep}
        handleAddStep={handleAddStep}
        handleUpdateStepProperty={handleUpdateStepProperty}
        handleSaveToLocalStorage={handleSaveToLocalStorage}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
      />

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
        copiedLink={copiedLink}
        onCopy={handleCopyShareUrl}
        isGenerating={isGeneratingShareLink}
      />

      <div className="stage-container">
        {flowConfig.length > 1 && (
          <div style={{ position: "absolute", top: "1rem", left: "1.5rem", fontFamily: "var(--sans)", fontSize: "0.75rem", opacity: 0.6 }}>
            Chapter {currentStepIndex + 1} of {flowConfig.length}
          </div>
        )}

        {currentStep.type === "envelope" && (
          <Envelope step={currentStep} onComplete={handleNextStep} />
        )}

        {currentStep.type === "quiz" && (
          <Quiz 
            step={currentStep} 
            onComplete={handleNextStep} 
            currentTheme={currentTheme}
            onSelectTheme={handleSelectTheme}
          />
        )}

        {currentStep.type === "timeline" && (
          <Timeline step={currentStep} onComplete={handleNextStep} />
        )}

        {currentStep.type === "tictactoe" && (
          <div className="stage-panel" style={{ display: "flex", justifyContent: "center" }}>
            <TicTacToeGame step={currentStep} onComplete={handleNextStep} />
          </div>
        )}

        {currentStep.type === "cupidcatch" && (
          <div className="stage-panel" style={{ display: "flex", justifyContent: "center" }}>
            <CupidCatchGame step={currentStep} onComplete={handleNextStep} />
          </div>
        )}

        {currentStep.type === "connectlove" && (
          <div className="stage-panel" style={{ display: "flex", justifyContent: "center" }}>
            <ConnectLoveGame step={currentStep} onComplete={handleNextStep} />
          </div>
        )}

        {currentStep.type === "wordscramble" && (
          <div className="stage-panel" style={{ display: "flex", justifyContent: "center" }}>
            <WordScrambleGame step={currentStep} onComplete={handleNextStep} />
          </div>
        )}

        {currentStep.type === "loverhythm" && (
          <div className="stage-panel" style={{ display: "flex", justifyContent: "center" }}>
            <LoveRhythmGame step={currentStep} onComplete={handleNextStep} />
          </div>
        )}

        {currentStep.type === "polaroidpuzzle" && (
          <div className="stage-panel" style={{ display: "flex", justifyContent: "center" }}>
            <PolaroidPuzzleGame step={currentStep} onComplete={handleNextStep} />
          </div>
        )}

        {currentStep.type === "memory" && (
          <MemoryGame step={currentStep} onComplete={handleNextStep} />
        )}

        {currentStep.type === "confession" && (
          <Confession step={currentStep} />
        )}

        {currentStep.type !== "envelope" && (
          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "center", zIndex: 10, position: "relative" }}>
            <button className="vintage-btn" style={{ background: "transparent", border: "1px solid rgba(236,198,149,0.3)", color: "var(--champagne)" }} onClick={handlePrevStep}>
              ← Back
            </button>
            {currentStep.type !== "quiz" && 
             currentStep.type !== "tictactoe" && 
             currentStep.type !== "memory" && 
             currentStep.type !== "timeline" && 
             currentStep.type !== "cupidcatch" && 
             currentStep.type !== "connectlove" && 
             currentStep.type !== "wordscramble" && 
             currentStep.type !== "loverhythm" && 
             currentStep.type !== "polaroidpuzzle" && 
             currentStepIndex < flowConfig.length - 1 && (
              <button className="vintage-btn" onClick={handleNextStep}>
                Skip / Next →
              </button>
            )}
          </div>
        )}
      </div>

      {currentStep.type === "confession" && (
        <footer>made with more care than code, for {currentStep.recipientName} · {currentStep.footerYear}</footer>
      )}

      {/* Dynamic Background FX Matching Current Theme */}
      <DynamicBackground theme={currentTheme} />
    </>
  );
}
