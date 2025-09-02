// Header hide-on-scroll
(function(){
  let lastY = window.scrollY;
  const header = document.getElementById("siteHeader");
  let ticking = false;

  function onScroll(){
    const y = window.scrollY;
    const goingDown = y > lastY && y > 64;
    header.classList.toggle("header--hidden", goingDown);
    lastY = y;
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if(!ticking){ requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
})();

// Mobile nav toggle
(function(){
  const btn = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");
  if(!btn || !nav) return;
  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("open");
  });
})();

// Smooth anchor scroll
(function(){
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if(!id || id === "#") return;
      const target = document.querySelector(id);
      if(target){
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.pageYOffset - 72;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    });
  });
})();

// Calculator logic
(function(){
  const $ = (id) => document.getElementById(id);
  const input = $("tonsPerMonth");
  const btn = $("calcBtn");
  const reset = $("resetBtn");

  const outMonomers = $("outMonomers");
  const outCO2 = $("outCO2");
  const outEnergy = $("outEnergy");
  const outJobs = $("outJobs");
  const outSolvent = $("outSolvent");

  const fmt = (n) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(n);

  function compute(){
    const m = Math.max(0, Number(input.value || 0)); // tons per month
    const annualTons = m * 12;

    // Assumptions from brief:
    // - 95% depolymerization (monthly monomer yield)
    // - 1.2 tCO2e avoided per ton/year
    // - 3–10x lower energy -> ~67%–90% reduction (we show mid-point 80%)
    // - 95% solvent recovery
    // - ~50 direct jobs per 1000 t/year => 0.05 jobs per ton/year
    const monomersMonthly = m * 0.95;
    const co2Annual = annualTons * 1.2;
    const energyReductionPct = 80; // midpoint for presentation
    const jobsAnnual = Math.round(annualTons * 0.05);
    const solventRecoveryPct = 95;

    outMonomers.textContent = fmt(monomersMonthly);
    outCO2.textContent = fmt(co2Annual);
    outEnergy.textContent = energyReductionPct.toString();
    outJobs.textContent = fmt(jobsAnnual);
    outSolvent.textContent = solventRecoveryPct.toString();
  }

  btn && btn.addEventListener("click", compute);
  reset && reset.addEventListener("click", () => {
    input.value = 50;
    compute();
  });

  // init
  compute();
})();
