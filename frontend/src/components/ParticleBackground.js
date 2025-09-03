import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';

const CanvasContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const animationRef = useRef();
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Set canvas size
    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
    };

    setCanvasSize();

    // Particle class
    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * height;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = -10;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = Math.random() * 2 + 1;
        this.size = Math.random() * 3 + 1;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.hue = Math.random() * 60 + 160; // Teal-cyan range
        this.saturation = Math.random() * 30 + 70;
        this.lightness = Math.random() * 40 + 30;
        this.twinkle = Math.random() * Math.PI * 2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
      }

      update() {
        // Mouse interaction
        const dx = this.x - mouseRef.current.x;
        const dy = this.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          this.vx += (dx / distance) * force * 0.01;
          this.vy += (dy / distance) * force * 0.01;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.twinkle += this.twinkleSpeed;

        // Damping
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Wrap around edges
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
        if (this.y > height + 10) this.reset();

        // Gravity
        this.vy += 0.001;
      }

      draw(ctx) {
        const twinkleOpacity = this.opacity * (0.5 + 0.5 * Math.sin(this.twinkle));
        
        // Main particle
        ctx.save();
        ctx.globalAlpha = twinkleOpacity;
        
        // Create radial gradient for glow effect
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 3
        );
        
        gradient.addColorStop(0, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness + 20}%, ${twinkleOpacity})`);
        gradient.addColorStop(0.4, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${twinkleOpacity * 0.8})`);
        gradient.addColorStop(1, `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner bright core
        ctx.globalAlpha = twinkleOpacity * 1.5;
        ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, ${Math.min(this.lightness + 40, 90)}%, ${twinkleOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }

    // Initialize particles
    const particleCount = Math.min(100, Math.floor((width * height) / 15000));
    particlesRef.current = [];
    
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(new Particle());
    }

    // Mouse move handler
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    // Resize handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      setCanvasSize();
      
      // Recreate particles for new dimensions
      const newParticleCount = Math.min(100, Math.floor((width * height) / 15000));
      while (particlesRef.current.length < newParticleCount) {
        particlesRef.current.push(new Particle());
      }
      while (particlesRef.current.length > newParticleCount) {
        particlesRef.current.pop();
      }
    };

    // Animation loop
    const animate = () => {
      // Clear canvas with gradient background
      ctx.clearRect(0, 0, width, height);
      
      // Create background gradient
      const bgGradient = ctx.createRadialGradient(
        width * 0.5, height * 0.3, 0,
        width * 0.5, height * 0.3, Math.max(width, height)
      );
      
      // Use theme colors for background
      const primaryColor = theme?.colors?.primary || '#0d9488';
      const secondaryColor = theme?.colors?.secondary || '#6366f1';
      const accentColor = theme?.colors?.accent || '#ec4899';
      
      bgGradient.addColorStop(0, `${primaryColor}08`);
      bgGradient.addColorStop(0.4, `${secondaryColor}04`);
      bgGradient.addColorStop(0.8, `${accentColor}02`);
      bgGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });

      // Draw connections between nearby particles
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1;
      
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const dx = particlesRef.current[i].x - particlesRef.current[j].x;
          const dy = particlesRef.current[i].y - particlesRef.current[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            const opacity = (120 - distance) / 120;
            ctx.globalAlpha = opacity * 0.15;
            ctx.beginPath();
            ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
            ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <CanvasContainer>
      <Canvas ref={canvasRef} />
    </CanvasContainer>
  );
};

export default ParticleBackground; 