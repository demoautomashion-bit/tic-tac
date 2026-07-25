"use client";

import { useState } from "react";

export default function Envelope({ step, onComplete }) {
  const [envOpenClass, setEnvOpenClass] = useState("");

  const handleOpenEnvelope = () => {
    if (envOpenClass !== "") return;

    setEnvOpenClass("open-step1");

    setTimeout(() => {
      setEnvOpenClass("open-step1 open-step2");
    }, 900);

    setTimeout(() => {
      setEnvOpenClass("open-step1 open-step2 open-step3");
    }, 2000);

    setTimeout(() => {
      onComplete();
      setEnvOpenClass("");
    }, 2900);
  };

  return (
    <div className="stage-panel" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="envelope-wrap">
        <div className={`envelope-scene ${envOpenClass}`} id="envScene">
          <div className="env-shadow"></div>
          <button className="envelope" onClick={handleOpenEnvelope} id="envBtn" aria-label="Open the letter">
            <div className="env-body">
              <div className="paper-vintage-bg"></div>
            </div>
            <div className="env-letter paper-vintage">
              <div className="paper-vintage-bg"></div>
              <p>{step.letter}</p>
            </div>
            <div className="env-front">
              <div className="paper-vintage-bg"></div>
            </div>
            <div className="env-flap"></div>
            <div className="env-seal">
              <svg viewBox="0 0 32 29">
                <path d="M23.6 0c-3 0-5.7 1.7-7.6 4.4C14.1 1.7 11.4 0 8.4 0 3.8 0 0 3.9 0 8.8c0 8.4 8.6 13 15.4 19.6.3.3.9.3 1.2 0C23.4 21.8 32 17.2 32 8.8 32 3.9 28.2 0 23.6 0z"/>
              </svg>
            </div>
            <div className="env-label">{step.label}</div>
          </button>
        </div>
        <span className={`tap-prompt ${envOpenClass !== "" ? "gone" : ""}`} id="tapPrompt">tap to open</span>
      </div>
    </div>
  );
}
