// Header hide on scroll
(function () {
  const header = document.getElementById('site-header');
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const currentY = window.scrollY;
    const goingDown = currentY > lastY && currentY > 24;
    header.classList.toggle('header--hidden', goingDown);
    lastY = currentY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
})();

// Mobile nav toggle
(function () {
  const toggle = document.querySelector('.nav__toggle');
  const list = document.getElementById('nav-list');
  if (!toggle || !list) return;

  toggle.addEventListener('click', () => {
    const isOpen = list.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when clicking a link
  list.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.matches('a[href^="#"]')) {
      list.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

// Smooth anchor focus management
(function () {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;
      // Let browser scroll, then set focus for accessibility
      setTimeout(() => el.setAttribute('tabindex', '-1'), 0);
      setTimeout(() => el.focus({ preventScroll: true }), 350);
    });
  });
})();

// Waste → Wealth Simulator
(function () {
  const tonsEl = document.getElementById('tons');
  const yieldEl = document.getElementById('yield');
  const priceEl = document.getElementById('price');
  const baseEl = document.getElementById('baseline');
  const factorEl = document.getElementById('factor');

  const yieldOut = document.getElementById('yieldOut');
  const factorOut = document.getElementById('factorOut');

  const divertedOut = document.getElementById('diverted');
  const recoveredOut = document.getElementById('recovered');
  const revenueOut = document.getElementById('revenue');
  const co2Out = document.getElementById('co2');
  const energySavedOut = document.getElementById('energySaved');
  const energyPctOut = document.getElementById('energyPct');

  function num(v) {
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
    return isFinite(n) ? n : 0;
  }
  function fmtInt(v) { return Math.round(v).toLocaleString('en-IN'); }
  function fmt1(v) { return (Math.round(v * 10) / 10).toLocaleString('en-IN'); }

  function compute() {
    const tons = num(tonsEl.value);
    const y = num(yieldEl.value);
    const price = num(priceEl.value);
    const baseline = num(baseEl.value); // kWh/kg for traditional
    const factor = num(factorEl.value); // times lower energy

    // Outputs
    const diverted = tons; // tons/month processed
    const recovered = tons * y; // tons/month monomers
    const revenue = recovered * price; // ₹/month

    // CO2e avoided: ~1.2 tCO2e per processed ton (from proposal, scaled monthly)
    const co2 = tons * 1.2;

    // Energy saved vs. traditional
    // Traditional energy: baseline kWh/kg; ECO-DISSOLVE uses baseline/factor
    // Saved per kg = baseline - baseline/factor = baseline*(1 - 1/factor)
    const savedPerKg = baseline * (1 - 1 / Math.max(factor, 1));
    const kg = tons * 1000;
    const kWhSaved = savedPerKg * kg;
    const MWhSaved = kWhSaved / 1000;
    const pctSaved = (1 - 1 / Math.max(factor, 1)) * 100;

    divertedOut.textContent = fmtInt(diverted);
    recoveredOut.textContent = fmtInt(recovered);
    revenueOut.textContent = fmtInt(revenue);
    co2Out.textContent = fmtInt(co2);
    energySavedOut.textContent = fmt1(MWhSaved);
    energyPctOut.textContent = `${fmt1(pctSaved)}%`;
  }

  // Update inline outputs for sliders
  function updateInline() {
    yieldOut.textContent = `${Math.round(num(yieldEl.value) * 100)}%`;
    factorOut.textContent = `${fmtInt(num(factorEl.value))}×`;
  }

  // Bind events
  [tonsEl, yieldEl, priceEl, baseEl, factorEl].forEach((el) => {
    el.addEventListener('input', () => { updateInline(); compute(); });
    el.addEventListener('change', () => { updateInline(); compute(); });
  });

  // Initialize
  updateInline();
  compute();
})();
