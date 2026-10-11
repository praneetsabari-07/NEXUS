import React, { useEffect, useRef } from 'react';

interface StarFieldCanvasProps {
  starCount?: number;
  maxHeightRatio?: number;
}

export const StarFieldCanvas: React.FC<StarFieldCanvasProps> = ({
  starCount = 70,
  maxHeightRatio = 0.6,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const stars: Array<{
      x: number;
      y: number;
      radius: number;
      alpha: number;
      speed: number;
      phase: number;
    }> = [];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height * maxHeightRatio),
        radius: Math.random() * 0.95 + 0.35,
        alpha: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.008 + 0.003,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.phase += s.speed;
        const currentAlpha = 0.2 + (Math.sin(s.phase) * 0.5 + 0.5) * s.alpha;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 240, 255, ${currentAlpha})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(180, 230, 255, 0.8)';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [starCount, maxHeightRatio]);

  return (
    <canvas
      ref={canvasRef}
      id="star-field"
      className="fixed inset-0 pointer-events-none z-[1] w-full h-full"
    />
  );
};
