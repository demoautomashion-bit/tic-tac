'use client';

import React, { useEffect, useRef } from 'react';

export default function DynamicBackground({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    let particles = [];
    const count = 45;

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.6,
          speedY: (Math.random() - 0.5) * 0.6 - (theme === 'burgundy' ? 0.3 : 0),
          alpha: Math.random() * 0.6 + 0.2,
          pulseSpeed: Math.random() * 0.02 + 0.005,
          angle: Math.random() * Math.PI * 2,
        });
      }
    };

    createParticles();

    const getColors = () => {
      switch (theme) {
        case 'amethyst':
          return { primary: 'rgba(181, 126, 220, ', secondary: 'rgba(226, 232, 240, ' };
        case 'emerald':
          return { primary: 'rgba(212, 175, 55, ', secondary: 'rgba(168, 197, 181, ' };
        case 'sapphire':
          return { primary: 'rgba(56, 189, 248, ', secondary: 'rgba(241, 245, 249, ' };
        case 'luxury-gold':
          return { primary: 'rgba(245, 158, 11, ', secondary: 'rgba(254, 243, 199, ' };
        case 'blossom-light':
          return { primary: 'rgba(225, 29, 72, ', secondary: 'rgba(190, 18, 60, ' };
        case 'burgundy':
        default:
          return { primary: 'rgba(230, 143, 163, ', secondary: 'rgba(236, 198, 149, ' };
      }
    };

    const drawHeart = (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-size / 2, -size / 2, -size, size / 3, 0, size);
      ctx.bezierCurveTo(size, size / 3, size / 2, -size / 2, 0, 0);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    const drawStar = (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(Math.cos((i * Math.PI) / 2) * size * 2, Math.sin((i * Math.PI) / 2) * size * 2);
        ctx.lineTo(Math.cos((i * Math.PI) / 2 + Math.PI / 4) * (size * 0.4), Math.sin((i * Math.PI) / 2 + Math.PI / 4) * (size * 0.4));
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    const drawDiamond = (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.moveTo(0, -size * 1.5);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size * 1.5);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const colors = getColors();

      particles.forEach((p, idx) => {
        p.alpha += Math.sin(p.angle) * p.pulseSpeed;
        p.angle += p.pulseSpeed;
        const currentAlpha = Math.max(0.1, Math.min(0.85, p.alpha));

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        const colorStr = `${idx % 2 === 0 ? colors.primary : colors.secondary}${currentAlpha})`;

        if (theme === 'burgundy') {
          drawHeart(ctx, p.x, p.y, p.size * 2.2, colorStr);
        } else if (theme === 'amethyst' || theme === 'sapphire') {
          drawStar(ctx, p.x, p.y, p.size * 1.4, colorStr);
        } else if (theme === 'luxury-gold') {
          drawDiamond(ctx, p.x, p.y, p.size * 1.5, colorStr);
        } else if (theme === 'emerald') {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = colorStr;
          ctx.shadowBlur = 12;
          ctx.shadowColor = colorStr;
          ctx.fill();
          ctx.restore();
        } else {
          // Blossom light
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = colorStr;
          ctx.fill();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      <div className="glow-blob blob-1" />
      <div className="glow-blob blob-2" />
      <div className="glow-blob blob-3" />
      
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
