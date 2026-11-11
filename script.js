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
    '.fact', '.pub', '.project-card', '.timeline li', '.skills-cols > div', '.cert-row',
    '.explore-card', '.sim-card', '.sim-feature', '.hobby-strip img'
  ].join(',');   // only cards rise in; headings and paragraphs stay fixed

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
  var NAV_BG = { dark: '#111111', light: '#EEF4F7' };

  /* ---- Theme (follows the device until the visitor chooses) ---- */
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var theme = (saved === 'dark' || saved === 'light') ? saved : (mq && mq.matches ? 'dark' : 'light');

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
  // Until the visitor picks a theme with the button, follow the device setting live
  if (mq && mq.addEventListener) mq.addEventListener('change', function (e) {
    var chosen = null; try { chosen = localStorage.getItem('theme'); } catch (err) {}
    if (chosen !== 'dark' && chosen !== 'light') applyTheme(e.matches ? 'dark' : 'light', false);
  });

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


// ============================================================================
// PHONE APP SHELL: page title in the top bar, CV icon, and the bottom tab bar.
// Everything here is hidden by CSS above 767px, so laptop and tablet are unchanged.
// Pairs with the PHONE APP SHELL block at the bottom of styles.css.
// ============================================================================
(function () {
  if (window.__phoneShell) return;
  window.__phoneShell = true;

  var page = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  var titles = {
    index: 'Overview', research: 'Research', projects: 'Projects', simulation: 'Simulation',
    internship: 'Internship', activities: 'Activities & Awards', skills: 'Skills',
    certifications: 'Certifications', hobbies: 'Hobbies'
  };
  var wm = document.querySelector('.wordmark');
  if (wm) wm.setAttribute('data-title', titles[page] || 'Overview');

  var svg = function (d) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>';
  };
  var ICON = {
    home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    research: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M9 7h6',
    projects: 'M12 2l9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5',
    mail: 'M4 4h16v16H4zM4 6l8 7 8-7',
    more: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    dl: 'M12 3v12M7 10l5 5 5-5M4 21h16'
  };

  var inner = document.querySelector('.header-inner');
  if (inner) {
    var cv = document.createElement('a');
    cv.className = 'tb-icon';
    cv.href = 'assets/cv/Easir_Rahat_CV.pdf';
    cv.setAttribute('download', '');
    cv.setAttribute('aria-label', 'Download CV');
    cv.innerHTML = svg(ICON.dl);
    inner.appendChild(cv);
  }

  var onContact = location.hash === '#contact';
  var active = page === 'index' ? (onContact ? 'contact' : 'home')
             : page === 'research' ? 'research'
             : page === 'projects' ? 'projects' : 'more';

  var bar = document.createElement('nav');
  bar.className = 'tabbar';
  bar.setAttribute('aria-label', 'Quick navigation');
  [
    ['home', 'Overview', 'index.html'],
    ['research', 'Research', 'research.html'],
    ['projects', 'Projects', 'projects.html'],
    ['contact', 'Contact', 'index.html#contact', 'mail'],
    ['more', 'More', null]
  ].forEach(function (t) {
    var el = document.createElement(t[2] ? 'a' : 'button');
    el.className = 'tab' + (active === t[0] ? ' is-active' : '');
    if (t[2]) el.href = t[2]; else el.type = 'button';
    el.innerHTML = svg(ICON[t[3] || t[0]]) + '<span>' + t[1] + '</span>';
    if (!t[2]) {
      el.setAttribute('aria-label', 'More pages');
      el.addEventListener('click', function () {
        var burger = document.getElementById('nav-toggle');
        if (burger) burger.click();
      });
    }
    bar.appendChild(el);
  });
  document.body.appendChild(bar);

  /* Scroll behaviour: scrolling down slides the bar off to the right, leaving a small
     handle on the edge; scrolling up (or tapping the handle) brings it back. */
  var fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'tab-handle';
  fab.setAttribute('aria-label', 'Show navigation bar');
  fab.innerHTML = svg('M15 6l-6 6 6 6');
  document.body.appendChild(fab);

  var collapsed = false;
  function setCollapsed(v) {
    if (v === collapsed) return;
    collapsed = v;
    bar.classList.toggle('is-collapsed', v);
    fab.classList.toggle('is-visible', v);
    bar.setAttribute('aria-hidden', v ? 'true' : 'false');
  }
  fab.addEventListener('click', function () { setCollapsed(false); });

  var lastY = window.scrollY, pending = false;
  function onScroll() {
    pending = false;
    var y = window.scrollY, dy = y - lastY;
    var nearBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 48;
    var menuOpen = document.getElementById('main-nav') &&
                   document.getElementById('main-nav').classList.contains('is-open');
    if (y < 120 || nearBottom || menuOpen) setCollapsed(false);
    else if (dy > 6) setCollapsed(true);
    else if (dy < -6) setCollapsed(false);
    if (Math.abs(dy) > 6) lastY = y;
  }
  addEventListener('scroll', function () {
    if (!pending) { pending = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
})();


// ============================================================================
// CV DOWNLOAD CONFIRMATION: clicking any "Download CV" link opens a small confirm box
// first. "Download" starts the download, "Cancel" / Esc / clicking outside closes it.
// Works for every PDF link on every page, so nothing else needs to change.
// ============================================================================
(function () {
  if (window.__cvConfirm) return;
  window.__cvConfirm = true;

  var bypass = false, lastFocus = null, pendingHref = '', toastTimer = null;

  var overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="confirm-box" role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-text">' +
      '<div class="confirm-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg></div>' +
      '<h3 id="confirm-title">Download CV?</h3>' +
      '<p id="confirm-text"></p>' +
      '<div class="confirm-actions">' +
        '<button type="button" class="confirm-btn confirm-cancel">Cancel</button>' +
        '<button type="button" class="confirm-btn confirm-ok">Download</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  var text = overlay.querySelector('#confirm-text');
  var okBtn = overlay.querySelector('.confirm-ok');
  var cancelBtn = overlay.querySelector('.confirm-cancel');

  var toast = document.createElement('div');
  toast.className = 'confirm-toast';
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);

  function fileName(href) { return decodeURIComponent((href.split('?')[0].split('/').pop()) || 'CV.pdf'); }

  function openBox(href) {
    pendingHref = href;
    text.textContent = 'This will download ' + fileName(href) + ' to your device.';
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add('is-open'); });
    document.documentElement.classList.add('confirm-lock');
    okBtn.focus();
  }
  function closeBox() {
    overlay.classList.remove('is-open');
    document.documentElement.classList.remove('confirm-lock');
    setTimeout(function () { overlay.hidden = true; }, 200);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 3200);
  }

  document.addEventListener('click', function (e) {
    if (bypass) return;
    var a = e.target.closest ? e.target.closest('a[href$=".pdf"]') : null;
    if (!a || !overlay.hidden) return;
    e.preventDefault();
    lastFocus = a;
    openBox(a.getAttribute('href'));
  });

  okBtn.addEventListener('click', function () {
    var href = pendingHref;
    closeBox();
    var t = document.createElement('a');
    t.href = href;
    t.setAttribute('download', '');
    t.style.display = 'none';
    document.body.appendChild(t);
    bypass = true;
    t.click();
    bypass = false;
    t.remove();
    showToast('Download started: ' + fileName(href));
  });
  cancelBtn.addEventListener('click', closeBox);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeBox(); });
  document.addEventListener('keydown', function (e) {
    if (overlay.hidden) return;
    if (e.key === 'Escape') { closeBox(); return; }
    if (e.key === 'Tab') {            // keep keyboard focus inside the box
      var first = cancelBtn, last = okBtn;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();




// ============================================================================
// SOCIAL ICONS: one list, shown in the top bar (laptop), as a strip at the very top (phone)
// and in the Get in Touch section. To add Google Scholar, ResearchGate or YouTube later,
// add one more line to SOCIALS below (see the example comment) and nothing else needs to change.
// ============================================================================
(function () {
  if (window.__socials) return;
  window.__socials = true;

  var SOCIALS = [
    { name: 'Email',    href: 'mailto:easirrahat17@gmail.com', stroke: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM3 7l9 6.5L21 7' },
    { name: 'Phone',    href: 'tel:+8801872104142',            stroke: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/easir-ruet', fill: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
    { name: 'GitHub',   href: 'https://github.com/easirht',    fill: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' }
    // Later, for example:
    // , { name: 'Google Scholar', href: 'https://scholar.google.com/citations?user=...', fill: '<icon path here>' }
    // , { name: 'ResearchGate',   href: 'https://www.researchgate.net/profile/...',        fill: '<icon path here>' }
    // , { name: 'YouTube',        href: 'https://www.youtube.com/@...',                    fill: '<icon path here>' }
  ];

  function build(cls) {
    var wrap = document.createElement('div');
    wrap.className = cls;
    SOCIALS.forEach(function (s) {
      var a = document.createElement('a');
      a.className = 'soc';
      a.href = s.href;
      a.setAttribute('aria-label', s.name);
      a.title = s.name;
      if (/^https?:/.test(s.href)) { a.target = '_blank'; a.rel = 'noopener'; }
      a.innerHTML = s.fill
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="' + s.fill + '"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="' + s.stroke + '"/></svg>';
      wrap.appendChild(a);
    });
    return wrap;
  }

  var main = document.querySelector('main');
  var topbar = document.querySelector('.topbar');
  if (topbar) topbar.insertBefore(build('social-row'), topbar.firstChild);          // laptop: inside the top bar
  if (main) main.insertBefore(build('social-strip'), main.firstChild);              // phone / tablet: very top of the page
  document.querySelectorAll('[data-socials]').forEach(function (box) {              // Get in Touch section
    var row = build('contact-icons-row');
    box.innerHTML = '';
    while (row.firstChild) box.appendChild(row.firstChild);
  });
})();
