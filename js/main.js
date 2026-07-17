/* ============================================================
   LONDON DENTAL CLINIC — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* -------- Theme Switcher Logic -------- */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme');

  // Default is dark mode. If light mode was explicitly saved, apply it.
  if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      
      // Save state to localStorage
      if (document.body.classList.contains('light-theme')) {
        localStorage.setItem('theme', 'light');
      } else {
        localStorage.setItem('theme', 'dark');
      }
    });
  }

  /* -------- Navbar: scroll & hamburger -------- */
  const nav = document.getElementById('main-nav');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const allNavLinks = document.querySelectorAll('.nav__link');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('open');
  });

  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });

  /* -------- Active nav link on scroll -------- */
  const sections = document.querySelectorAll('section[id]');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        allNavLinks.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === '#' + entry.target.id
          );
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => navObserver.observe(s));

  /* -------- Scroll reveal animations -------- */
  const revealTargets = document.querySelectorAll(
    '.service-card, .doctor-card, .gallery-item, .review-card, ' +
    '.stat-item, .feature-card, .why-card, .contact-block, ' +
    '.about__image-card, .about__hours-card, .section-header'
  );

  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, 60 * (i % 8));
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealTargets.forEach(el => revealObserver.observe(el));

  /* -------- Animated counters -------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.target);
    const isDecimal = el.dataset.decimal === 'true';
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, target);
      el.textContent = isDecimal
        ? current.toFixed(1)
        : Math.round(current).toString();
      if (step >= steps) {
        el.textContent = isDecimal ? target.toFixed(1) : target.toString();
        clearInterval(timer);
      }
    }, duration / steps);
  }

  const statNumbers = document.querySelectorAll('.stat-number');
  let countersStarted = false;

  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      statNumbers.forEach(el => animateCount(el));
      statsObserver.disconnect();
    }
  }, { threshold: 0.3 });

  const statsSection = document.getElementById('stats');
  if (statsSection) statsObserver.observe(statsSection);

  /* -------- Reviews carousel -------- */
  const track = document.getElementById('reviews-track');
  const dotsContainer = document.getElementById('reviews-dots');
  const prevBtn = document.getElementById('reviews-prev');
  const nextBtn = document.getElementById('reviews-next');

  if (track && dotsContainer) {
    const cards = track.querySelectorAll('.review-card');
    let current = 0;
    let cardsVisible = 3;
    let total;
    let autoPlay;

    function getCardsVisible() {
      if (window.innerWidth <= 480) return 1;
      if (window.innerWidth <= 900) return 1;
      if (window.innerWidth <= 1100) return 2;
      return 3;
    }

    function buildDots() {
      dotsContainer.innerHTML = '';
      total = Math.ceil(cards.length / cardsVisible);
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 'reviews__dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to review group ' + (i + 1));
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    }

    function goTo(index) {
      cardsVisible = getCardsVisible();
      total = Math.ceil(cards.length / cardsVisible);
      current = Math.max(0, Math.min(index, total - 1));

      const cardWidth = cards[0].offsetWidth;
      const gap = 24; // --space-lg
      track.style.transform = `translateX(-${current * cardsVisible * (cardWidth + gap)}px)`;

      dotsContainer.querySelectorAll('.reviews__dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function next() { goTo(current + 1 < total ? current + 1 : 0); }
    function prev() { goTo(current - 1 >= 0 ? current - 1 : total - 1); }

    function startAutoplay() {
      stopAutoplay();
      autoPlay = setInterval(next, 5000);
    }

    function stopAutoplay() {
      if (autoPlay) clearInterval(autoPlay);
    }

    prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });
    nextBtn.addEventListener('click', () => { next(); startAutoplay(); });

    // Touch/swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
        startAutoplay();
      }
    }, { passive: true });

    function init() {
      cardsVisible = getCardsVisible();
      buildDots();
      goTo(0);
      startAutoplay();
    }

    init();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cardsVisible = getCardsVisible();
        buildDots();
        goTo(0);
      }, 200);
    }, { passive: true });
  }

  /* -------- Floating CTA visibility -------- */
  const floatingCta = document.getElementById('floating-cta');
  const heroSection = document.getElementById('hero');

  if (floatingCta && heroSection) {
    const heroObserver = new IntersectionObserver((entries) => {
      floatingCta.style.opacity = entries[0].isIntersecting ? '0' : '1';
      floatingCta.style.pointerEvents = entries[0].isIntersecting ? 'none' : 'auto';
    }, { threshold: 0.3 });

    heroObserver.observe(heroSection);
  }

  /* -------- Hamburger icon animation -------- */
  hamburger.addEventListener('click', function () {
    const spans = this.querySelectorAll('span');
    if (this.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => {
        s.style.transform = '';
        s.style.opacity = '';
      });
    }
  });

  /* -------- Smooth back-to-top on logo click -------- */
  document.querySelectorAll('a[href="#hero"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* -------- Gallery lightbox (simple) -------- */
  const galleryItems = document.querySelectorAll('.gallery-item');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (!img || item.classList.contains('gallery-item--error')) return;

      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed;inset:0;z-index:999;background:rgba(0,0,0,0.9);
        display:flex;align-items:center;justify-content:center;
        cursor:zoom-out;animation:fadeIn 0.3s ease;
        padding: 20px;
      `;

      const style = document.createElement('style');
      style.textContent = '@keyframes fadeIn{from{opacity:0}to{opacity:1}}';
      document.head.appendChild(style);

      const imgEl = document.createElement('img');
      imgEl.src = img.src;
      imgEl.alt = img.alt;
      imgEl.style.cssText = `
        max-width:90vw;max-height:90vh;object-fit:contain;
        border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.5);
      `;

      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕';
      closeBtn.style.cssText = `
        position:fixed;top:20px;right:24px;background:transparent;border:none;
        color:#fff;font-size:2rem;cursor:pointer;opacity:0.8;transition:opacity 0.2s;
      `;
      closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
      closeBtn.onmouseout = () => closeBtn.style.opacity = '0.8';

      overlay.appendChild(imgEl);
      overlay.appendChild(closeBtn);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      function close() {
        document.body.removeChild(overlay);
        document.body.style.overflow = '';
      }

      overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
      closeBtn.addEventListener('click', close);

      const escHandler = e => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
      document.addEventListener('keydown', escHandler);
    });
  });

  console.log('%c🦷 London Dental Clinic', 'color:#00c2e0;font-size:18px;font-weight:bold;');
  console.log('%cWebsite loaded successfully.', 'color:#38f9d7;font-size:12px;');

})();
