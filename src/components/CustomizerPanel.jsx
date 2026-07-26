"use client";

import React from "react";

export default function CustomizerPanel({
  isCustomizerOpen,
  setIsCustomizerOpen,
  flowConfig,
  editingStepIndex,
  setEditingStepIndex,
  copiedLink,
  generateSharingLink,
  handleResetToDefault,
  handleMoveUp,
  handleMoveDown,
  handleDeleteStep,
  handleAddStep,
  handleUpdateStepProperty,
  handleSaveToLocalStorage,
  currentTheme = 'burgundy',
  onSelectTheme = () => {}
}) {
  const THEME_OPTIONS = [
    { id: 'burgundy', name: 'Velvet Burgundy', icon: '🍷', accent: '#E68FA3', bg: '#150005' },
    { id: 'amethyst', name: 'Midnight Amethyst', icon: '🔮', accent: '#B57EDC', bg: '#0F081D' },
    { id: 'emerald', name: 'Emerald Enchantment', icon: '🌿', accent: '#D4AF37', bg: '#051C14' },
    { id: 'sapphire', name: 'Sapphire Ocean', icon: '💎', accent: '#38BDF8', bg: '#040D1A' },
    { id: 'luxury-gold', name: 'Slate & Honey Gold', icon: '✨', accent: '#F59E0B', bg: '#121316' },
    { id: 'blossom-light', name: 'Pastel Blossom', icon: '🌸', accent: '#E11D48', bg: '#FAF4F5' },
  ];

  return (
    <div className={`customizer-panel ${isCustomizerOpen ? "open" : ""}`}>
      <div className="customizer-header">
        <h2>Card Customizer</h2>
        <button className="close-btn" onClick={() => setIsCustomizerOpen(false)}>×</button>
      </div>

      <div className="customizer-content">
        {/* Theme & Atmosphere Customizer Section */}
        <div className="customizer-section" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🎨 Theme & Visual Atmosphere</h3>
          <p style={{ fontSize: "0.78rem", opacity: 0.7, marginBottom: "0.85rem" }}>
            Choose a visual theme for the card and games:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {THEME_OPTIONS.map((t) => {
              const active = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTheme(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    background: active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                    border: active ? `1.5px solid ${t.accent}` : '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{t.icon}</span>
                    <span style={{ fontWeight: active ? '600' : 'normal' }}>{t.name}</span>
                  </span>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: t.accent,
                      border: '1px solid rgba(0,0,0,0.3)',
                      flexShrink: 0
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="customizer-section">
          <h3>Manage Flow & Steps</h3>
          <p style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "1rem" }}>
            Arrange the sequence of mini-games and quizzes below:
          </p>
          {flowConfig.map((step, idx) => (
            <div className="game-list-item" key={step.id}>
              <div className="game-list-item-header">
                <span className="game-title-badge">
                  {idx + 1}. {step.type} {step.title ? `(${step.title})` : ""}
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
                      value={step.eyebrow || ""} 
                      onChange={(e) => handleUpdateStepProperty(idx, "eyebrow", e.target.value)} 
                    />
                  </div>
                  {step.type !== "envelope" && (
                    <div className="custom-input-group">
                      <label>Title</label>
                      <input 
                        type="text" 
                        value={step.title || ""} 
                        onChange={(e) => handleUpdateStepProperty(idx, "title", e.target.value)} 
                      />
                    </div>
                  )}

                  {/* Step-specific configurations */}
                  {step.type === "envelope" && (
                    <>
                      <div className="custom-input-group">
                        <label>Envelope Label (To:)</label>
                        <input 
                          type="text" 
                          value={step.label || ""} 
                          onChange={(e) => handleUpdateStepProperty(idx, "label", e.target.value)} 
                        />
                      </div>
                      <div className="custom-input-group">
                        <label>Inside Letter Sneak-peek</label>
                        <input 
                          type="text" 
                          value={step.letter || ""} 
                          onChange={(e) => handleUpdateStepProperty(idx, "letter", e.target.value)} 
                        />
                      </div>
                    </>
                  )}

                  {step.type === "quiz" && (
                    <>
                      <div className="custom-input-group">
                        <label>Question</label>
                        <textarea 
                          rows="2"
                          value={step.question || ""} 
                          onChange={(e) => handleUpdateStepProperty(idx, "question", e.target.value)} 
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
                              onChange={() => handleUpdateStepProperty(idx, "correctIndex", oIdx)}
                            />
                            <input 
                              type="text" 
                              value={opt} 
                              onChange={(e) => {
                                const nextOpts = [...step.options];
                                nextOpts[oIdx] = e.target.value;
                                handleUpdateStepProperty(idx, "options", nextOpts);
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
                            handleUpdateStepProperty(idx, "options", nextOpts);
                          }}
                        >
                          + Add Option
                        </button>
                      </div>
                      <div className="custom-input-group">
                        <label>Success Text</label>
                        <input 
                          type="text" 
                          value={step.successText || ""} 
                          onChange={(e) => handleUpdateStepProperty(idx, "successText", e.target.value)} 
                        />
                      </div>
                    </>
                  )}

                  {step.type === "timeline" && (
                    <>
                      <div className="custom-input-group">
                        <label>Intro Paragraphs</label>
                        <textarea 
                          rows="3"
                          value={step.intro || ""} 
                          onChange={(e) => handleUpdateStepProperty(idx, "intro", e.target.value)} 
                        />
                      </div>
                      <div className="custom-input-group">
                        <label>Signoff Name</label>
                        <input 
                          type="text" 
                          value={step.signoff || ""} 
                          onChange={(e) => handleUpdateStepProperty(idx, "signoff", e.target.value)} 
                        />
                      </div>
                      <div className="custom-input-group">
                        <label>Milestones</label>
                        {(step.milestones || []).map((ms, mIdx) => (
                          <div key={mIdx} style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "0.5rem", borderRadius: "4px", marginBottom: "0.5rem" }}>
                            <input 
                              type="text" 
                              placeholder="Milestone Title"
                              value={ms.title} 
                              style={{ marginBottom: "0.25rem" }}
                              onChange={(e) => {
                                const nextMs = [...step.milestones];
                                nextMs[mIdx] = { ...nextMs[mIdx], title: e.target.value };
                                handleUpdateStepProperty(idx, "milestones", nextMs);
                              }}
                            />
                            <input 
                              type="text" 
                              placeholder="Date/Year"
                              value={ms.date}
                              style={{ marginBottom: "0.25rem" }}
                              onChange={(e) => {
                                const nextMs = [...step.milestones];
                                nextMs[mIdx] = { ...nextMs[mIdx], date: e.target.value };
                                handleUpdateStepProperty(idx, "milestones", nextMs);
                              }}
                            />
                            <textarea 
                              placeholder="Body text"
                              value={ms.body}
                              rows="2"
                              onChange={(e) => {
                                const nextMs = [...step.milestones];
                                nextMs[mIdx] = { ...nextMs[mIdx], body: e.target.value };
                                handleUpdateStepProperty(idx, "milestones", nextMs);
                              }}
                            />
                            <button 
                              className="game-ctrl-btn" 
                              style={{ marginTop: "0.25rem", width: "auto", padding: "0 0.5rem" }}
                              onClick={() => {
                                const nextMs = step.milestones.filter((_, i) => i !== mIdx);
                                handleUpdateStepProperty(idx, "milestones", nextMs);
                              }}
                            >
                              Delete Milestone
                            </button>
                          </div>
                        ))}
                        <button 
                          className="editor-btn-secondary"
                          onClick={() => {
                            const nextMs = [...(step.milestones || []), { title: "New Event", date: "Date", body: "Description" }];
                            handleUpdateStepProperty(idx, "milestones", nextMs);
                          }}
                        >
                          + Add Milestone
                        </button>
                      </div>
                    </>
                  )}

                  {step.type === "tictactoe" && (
                    <div className="custom-input-group">
                      <label>Instruction Text</label>
                      <input 
                        type="text" 
                        value={step.instruction || ""} 
                        onChange={(e) => handleUpdateStepProperty(idx, "instruction", e.target.value)} 
                      />
                    </div>
                  )}

                  {step.type === "memory" && (
                    <>
                      <div className="custom-input-group">
                        <label>Instruction Text</label>
                        <input 
                          type="text" 
                          value={step.instruction || ""} 
                          onChange={(e) => handleUpdateStepProperty(idx, "instruction", e.target.value)} 
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
                                handleUpdateStepProperty(idx, "symbols", nextSyms);
                              }}
                            />
                            <button 
                              className="game-ctrl-btn" 
                              disabled={(step.symbols || []).length <= 2}
                              onClick={() => {
                                const nextSyms = step.symbols.filter((_, s) => s !== sIdx);
                                handleUpdateStepProperty(idx, "symbols", nextSyms);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button 
                          className="editor-btn-secondary"
                          onClick={() => {
                            const nextSyms = [...(step.symbols || []), "❓"];
                            handleUpdateStepProperty(idx, "symbols", nextSyms);
                          }}
                        >
                          + Add Card Pair
                        </button>
                      </div>
                    </>
                  )}

                  {step.type === "cupidcatch" && (
                    <>
                      <div className="custom-input-group">
                        <label>Instruction Text</label>
                        <input 
                          type="text" 
                          value={step.instruction || ""} 
                          onChange={(e) => handleUpdateStepProperty(idx, "instruction", e.target.value)} 
                        />
                      </div>
                      <div className="custom-input-group">
                        <label>Target Score</label>
                        <input 
                          type="number" 
                          value={step.targetScore || 10} 
                          onChange={(e) => handleUpdateStepProperty(idx, "targetScore", parseInt(e.target.value) || 10)} 
                        />
                      </div>
                    </>
                  )}

                  {step.type === "connectlove" && (
                    <div className="custom-input-group">
                      <label>Instruction Text</label>
                      <input 
                        type="text" 
                        value={step.instruction || ""} 
                        onChange={(e) => handleUpdateStepProperty(idx, "instruction", e.target.value)} 
                      />
                    </div>
                  )}

                  {step.type === "wordscramble" && (
                    <>
                      <div className="custom-input-group">
                        <label>Instruction Text</label>
                        <input 
                          type="text" 
                          value={step.instruction || ""} 
                          onChange={(e) => handleUpdateStepProperty(idx, "instruction", e.target.value)} 
                        />
                      </div>
                      <div className="custom-input-group">
                        <label>Target Word</label>
                        <input 
                          type="text" 
                          value={step.targetWord || "FOREVER"} 
                          onChange={(e) => handleUpdateStepProperty(idx, "targetWord", e.target.value.toUpperCase())} 
                        />
                      </div>
                    </>
                  )}

                  {step.type === "loverhythm" && (
                    <>
                      <div className="custom-input-group">
                        <label>Instruction Text</label>
                        <input 
                          type="text" 
                          value={step.instruction || ""} 
                          onChange={(e) => handleUpdateStepProperty(idx, "instruction", e.target.value)} 
                        />
                      </div>
                      <div className="custom-input-group">
                        <label>Target Hits</label>
                        <input 
                          type="number" 
                          value={step.targetHits || 5} 
                          onChange={(e) => handleUpdateStepProperty(idx, "targetHits", parseInt(e.target.value) || 5)} 
                        />
                      </div>
                    </>
                  )}

                  {step.type === "polaroidpuzzle" && (
                    <>
                      <div className="custom-input-group">
                        <label>Instruction Text</label>
                        <input 
                          type="text" 
                          value={step.instruction || ""} 
                          onChange={(e) => handleUpdateStepProperty(idx, "instruction", e.target.value)} 
                        />
                      </div>
                      <div className="custom-input-group">
                        <label>Puzzle Image (URL or Upload)</label>
                        <input 
                          type="text" 
                          value={step.imageUrl || ""} 
                          placeholder="Image URL or upload below..."
                          onChange={(e) => handleUpdateStepProperty(idx, "imageUrl", e.target.value)} 
                        />
                        <div style={{ marginTop: "0.35rem" }}>
                          <input 
                            type="file" 
                            accept="image/*" 
                            id={`file-puzzle-${idx}`}
                            style={{ display: "none" }}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  handleUpdateStepProperty(idx, "imageUrl", ev.target.result);
                                };
                                reader.readAsDataURL(e.target.files[0]);
                              }
                            }}
                          />
                          <label htmlFor={`file-puzzle-${idx}`} className="editor-btn-secondary" style={{ marginTop: 0, cursor: "pointer", display: "block" }}>
                            📷 Upload Photo from Device
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {step.type === "confession" && (
                    <>
                      <div className="custom-input-group">
                        <label>Recipient Name</label>
                        <input 
                          type="text" 
                          value={step.recipientName || ""} 
                          onChange={(e) => handleUpdateStepProperty(idx, "recipientName", e.target.value)} 
                        />
                      </div>
                      <div className="custom-input-group">
                        <label>Closing Signature</label>
                        <input 
                          type="text" 
                          value={step.closingSig || ""} 
                          onChange={(e) => handleUpdateStepProperty(idx, "closingSig", e.target.value)} 
                        />
                      </div>
                      <div className="custom-input-group">
                        <label>Closing Love Note</label>
                        <textarea 
                          rows="3"
                          value={step.closingLetter || ""} 
                          onChange={(e) => handleUpdateStepProperty(idx, "closingLetter", e.target.value)} 
                        />
                      </div>
                      <div className="custom-input-group">
                        <label>Confession Reasons (one per line)</label>
                        <textarea 
                          rows="5"
                          value={(step.reasons || []).join("\n")} 
                          onChange={(e) => {
                            const nextReasons = e.target.value.split("\n").filter(Boolean);
                            handleUpdateStepProperty(idx, "reasons", nextReasons);
                          }} 
                        />
                      </div>
                      <div className="custom-input-group">
                        <label>Snapshots (Polaroids)</label>
                        {(step.polaroids || []).map((pol, pIdx) => (
                          <div key={pIdx} style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "0.5rem", borderRadius: "4px", marginBottom: "0.5rem" }}>
                            <input 
                              type="text" 
                              placeholder="Image URL or upload below..."
                              value={pol.url || ""} 
                              style={{ marginBottom: "0.25rem" }}
                              onChange={(e) => {
                                const nextPols = [...step.polaroids];
                                nextPols[pIdx] = { ...nextPols[pIdx], url: e.target.value };
                                handleUpdateStepProperty(idx, "polaroids", nextPols);
                              }}
                            />
                            <div style={{ marginBottom: "0.35rem" }}>
                              <input 
                                type="file" 
                                accept="image/*" 
                                id={`file-pol-${idx}-${pIdx}`}
                                style={{ display: "none" }}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      const nextPols = [...step.polaroids];
                                      nextPols[pIdx] = { ...nextPols[pIdx], url: ev.target.result };
                                      handleUpdateStepProperty(idx, "polaroids", nextPols);
                                    };
                                    reader.readAsDataURL(e.target.files[0]);
                                  }
                                }}
                              />
                              <label htmlFor={`file-pol-${idx}-${pIdx}`} className="editor-btn-secondary" style={{ marginTop: 0, cursor: "pointer", display: "block", fontSize: "0.75rem" }}>
                                📷 Choose Photo from Device
                              </label>
                            </div>
                            <input 
                              type="text" 
                              placeholder="Caption"
                              value={pol.cap || ""}
                              style={{ marginBottom: "0.25rem" }}
                              onChange={(e) => {
                                const nextPols = [...step.polaroids];
                                nextPols[pIdx] = { ...nextPols[pIdx], cap: e.target.value };
                                handleUpdateStepProperty(idx, "polaroids", nextPols);
                              }}
                            />
                            <button 
                              className="game-ctrl-btn" 
                              style={{ marginTop: "0.25rem", width: "auto", padding: "0 0.5rem" }}
                              onClick={() => {
                                const nextPols = step.polaroids.filter((_, p) => p !== pIdx);
                                handleUpdateStepProperty(idx, "polaroids", nextPols);
                              }}
                            >
                              Delete Polaroid
                            </button>
                          </div>
                        ))}
                        <button 
                          className="editor-btn-secondary"
                          onClick={() => {
                            const nextPols = [...(step.polaroids || []), { url: "", cap: "New memory", rot: Math.random() * 8 - 4 }];
                            handleUpdateStepProperty(idx, "polaroids", nextPols);
                          }}
                        >
                          + Add Polaroid
                        </button>
                      </div>
                      <div className="custom-input-group">
                        <label>Footer Year</label>
                        <input 
                          type="text" 
                          value={step.footerYear || ""} 
                          onChange={(e) => handleUpdateStepProperty(idx, "footerYear", e.target.value)} 
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <button className="editor-btn-secondary" style={{ marginTop: 0 }} onClick={() => handleAddStep("quiz")}>+ Quiz</button>
            <button className="editor-btn-secondary" style={{ marginTop: 0 }} onClick={() => handleAddStep("timeline")}>+ Timeline</button>
            <button className="editor-btn-secondary" style={{ marginTop: 0 }} onClick={() => handleAddStep("tictactoe")}>+ TicTacToe</button>
            <button className="editor-btn-secondary" style={{ marginTop: 0 }} onClick={() => handleAddStep("memory")}>+ Memory</button>
            <button className="editor-btn-secondary" style={{ marginTop: 0 }} onClick={() => handleAddStep("cupidcatch")}>+ Cupid's Catch</button>
            <button className="editor-btn-secondary" style={{ marginTop: 0 }} onClick={() => handleAddStep("connectlove")}>+ Connect Love</button>
            <button className="editor-btn-secondary" style={{ marginTop: 0 }} onClick={() => handleAddStep("wordscramble")}>+ Scramble</button>
            <button className="editor-btn-secondary" style={{ marginTop: 0 }} onClick={() => handleAddStep("loverhythm")}>+ Rhythm</button>
            <button className="editor-btn-secondary" style={{ marginTop: 0 }} onClick={() => handleAddStep("polaroidpuzzle")}>+ Jigsaw</button>
          </div>
          <button className="editor-btn-secondary" onClick={() => handleAddStep("confession")}>+ Final Confession</button>
        </div>
      </div>

      <div className="customizer-footer">
        <button className="editor-btn-primary" onClick={generateSharingLink}>
          {copiedLink ? "✓ Copied Link!" : "Copy Shareable Link"}
        </button>
        <button className="editor-btn-secondary" style={{ borderStyle: "solid", marginTop: 0 }} onClick={handleResetToDefault}>
          Reset to Default Flow
        </button>
      </div>
    </div>
  );
}
