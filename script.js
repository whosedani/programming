/* ============================================
   EVERYTHING IS PROGRAMMING — script.js
   ============================================ */

(function () {
  'use strict';

  /* ---- CONFIG ---- */
  const CONFIG = { ca: '', twitter: '', community: '', buy: '' };

  async function loadConfig() {
    try {
      const res = await fetch('/api/config');
      const cfg = await res.json();
      if (cfg.ca) CONFIG.ca = cfg.ca;
      if (cfg.twitter) CONFIG.twitter = cfg.twitter;
      if (cfg.community) CONFIG.community = cfg.community;
      if (cfg.buy) CONFIG.buy = cfg.buy;
      applyConfig();
    } catch (e) { /* silent */ }
  }

  function applyConfig() {
    const caEl = document.getElementById('caDisplay');
    const buyBtn = document.getElementById('buyBtn');

    if (CONFIG.ca && caEl) {
      caEl.textContent = CONFIG.ca.length > 12
        ? CONFIG.ca.slice(0, 6) + '...' + CONFIG.ca.slice(-4)
        : CONFIG.ca;
    }
    if (CONFIG.buy && buyBtn) buyBtn.href = CONFIG.buy;
  }

  /* ---- CA COPY ---- */
  function initCopy() {
    const btn = document.getElementById('caCopyBtn');
    const toast = document.getElementById('toast');
    if (!btn || !toast) return;

    btn.addEventListener('click', async () => {
      if (!CONFIG.ca) return;
      try {
        await navigator.clipboard.writeText(CONFIG.ca);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = CONFIG.ca;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    });
  }

  /* ---- GUTTER LINE NUMBERS ---- */
  function initGutter() {
    const gutterInner = document.getElementById('gutterInner');
    const content = document.getElementById('content');
    if (!gutterInner || !content) return;

    const lines = content.querySelectorAll('.code-line');
    const totalLines = lines.length;

    let html = '';
    for (let i = 1; i <= totalLines; i++) {
      html += '<div class="gutter-num">' + i + '</div>';
    }
    gutterInner.innerHTML = html;

    const gutterNums = gutterInner.querySelectorAll('.gutter-num');
    let lastActive = -1;
    let ticking = false;

    function updateGutter() {
      const scrollTop = window.scrollY;
      const tabBarH = 36;

      /* Sync gutter scroll with page */
      gutterInner.style.transform = 'translateY(' + (tabBarH - scrollTop) + 'px)';

      /* Highlight current line */
      const viewCenter = scrollTop + window.innerHeight / 2;
      let closestIdx = 0;
      let closestDist = Infinity;

      for (let i = 0; i < lines.length; i++) {
        const rect = lines[i].getBoundingClientRect();
        const lineCenter = rect.top + scrollTop + rect.height / 2;
        const dist = Math.abs(lineCenter - viewCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      }

      if (closestIdx !== lastActive) {
        if (lastActive >= 0 && gutterNums[lastActive]) {
          gutterNums[lastActive].classList.remove('active');
        }
        gutterNums[closestIdx].classList.add('active');
        lastActive = closestIdx;

        /* Update status bar */
        const lnEl = document.getElementById('statusLn');
        if (lnEl) lnEl.textContent = 'Ln ' + (closestIdx + 1) + ', Col 1';
      }

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateGutter);
        ticking = true;
      }
    }, { passive: true });

    updateGutter();
  }

  /* ---- HERO TYPEWRITER ---- */
  function initHero() {
    const heroLines = document.querySelectorAll('.hero-line');
    heroLines.forEach((line, i) => {
      setTimeout(() => line.classList.add('visible'), 80 * i);
    });
  }

  /* ---- SCROLL REVEAL (Sections 1, 3, 4) ---- */
  function initScrollReveal() {
    const elements = document.querySelectorAll('.scroll-reveal, .slide-in');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          /* Stagger siblings */
          const parent = entry.target.parentElement;
          const siblings = parent.querySelectorAll('.scroll-reveal, .slide-in');
          let idx = 0;
          siblings.forEach((sib) => {
            if (sib === entry.target) {
              setTimeout(() => sib.classList.add('visible'), 0);
            } else if (!sib.classList.contains('visible')) {
              idx++;
            }
          });

          /* Simple: just reveal with a tiny stagger based on position in its section */
          const section = entry.target.closest('.section');
          if (section) {
            const allInSection = section.querySelectorAll('.scroll-reveal, .slide-in');
            allInSection.forEach((el, j) => {
              if (el.getBoundingClientRect().top < window.innerHeight) {
                setTimeout(() => el.classList.add('visible'), j * 100);
              }
            });
          }

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
  }

  /* ---- SECTION 2: SEQUENTIAL REVEAL ---- */
  function initSandbox() {
    const items = document.querySelectorAll('.scroll-seq');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          items.forEach((item, i) => {
            setTimeout(() => item.classList.add('visible'), i * 150);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });

    observer.observe(items[0]);
  }

  /* ---- SECTION 4: COMMENT STEP HIGHLIGHT ---- */
  function initCommentSteps() {
    const steps = document.querySelectorAll('.comment-step');
    if (!steps.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('highlight');
          const cmt = entry.target.querySelector('.cmt');
          if (cmt) cmt.style.color = 'var(--green)';
        }
      });
    }, { threshold: 0.5, rootMargin: '0px 0px -20% 0px' });

    steps.forEach(s => observer.observe(s));
  }

  /* ---- SECTION 5: TYPEWRITER LINES ---- */
  function initTerminal() {
    const lines = document.querySelectorAll('.typewriter-line');
    if (!lines.length) return;

    let triggered = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !triggered) {
          triggered = true;
          lines.forEach((line, i) => {
            setTimeout(() => {
              line.classList.add('visible');
              /* Add pulse to last line */
              if (line.classList.contains('last-line')) {
                line.classList.add('pulse-text');
              }
            }, i * 500);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(lines[0]);
  }

  /* ---- INIT ---- */
  document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    initCopy();
    initGutter();
    initHero();
    initScrollReveal();
    initSandbox();
    initCommentSteps();
    initTerminal();
  });
})();