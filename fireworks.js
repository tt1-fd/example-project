// Fireworks animation for the entry page.
// Respects prefers-reduced-motion: shows a static celebration instead.
(function () {
  const canvas = document.getElementById('fireworks');
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  if (reduceMotion) {
    // Static celebratory burst of confetti dots, no motion.
    const colors = ['#ff5252', '#ffeb3b', '#4caf50', '#2196f3', '#e040fb', '#ff9800'];
    for (let i = 0; i < 120; i++) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H, 2 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  // Particle system
  const rockets = [];
  const particles = [];
  const colors = ['#ff5252', '#ffeb3b', '#4caf50', '#2196f3', '#e040fb', '#ff9800', '#00bcd4', '#ffffff'];

  function rand(min, max) { return min + Math.random() * (max - min); }

  function launch() {
    const x = rand(W * 0.15, W * 0.85);
    rockets.push({
      x: x,
      y: H,
      vx: rand(-1.2, 1.2),
      vy: rand(-11, -14),
      color: colors[Math.floor(Math.random() * colors.length)],
      trail: [],
      exploded: false,
    });
  }

  function explode(r) {
    const count = 60 + Math.floor(Math.random() * 40);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + rand(-0.15, 0.15);
      const speed = rand(1.5, 5.5);
      particles.push({
        x: r.x,
        y: r.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: r.color,
        life: 1,
        decay: rand(0.012, 0.022),
        size: rand(1.5, 3),
        gravity: 0.06,
      });
    }
  }

  // Launch schedule: burst for ~7 seconds, then fade out.
  const startTime = performance.now();
  const duration = 7000;
  let lastLaunch = 0;
  let fading = false;
  let fadeStart = 0;
  const fadeDuration = 1200;

  function frame(now) {
    // clear with slight trail
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    const elapsed = now - startTime;

    // Launch rockets periodically during the burst window.
    if (elapsed < duration && now - lastLaunch > rand(250, 500)) {
      launch();
      lastLaunch = now;
    }

    // Update rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 8) r.trail.shift();
      r.x += r.vx;
      r.y += r.vy;
      r.vy += 0.18; // gravity on rocket
      // draw trail
      for (let t = 0; t < r.trail.length; t++) {
        const p = r.trail[t];
        ctx.globalAlpha = (t + 1) / r.trail.length * 0.6;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // rocket head
      ctx.fillStyle = r.color;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      if (r.vy >= 0) { // apex reached
        explode(r);
        rockets.splice(i, 1);
      }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.985;
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Fade out after duration.
    if (elapsed >= duration && !fading) {
      fading = true;
      fadeStart = now;
    }
    if (fading) {
      const f = Math.min((now - fadeStart) / fadeDuration, 1);
      // overlay fade to transparent by reducing global alpha on a full clear
      // We fade the whole canvas by drawing a semi-transparent black? Instead fade canvas opacity.
      canvas.style.opacity = String(1 - f);
      if (f >= 1) {
        canvas.style.display = 'none';
        return; // stop loop
      }
    }

    requestAnimationFrame(frame);
  }

  // Start with a clear black-ish backdrop (canvas is transparent; body bg shows).
  ctx.clearRect(0, 0, W, H);
  requestAnimationFrame(frame);
})();
