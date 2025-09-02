// Header hide-on-scroll
(() => {
  const header = document.getElementById('site-header');
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const goingDown = y > lastY && y > 24;
    header.classList.toggle('hidden', goingDown);
    lastY = y;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
})();

// Smooth anchor scroll (progressive enhancement)
(() => {
  const navLinks = document.querySelectorAll('a[href^="#"]');
  for (const link of navLinks) {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const el = document.querySelector(targetId);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', targetId);
    });
  }
})();

// Waste→Wealth simulator
(() => {
  const form = document.getElementById('sim-form');
  const results = document.getElementById('sim-results');
  const outKg = document.getElementById('out-kg');
  const outValue = document.getElementById('out-value');
  const outEnergy = document.getElementById('out-energy');
  const outCO2 = document.getElementById('out-co2');

  const baselineKWhPerKg = 4.5;   // thermal/pyrolysis baseline (approx)
  const ecoKWhPerKg = 1.2;        // room-temp target band (≈3–4x lower)
  const depolyEfficiency = 0.95;  // 95% PET benchmark
  const solventRecovery = 0.95;

  // stream multipliers
  const stream = {
    PET:        { recovery: 0.92, energyAdj: 1.00 },
    MIXED_PACK: { recovery: 0.88, energyAdj: 1.10 },
    CONTAM:     { recovery: 0.85, energyAdj: 1.15 },
    E_WASTE:    { recovery: 0.90, energyAdj: 1.05 },
  };

  // contamination multipliers
  const contam = {
    LOW:  { recovery: 1.00, energyAdj: 1.00 },
    MED:  { recovery: 0.97, energyAdj: 1.08 },
    HIGH: { recovery: 0.94, energyAdj: 1.15 },
  };

  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const plastic = document.getElementById('plastic').value;
    const contamLevel = document.getElementById('contam').value;
    const volume = Math.max(0, Number(document.getElementById('volume').value || 0));
    const pricePerKg = Math.max(0, Number(document.getElementById('price').value || 0));

    const s = stream[plastic] || stream.PET;
    const c = contam[contamLevel] || contam.LOW;

    const totalRecovery = Math.max(0, Math.min(1, depolyEfficiency * s.recovery * c.recovery * solventRecovery));
    const recoveredKg = Math.round(volume * totalRecovery);

    const ecoEnergy = ecoKWhPerKg * s.energyAdj * c.energyAdj * volume;
    const baselineEnergy = baselineKWhPerKg * volume;
    const energySaved = Math.max(0, Math.round(baselineEnergy - ecoEnergy));

    // CO2e heuristic: 1.2 t per 1,000 t pilot scale → scale linearly
    const co2ePerKg = 1.2 / 1_000_000; // t per kg
    const co2AvoidedT = (co2ePerKg * volume).toFixed(3);

    // Value created (₹) — assume 1 USD ≈ ₹80, give a simple conversion without external sources
    const usdToInr = 80;
    const valueINR = Math.round(recoveredKg * pricePerKg * usdToInr);

    outKg.textContent = recoveredKg.toLocaleString();
    outValue.textContent = valueINR.toLocaleString();
    outEnergy.textContent = energySaved.toLocaleString();
    outCO2.textContent = co2AvoidedT;

    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  form?.addEventListener('reset', () => {
    results.hidden = true;
  });
})();
