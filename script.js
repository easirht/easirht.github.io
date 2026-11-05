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


// ============================================================================
// App shell: dark/light theme toggle, current-page highlight, "Overview" link,
// and the glass top bar shown on wide screens. Works on every page without
// changing any HTML. Pairs with the DARK GLASS APP SHELL block in styles.css.
// ============================================================================
(function () {
  if (window.__siteShell) return;
  window.__siteShell = true;

  var root = document.documentElement;
  var NAV_BG = { dark: '#070C1A', light: '#FAF8F3' };

  /* ---- Theme (dark is the default) ---- */
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  var theme = saved === 'light' ? 'light' : 'dark';

  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }

  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'theme-toggle';
  var icon = document.createElement('span');
  icon.className = 'ti';
  icon.setAttribute('aria-hidden', 'true');
  var label = document.createElement('span');
  label.className = 'tl';
  toggle.appendChild(icon);
  toggle.appendChild(label);

  function applyTheme(t, remember) {
    theme = t;
    root.setAttribute('data-theme', t);
    meta.setAttribute('content', NAV_BG[t]);
    var next = t === 'dark' ? 'light' : 'dark';
    label.textContent = next === 'light' ? 'Light mode' : 'Dark mode';
    toggle.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    if (remember) { try { localStorage.setItem('theme', t); } catch (e) {} }
  }
  toggle.addEventListener('click', function () {
    applyTheme(theme === 'dark' ? 'light' : 'dark', true);
  });
  applyTheme(theme, false);

  var headerInner = document.querySelector('.header-inner');
  if (headerInner) {
    var burger = headerInner.querySelector('.nav-toggle');
    if (burger) headerInner.insertBefore(toggle, burger); else headerInner.appendChild(toggle);
  }

  /* ---- Nav: add "Overview" (home) and mark the current page ---- */
  var nav = document.getElementById('main-nav');
  var page = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '');

  if (nav && !nav.querySelector('a[href="index.html"]')) {
    var home = document.createElement('a');
    home.href = 'index.html';
    home.textContent = 'Overview';
    nav.insertBefore(home, nav.firstChild);
  }
  var current = null;
  if (nav) {
    current = nav.querySelector('a.is-current');
    if (!current) {
      var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
      current = links.filter(function (a) {
        var h = (a.getAttribute('href') || '');
        return h.indexOf('#') === -1 && h.replace(/\.html$/, '') === page;
      })[0] || null;
      if (current) current.classList.add('is-current');
    }
  }

  /* ---- Glass top bar (shown by CSS on wide screens only) ---- */
  var main = document.querySelector('main');
  if (main && !main.querySelector('.topbar')) {
    var bar = document.createElement('div');
    bar.className = 'topbar';

    var crumb = document.createElement('nav');
    crumb.className = 'crumb';
    crumb.setAttribute('aria-label', 'Breadcrumb');
    var root1 = document.createElement('a');
    root1.href = 'index.html';
    root1.textContent = 'Easir Rahat';
    var sep = document.createElement('span');
    sep.className = 'sep';
    sep.setAttribute('aria-hidden', 'true');
    sep.textContent = '\u203A';
    var here = document.createElement('span');
    here.className = 'here';
    here.textContent = (page === 'index' || page === '' || !current) ? 'Overview' : current.textContent.trim();
    crumb.appendChild(root1);
    crumb.appendChild(sep);
    crumb.appendChild(here);

    var actions = document.createElement('div');
    actions.className = 'topbar-actions';
    var cv = document.createElement('a');
    cv.className = 'tb-btn tb-ghost';
    cv.href = 'assets/cv/Easir_Rahat_CV.pdf';
    cv.setAttribute('download', '');
    cv.textContent = 'Download CV';
    var touch = document.createElement('a');
    touch.className = 'tb-btn tb-gold';
    touch.href = 'index.html#contact';
    touch.textContent = 'Get in touch';
    actions.appendChild(cv);
    actions.appendChild(touch);

    bar.appendChild(crumb);
    bar.appendChild(actions);
    main.insertBefore(bar, main.firstChild);
  }
})();
