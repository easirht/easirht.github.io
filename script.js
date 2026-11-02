// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when a link is clicked (mobile)
  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Footer "Rev" year
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Carousels
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  const dotsWrap = carousel.querySelector('.carousel-dots');
  const prevBtn = carousel.querySelector('.carousel-arrow.prev');
  const nextBtn = carousel.querySelector('.carousel-arrow.next');
  let index = 0;
  let timer = null;

  if (slides.length <= 1) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    return;
  }

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    update();
    restart();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function restart() {
    if (prefersReducedMotion) return;
    clearInterval(timer);
    timer = setInterval(() => { goTo(index + 1); }, 4200);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { next(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); });

  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', restart);

  update();
  restart();
});


// ============================================================================
// Animations: scroll reveal, stat count-up, scroll progress bar, header shadow.
// Pairs with the ANIMATIONS block at the bottom of styles.css.
// Everything after the header shadow is skipped for visitors who prefer reduced motion.
// ============================================================================
(function () {
  if (window.__siteAnimations) return;          // never run twice
  window.__siteAnimations = true;

  var header = document.querySelector('.site-header');
  function headerShadow() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }
  addEventListener('scroll', headerShadow, { passive: true });
  headerShadow();

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  /* Scroll progress line */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var ticking = false;
  function updateBar() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    bar.style.transform = 'scaleX(' + p + ')';
    ticking = false;
  }
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateBar); }
  }, { passive: true });
  addEventListener('resize', updateBar);
  updateBar();

  /* Stat numbers count up from 0 */
  document.querySelectorAll('.stat-num').forEach(function (el) {
    var n = parseInt(el.textContent, 10);
    if (isNaN(n)) return;
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1300, 1);
      el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    setTimeout(function () { requestAnimationFrame(step); }, 700);
  });

  /* Fade-up on scroll */
  var targets = [
    'h2', '.about-copy', '.fact', '.research-quote', '.tag-row', '.pub', '.project-card',
    '.timeline li', '.skills-cols > div', '.cert-row', '.explore-card', '.sim-card',
    '.sim-feature', '.hobby-strip img', '.internship-narrative', '.page-hero h1',
    '.page-hero-desc', '.contact-headline', '.contact-pills', '.contact-detail'
  ].join(',');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add('in');
      io.unobserve(el);
      // Remove the helper classes afterwards so hover effects work normally
      setTimeout(function () {
        el.classList.remove('reveal', 'in');
        el.style.transitionDelay = '';
      }, 2200);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll(targets).forEach(function (el) {
    if (el.closest('.hero')) return;            // the hero has its own entrance animation
    var i = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.transitionDelay = Math.min(i * 90, 360) + 'ms';
    el.classList.add('reveal');
    io.observe(el);
  });
})();
