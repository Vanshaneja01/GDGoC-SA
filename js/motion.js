/**
 * GDGconnect - Cinematic Interactive Motion Engine
 * Delivers human-crafted, silky smooth 60fps ambient particle physics,
 * tactile magnetic cursor repulsion, dynamic card spotlight reflection, and scroll reveal.
 */

(function () {
  'use strict';

  // Respect reduced motion accessibility
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  /* ==========================================================================
     1. INTERACTIVE NEURAL CONSTELLATION CANVAS
     ========================================================================== */
  class AmbientParticleCanvas {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.width = 0;
      this.height = 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.animationFrameId = null;
      this.isRunning = false;

      // Mouse interaction field
      this.mouse = {
        x: -1000,
        y: -1000,
        radius: 160,
        active: false
      };

      // Color palette: Cyan, Electric Blue, Violet, Emerald
      this.colors = [
        { r: 0, g: 243, b: 255 },    // Neon Cyan
        { r: 56, g: 189, b: 248 },   // Sky Blue
        { r: 129, g: 140, b: 248 },  // Electric Violet
        { r: 52, g: 211, b: 153 }    // Emerald
      ];

      this.init();
    }

    init() {
      this.resize();
      this.createParticles();
      this.bindEvents();
      this.start();
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.ctx.scale(this.dpr, this.dpr);
    }

    createParticles() {
      this.particles = [];
      // Adjust density for mobile vs desktop for constant 60fps
      const count = Math.min(65, Math.max(25, Math.floor(this.width / 22)));

      for (let i = 0; i < count; i++) {
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          baseRadius: Math.random() * 1.5 + 1.2,
          radius: Math.random() * 1.5 + 1.2,
          color: color,
          alpha: Math.random() * 0.5 + 0.35,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulseVal: Math.random() * Math.PI
        });
      }
    }

    bindEvents() {
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.resize();
          this.createParticles();
        }, 200);
      }, { passive: true });

      // Mouse & Touch tracking for magnetic field
      window.addEventListener('pointermove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.active = true;
      }, { passive: true });

      window.addEventListener('pointerleave', () => {
        this.mouse.active = false;
        this.mouse.x = -1000;
        this.mouse.y = -1000;
      }, { passive: true });

      // Pause when tab is inactive to preserve battery
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stop();
        } else {
          this.start();
        }
      });
    }

    start() {
      if (!this.isRunning) {
        this.isRunning = true;
        this.render();
      }
    }

    stop() {
      this.isRunning = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    }

    render() {
      if (!this.isRunning) return;

      this.ctx.clearRect(0, 0, this.width, this.height);

      const maxDist = 115;
      const mouseMaxDist = this.mouse.radius;

      // Update & Draw Particles
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off canvas boundaries smoothly
        if (p.x < 0 || p.x > this.width) p.vx *= -1;
        if (p.y < 0 || p.y > this.height) p.vy *= -1;

        // Subtle organic breathing pulse
        p.pulseVal += p.pulseSpeed;
        const currentAlpha = p.alpha + Math.sin(p.pulseVal) * 0.18;

        // Magnetic Cursor Interaction Physics
        if (this.mouse.active) {
          const dx = this.mouse.x - p.x;
          const dy = this.mouse.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouseMaxDist) {
            // Soft tactile repulsion
            const force = (1 - dist / mouseMaxDist) * 1.5;
            p.x -= (dx / dist) * force;
            p.y -= (dy / dist) * force;

            // Draw glowing filament beam to cursor
            const beamAlpha = (1 - dist / mouseMaxDist) * 0.45;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(this.mouse.x, this.mouse.y);
            this.ctx.strokeStyle = `rgba(0, 243, 255, ${beamAlpha})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
          }
        }

        // Draw particle node
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${Math.max(0.1, currentAlpha)})`;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.8)`;
        this.ctx.fill();
        this.ctx.shadowBlur = 0; // Reset for performance

        // Connect nearby particles with delicate filaments
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.22;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = `rgba(0, 243, 255, ${lineAlpha})`;
            this.ctx.lineWidth = 0.85;
            this.ctx.stroke();
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(() => this.render());
    }
  }

  /* ==========================================================================
     2. DYNAMIC 3D SPOTLIGHT & CARD TILT CONTROLLER
     ========================================================================== */
  function initCardSpotlights() {
    const cardSelectors = [
      '.comm-pillar-card',
      '.comm-track-card',
      '.comm-incentive-card',
      '.comm-role-card',
      '.comm-stat-card',
      '.comm-faq-item',
      '.comm-leaderboard-box',
      '.comm-portal-banner'
    ];

    const cards = document.querySelectorAll(cardSelectors.join(', '));

    cards.forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Set CSS variables for radial gradient spotlight
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        // Subtle 3D perspective tilt
        const tiltX = ((y / rect.height) - 0.5) * -6;
        const tiltY = ((x / rect.width) - 0.5) * 6;
        card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
      }, { passive: true });

      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--mouse-x', `-500px`);
        card.style.setProperty('--mouse-y', `-500px`);
        card.style.setProperty('--tilt-x', `0deg`);
        card.style.setProperty('--tilt-y', `0deg`);
      }, { passive: true });
    });
  }

  /* ==========================================================================
     3. SCROLL REVEAL OBSERVER
     ========================================================================== */
  function initScrollReveal() {
    const elementsToReveal = document.querySelectorAll(
      '.comm-hero-title, .comm-hero-desc, .comm-cta-group, .comm-stats-grid, ' +
      '.comm-section-header, .comm-pillars-grid, .comm-tracks-grid, ' +
      '.comm-incentives-grid, .comm-leaderboard-box, .comm-leadership-box, ' +
      '.comm-faq-container, .comm-portal-banner'
    );

    if (!('IntersectionObserver' in window)) {
      elementsToReveal.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    elementsToReveal.forEach(el => {
      el.classList.add('reveal-on-scroll');
      observer.observe(el);
    });
  }

  /* ==========================================================================
     INITIALIZATION ON DOM READY
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize ambient canvas
    new AmbientParticleCanvas('ambient-particle-canvas');

    // 2. Initialize spotlight & card tilt
    initCardSpotlights();

    // 3. Initialize scroll reveal
    initScrollReveal();
  });
})();
