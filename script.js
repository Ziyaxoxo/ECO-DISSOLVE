(function(){
  // Header hide/reveal on scroll
  const header = document.getElementById('site-header');
  let lastY = window.pageYOffset || 0;
  let ticking = false;

  const onScroll = () => {
    const y = window.pageYOffset || 0;
    const goingDown = y > lastY;
    const beyond = y > 64;

    if (goingDown && beyond){
      header.classList.add('header--hidden');
    } else {
      header.classList.remove('header--hidden');
    }
    lastY = y;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking){
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // Simulator
  const $ = (id) => document.getElementById(id);
  const tons = $('tons');
  const price = $('price');
  const yieldEl = $('yield');
  const baseline = $('baseline');
  const efficiency = $('efficiency');
  const efficiencyOut = $('efficiencyOut');
  const calc = $('calc');

  const revOut = $('revOut');
  const energyOut = $('energyOut');
  const co2Out = $('co2Out');

  const formatINR = (n) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);
  const formatNum = (n, unit='') => `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)}${unit}`;

  const compute = () => {
    const t = Math.max(0, Number(tons.value) || 0);
    const p = Math.max(0, Number(price.value) || 0);
    const y = Math.min(1, Math.max(0, Number(yieldEl.value) || 0.95));
    const base = Math.max(0, Number(baseline.value) || 0);
    const f = Math.max(3, Math.min(10, Number(efficiency.value) || 5));

    efficiencyOut.textContent = `${f}×`;

    // Revenue: tons * yield * price (per ton)
    const revenue = t * y * p;

    // Energy saved: (baseline - baseline/f) * tons * 1000 (kWh)
    const energySaved = (base - (base / f)) * t * 1000;

    // CO2 avoided: ~1.2 tCO2e per ton processed
    const co2Avoided = t * 1.2;

    revOut.textContent = formatINR(revenue);
    energyOut.textContent = formatNum(energySaved, ' kWh');
    co2Out.textContent = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(co2Avoided) + ' tCO₂e';
  };

  efficiency.addEventListener('input', compute);
  [tons, price, yieldEl, baseline].forEach(el => el.addEventListener('input', compute));
  calc.addEventListener('click', compute);

  // Initial compute
  compute();
})();
