'use client';

import React, { useState, useEffect, useRef } from 'react';

const THEMES = [
  {
    id: 'burgundy',
    name: 'Velvet Burgundy',
    icon: '🌹',
    accent1: '#150005',
    accent2: '#E68FA3',
    accent3: '#ECC695',
  },
  {
    id: 'amethyst',
    name: 'Midnight Amethyst',
    icon: '🔮',
    accent1: '#0F081D',
    accent2: '#EAA5AD',
    accent3: '#CBB2FE',
  },
  {
    id: 'emerald',
    name: 'Emerald Enchantment',
    icon: '🌿',
    accent1: '#071610',
    accent2: '#A8C5B5',
    accent3: '#E5C07B',
  },
  {
    id: 'sapphire',
    name: 'Sapphire Stars',
    icon: '💎',
    accent1: '#060F1E',
    accent2: '#92C5F9',
    accent3: '#EAD5B2',
  },
  {
    id: 'obsidian',
    name: 'Midnight Obsidian',
    icon: '⚡',
    accent1: '#0C0C0E',
    accent2: '#F04464',
    accent3: '#F7B731',
  },
  {
    id: 'sunset',
    name: 'Sunset Dusk',
    icon: '🌅',
    accent1: '#1A0C13',
    accent2: '#F7A8B8',
    accent3: '#F4B982',
  },
];

export default function ThemeSelector({ currentTheme, onSelectTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <div ref={menuRef} className="fixed top-5 right-5 z-50">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Theme"
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/90 shadow-lg hover:border-white/30 hover:scale-105 transition-all cursor-pointer text-xs font-medium"
      >
        <span className="text-sm">{activeThemeObj.icon}</span>
        <span className="hidden sm:inline-block tracking-wide">{activeThemeObj.name}</span>
        <span className="w-2.5 h-2.5 rounded-full border border-white/30" style={{ background: activeThemeObj.accent2 }} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#120813]/90 backdrop-blur-xl border border-white/15 shadow-2xl p-2.5 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40 px-2 py-1.5">
            Select Color Palette
          </div>

          <div className="flex flex-col gap-1 mt-1">
            {THEMES.map((theme) => {
              const isSelected = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    onSelectTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-white/15 text-white font-semibold border border-white/20'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{theme.icon}</span>
                    <span>{theme.name}</span>
                  </div>

                  {/* Swatch dots */}
                  <div className="flex items-center -space-x-1">
                    <div className="w-3 h-3 rounded-full border border-black/40" style={{ background: theme.accent1 }} />
                    <div className="w-3 h-3 rounded-full border border-black/40" style={{ background: theme.accent2 }} />
                    <div className="w-3 h-3 rounded-full border border-black/40" style={{ background: theme.accent3 }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
