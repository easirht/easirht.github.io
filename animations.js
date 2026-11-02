/* animations.js — scroll reveal, stat count-up, header shadow.
   Add before </body>:  <script src="animations.js" defer></script>
   Skips everything for visitors who prefer reduced motion. */
(function () {
  var header = document.querySelector('.site-header');
  if (header) {
    addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      setTimeout(function () {
        el.classList.remove('reveal', 'in');
        el.style.transitionDelay = '';
      }, 2200);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll(targets).forEach(function (el) {
    if (el.closest('.hero')) return;
    var i = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.transitionDelay = Math.min(i * 90, 360) + 'ms';
    el.classList.add('reveal');
    io.observe(el);
  });
})();
