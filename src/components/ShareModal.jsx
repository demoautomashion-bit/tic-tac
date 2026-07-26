"use client";

import React from "react";

export default function ShareModal({ isOpen, onClose, shareUrl, copiedLink, onCopy, isGenerating }) {
  if (!isOpen) return null;

  const isShortLink = shareUrl.includes("?c=");

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{
        background: "var(--card-bg, #1a0b16)",
        border: "1px solid var(--accent-gold, #eec695)",
        borderRadius: "16px",
        padding: "1.75rem",
        maxWidth: "480px",
        width: "100%",
        boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
        color: "#fff",
        position: "relative"
      }}>
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1.25rem",
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "1.5rem",
            cursor: "pointer",
            opacity: 0.7
          }}
        >
          ×
        </button>

        <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", marginBottom: "0.5rem", color: "var(--champagne, #fcead2)" }}>
          💌 Share Your Customized Card
        </h3>
        <p style={{ fontSize: "0.85rem", opacity: 0.8, lineHeight: 1.5, marginBottom: "1.25rem" }}>
          Anyone opening this link will see your custom slides, questions, photos, and visual theme.
        </p>

        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
            <label style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", opacity: "0.7" }}>
              Shareable Web Link
            </label>
            <span style={{ fontSize: "0.7rem", color: isGenerating ? "#FBBF24" : isShortLink ? "#34D399" : "#6EE7B7", opacity: 0.9 }}>
              {isGenerating ? "⏳ Generating short link..." : isShortLink ? "⚡ Ultra-Short Cloud Link" : "✓ Ready to share"}
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input 
              type="text" 
              readOnly 
              value={isGenerating ? "Creating permanent cloud short link..." : shareUrl}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: "8px",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: "0.8rem",
                fontFamily: "monospace"
              }}
            />
            <button 
              onClick={onCopy}
              disabled={isGenerating}
              className="editor-btn-primary"
              style={{ padding: "0 1rem", fontSize: "0.85rem", whiteSpace: "nowrap", width: "auto" }}
            >
              {copiedLink ? "✓ Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "1.5rem" }}>
          <a 
            href={shareUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="editor-btn-secondary"
            style={{ 
              textDecoration: "none", 
              textAlign: "center", 
              display: "block",
              width: "100%",
              marginTop: 0,
              padding: "10px"
            }}
          >
            👁️ Preview Recipient View
          </a>
        </div>
      </div>
    </div>
  );
}
