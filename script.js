// Header auto-hide on scroll + subtle shadow after first scroll
;(() => {
  const header = document.querySelector(".site-header")
  if (!header || header.dataset.autoHideInitialized) return
  header.dataset.autoHideInitialized = "true"

  let lastY = window.scrollY
  let ticking = false

  function onScroll() {
    const currentY = window.scrollY
    const goingDown = currentY > lastY && currentY > 64
    header.classList.toggle("header--hidden", goingDown)
    header.classList.toggle("scrolled", currentY > 4)
    lastY = currentY
    ticking = false
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll)
        ticking = true
      }
    },
    { passive: true },
  )
})()

// Mobile nav toggle (accessible)
;(() => {
  const btn = document.querySelector(".nav-toggle")
  const nav = document.getElementById("site-nav")
  if (!btn || !nav) return

  function setOpen(open) {
    btn.setAttribute("aria-expanded", String(open))
    nav.classList.toggle("is-open", open)
  }

  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true"
    setOpen(!expanded)
  })

  // Close on link click in mobile
  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      if (window.innerWidth < 880) setOpen(false)
    })
  })

  // Close on escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false)
  })
})()

// Count-up KPIs when visible
;(() => {
  const els = Array.from(document.querySelectorAll("[data-countup]"))
  if (!("IntersectionObserver" in window) || !els.length) {
    els.forEach((el) => (el.textContent = el.getAttribute("data-countup")))
    return
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el = entry.target
        const target = Number(el.getAttribute("data-countup") || "0")
        const duration = 1200
        const start = performance.now()

        function tick(now) {
          const t = Math.min(1, (now - start) / duration)
          const eased = t < 1 ? t * (2 - t) : 1 // easeOutQuad
          el.textContent = String(Math.floor(target * eased))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        io.unobserve(el)
      })
    },
    { threshold: 0.4 },
  )

  els.forEach((el) => io.observe(el))
})()

// Waste → Wealth Simulator
;(() => {
  const tonsEl = document.getElementById("input-tons")
  const contamEl = document.getElementById("contamination")
  const streamEl = document.getElementById("stream")
  const baselineEl = document.getElementById("baseline-energy")

  const outYield = document.getElementById("yield-tons")
  const outEnergyNew = document.getElementById("energy-new")
  const outEnergySaved = document.getElementById("energy-saved")
  const outCO2 = document.getElementById("co2-avoided")

  const barOld = document.getElementById("bar-old")
  const barNew = document.getElementById("bar-new")

  const rTons = document.getElementById("val-tons")
  const rContam = document.getElementById("val-contam")

  if (!tonsEl || !contamEl || !streamEl || !baselineEl) return

  function streamFactors(stream) {
    switch (stream) {
      case "pet":
        return { yield: 0.95, energyFactor: 0.3 }
      case "mixed":
        return { yield: 0.85, energyFactor: 0.35 }
      case "ewaste":
        return { yield: 0.8, energyFactor: 0.4 }
      default:
        return { yield: 0.85, energyFactor: 0.35 }
    }
  }

  function format(num) {
    return Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(num)
  }

  function calc() {
    const tons = Number(tonsEl.value || 0)
    const contamPct = Number(contamEl.value || 0)
    const baselineKWhPerKg = Math.max(0.1, Number(baselineEl.value || 1.0))

    const { yield: yFactor, energyFactor } = streamFactors(streamEl.value)

    const effectiveTons = tons * (1 - contamPct / 100)
    const monomerYieldTons = effectiveTons * yFactor

    // Energy baseline/new (MWh per month)
    const baselineMWh = (tons * 1000 * baselineKWhPerKg) / 1000
    const newMWh = baselineMWh * energyFactor
    const savedMWh = Math.max(0, baselineMWh - newMWh)

    // CO2 avoided (pilot ratio ~1.2 tons CO2e per ton processed)
    const co2Avoided = tons * 1.2

    outYield.textContent = format(monomerYieldTons)
    outEnergyNew.textContent = format(newMWh)
    outEnergySaved.textContent = format(savedMWh)
    outCO2.textContent = format(co2Avoided)

    // Bars: old = 100%, new proportional to energyFactor
    barOld.style.width = "100%"
    barNew.style.width = Math.max(4, Math.min(100, energyFactor * 100)) + "%"

    // Range outputs
    rTons.textContent = String(tons)
    rContam.textContent = String(contamPct)
  }

  ;[tonsEl, contamEl, streamEl, baselineEl].forEach((el) => {
    el.addEventListener("input", calc)
    el.addEventListener("change", calc)
  })

  // Initialize
  calc()
})()

