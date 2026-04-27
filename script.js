const header = document.querySelector(".site-header");
const floatingSidebar = document.querySelector(".floating-sidebar");
const sidebarLinks = Array.from(document.querySelectorAll(".floating-sidebar [data-section-link]"));
const sidebarSectionIds = ["servicos", "processo", "tecnologias", "time", "agendar", "contato"];
const sidebarSections = sidebarSectionIds
  .map((id) => document.getElementById(id))
  .filter(Boolean);
const introSection = document.querySelector(".intro-video-section");
const heroSection = document.querySelector(".hero-section");
const introVideo = document.querySelector(".intro-video");
const scrollCue = document.querySelector(".scroll-cue");
const canvas = document.querySelector(".bg-canvas");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const prefersCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
const isCompactViewport = () => window.matchMedia("(max-width: 900px)").matches;
const hasLowCpu = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
const hasSaveData = Boolean(navigator.connection && navigator.connection.saveData);
const canUsePointerHover = () => window.matchMedia("(pointer: fine) and (hover: hover)").matches;

let introRevealY = Math.max(220, window.innerHeight * 0.55);
let sidebarSectionTops = [];
let scrollScheduled = false;

const recalculateScrollAnchors = () => {
  const headerHeight = header ? header.offsetHeight : 0;
  const revealOffset = Math.max(56, headerHeight + 10);

  if (introSection) {
    introRevealY = (introSection.offsetTop + introSection.offsetHeight) - revealOffset;
  } else if (heroSection) {
    introRevealY = Math.max(0, heroSection.offsetTop - revealOffset);
  } else {
    introRevealY = Math.max(220, window.innerHeight * 0.55);
  }

  sidebarSectionTops = sidebarSections.map((section) => ({
    id: section.id,
    top: section.offsetTop,
  }));
};

const hasPassedAnimatedBackground = () => {
  if (!header) return false;
  return window.scrollY >= introRevealY;
};

const onScroll = () => {
  if (!header) return;

  const hasPassedIntro = hasPassedAnimatedBackground();

  header.classList.toggle("is-visible", hasPassedIntro);
  header.classList.toggle("is-scrolled", hasPassedIntro && window.scrollY > 16);

  if (floatingSidebar) {
    floatingSidebar.classList.toggle("is-visible", hasPassedIntro);
  }

  if (sidebarSections.length && sidebarLinks.length) {
    const markerY = window.scrollY + (window.innerHeight * 0.4);
    let activeId = sidebarSectionTops.length ? sidebarSectionTops[0].id : "";

    sidebarSectionTops.forEach((section) => {
      if (section.top <= markerY) {
        activeId = section.id;
      }
    });

    sidebarLinks.forEach((link) => {
      const isActive = link.dataset.sectionLink === activeId;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }
};

const requestScrollUpdate = () => {
  if (scrollScheduled) return;
  scrollScheduled = true;

  window.requestAnimationFrame(() => {
    scrollScheduled = false;
    onScroll();
  });
};

const createIntroAutoScroll = () => {
  if (!heroSection) return;

  let hasAutoScrolled = false;

  const revealHeaderNow = () => {
    if (!header) return;
    header.classList.add("is-visible");
    if (window.scrollY > 16) {
      header.classList.add("is-scrolled");
    }
  };

  const goToHero = () => {
    if (hasAutoScrolled) return;
    hasAutoScrolled = true;

    heroSection.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });

    window.setTimeout(() => {
      onScroll();
      revealHeaderNow();
    }, prefersReducedMotion ? 0 : 360);
  };

  if (scrollCue) {
    scrollCue.addEventListener("click", goToHero);
  }

  if (!introVideo) return;

  introVideo.addEventListener("ended", goToHero, { once: true });
};

const createCursorEffect = () => {
  if (prefersReducedMotion) return;
  if (!canUsePointerHover()) return;

  const glow = document.querySelector(".cursor-glow");
  const dot = document.querySelector(".cursor-dot");

  if (!glow || !dot) return;

  const state = {
    currentX: window.innerWidth / 2,
    currentY: window.innerHeight / 2,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
  };

  const update = () => {
    state.currentX += (state.targetX - state.currentX) * 0.18;
    state.currentY += (state.targetY - state.currentY) * 0.18;

    glow.style.transform = `translate3d(${state.currentX}px, ${state.currentY}px, 0)`;
    dot.style.transform = `translate3d(${state.targetX}px, ${state.targetY}px, 0)`;

    window.requestAnimationFrame(update);
  };

  window.addEventListener("pointermove", (event) => {
    state.targetX = event.clientX;
    state.targetY = event.clientY;
    document.body.classList.add("cursor-active");
  }, { passive: true });

  document.querySelectorAll("a, button, input, textarea, [role='button']").forEach((element) => {
    element.addEventListener("pointerenter", () => {
      document.body.classList.add("cursor-hover");
    });

    element.addEventListener("pointerleave", () => {
      document.body.classList.remove("cursor-hover");
    });
  });

  document.addEventListener("pointerleave", () => {
    document.body.classList.remove("cursor-active");
    document.body.classList.remove("cursor-hover");
  });

  window.requestAnimationFrame(update);
};

const createCanvasBackground = () => {
  // Disable canvas entirely on touch/mobile devices — big GPU win
  if (!canvas || prefersReducedMotion || prefersCoarsePointer) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  let rafId = 0;
  let isAnimating = false;

  // Static gradients cached on resize — not recreated every frame
  let cachedBase = null;
  let cachedAccent = null;
  let cachedLeftShade = null;

  const getPerfProfile = () => {
    return hasLowCpu || hasSaveData
      ? { dprCap: 1.0, spacingDivisor: 8, minSpacing: 90, frameMs: 1000 / 18, drawMesh: false }
      : { dprCap: 1.5, spacingDivisor: 14, minSpacing: 62, frameMs: 1000 / 28, drawMesh: false };
  };

  const state = {
    width: 0, height: 0, dpr: 1,
    columns: [], pulse: 0, lastFrameTime: 0,
    profile: getPerfProfile(),
  };

  const palette = ["0,229,255", "255,184,0", "0,255,65", "224,224,224"];

  const snippets = [
    "> init 404devs", "> deploy --prod", "> ship feature",
    "> npm run build", "> pnpm dev", "> git push origin main",
    "Error 404", "BUG DETECTED", "stack trace",
    "UnhandledError", "ERR_MODULE_NOT_FOUND", "Promise rejected",
    "route: /not-found", "{ status: 404 }", "logs streaming...",
    "compile success", "patch applied", "system online",
  ];

  const randomBetween = (min, max) => min + Math.random() * (max - min);

  const getColumnSpacing = () => Math.max(
    state.profile.minSpacing,
    Math.floor(state.width / state.profile.spacingDivisor)
  );

  const createColumn = (index, spacing) => {
    const size = randomBetween(11, 16);
    return {
      x: index * spacing + randomBetween(-8, 8),
      y: randomBetween(-state.height, state.height),
      speed: randomBetween(0.3, 0.9),
      size,
      alpha: randomBetween(0.07, 0.2),
      color: palette[Math.floor(Math.random() * palette.length)],
      text: snippets[Math.floor(Math.random() * snippets.length)],
    };
  };

  const rebuildGradients = () => {
    cachedBase = context.createLinearGradient(0, 0, state.width, state.height);
    cachedBase.addColorStop(0, "rgba(0,0,0,0.995)");
    cachedBase.addColorStop(0.32, "rgba(3,3,3,0.99)");
    cachedBase.addColorStop(0.68, "rgba(2,4,4,0.985)");
    cachedBase.addColorStop(1, "rgba(0,0,0,0.995)");

    cachedAccent = context.createLinearGradient(0, 0, state.width, 0);
    cachedAccent.addColorStop(0, "rgba(255,184,0,0.022)");
    cachedAccent.addColorStop(0.28, "rgba(255,184,0,0.008)");
    cachedAccent.addColorStop(0.62, "rgba(0,255,65,0.01)");
    cachedAccent.addColorStop(1, "rgba(0,229,255,0.025)");

    cachedLeftShade = context.createLinearGradient(0, 0, state.width * 0.42, 0);
    cachedLeftShade.addColorStop(0, "rgba(0,0,0,0.28)");
    cachedLeftShade.addColorStop(0.45, "rgba(0,0,0,0.12)");
    cachedLeftShade.addColorStop(1, "rgba(0,0,0,0)");
  };

  const resize = () => {
    state.width = Math.max(window.innerWidth, 1);
    state.height = Math.max(window.innerHeight, 1);
    state.profile = getPerfProfile();
    state.dpr = Math.min(window.devicePixelRatio || 1, state.profile.dprCap);

    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    rebuildGradients();

    const spacing = getColumnSpacing();
    const nextCount = Math.ceil(state.width / spacing) + 2;
    state.columns = Array.from({ length: nextCount }, (_, index) => createColumn(index, spacing));
  };

  const ensureCanvasSize = () => {
    const nw = Math.max(window.innerWidth, 1);
    const nh = Math.max(window.innerHeight, 1);
    if (nw !== state.width || nh !== state.height || canvas.width === 0) resize();
  };

  const tick = (time = 0) => {
    if (document.hidden) { isAnimating = false; rafId = 0; return; }
    if (time - state.lastFrameTime < state.profile.frameMs) {
      rafId = window.requestAnimationFrame(tick);
      return;
    }
    state.lastFrameTime = time;
    ensureCanvasSize();
    state.pulse += 0.008;

    context.clearRect(0, 0, state.width, state.height);

    // Cached static backgrounds
    context.fillStyle = cachedBase;
    context.fillRect(0, 0, state.width, state.height);
    context.fillStyle = cachedAccent;
    context.fillRect(0, 0, state.width, state.height);
    context.fillStyle = cachedLeftShade;
    context.fillRect(0, 0, state.width * 0.42, state.height);

    context.textBaseline = "top";
    context.shadowBlur = 0; // No shadowBlur — GPU win

    state.columns.forEach((column, index) => {
      column.y += column.speed;
      if (column.y > state.height + 80) {
        const spacing = getColumnSpacing();
        state.columns[index] = createColumn(index, spacing);
        state.columns[index].y = randomBetween(-200, -30);
        return;
      }

      context.font = `${column.size}px "IBM Plex Mono", monospace`;
      context.fillStyle = `rgba(${column.color},${Math.min(column.alpha * 1.2, 0.3)})`;
      context.fillText(column.text, column.x, column.y);
    });

    rafId = window.requestAnimationFrame(tick);
  };

  const startAnimation = () => {
    if (isAnimating || document.hidden) return;
    isAnimating = true;
    state.lastFrameTime = 0;
    rafId = window.requestAnimationFrame(tick);
  };

  const stopAnimation = () => {
    if (!rafId) return;
    window.cancelAnimationFrame(rafId);
    rafId = 0;
    isAnimating = false;
  };

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("orientationchange", () => { resize(); startAnimation(); }, { passive: true });
  window.addEventListener("pageshow", () => { resize(); startAnimation(); });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { stopAnimation(); return; }
    resize(); startAnimation();
  });
  canvas.addEventListener("contextlost", (event) => { event.preventDefault(); stopAnimation(); });
  canvas.addEventListener("contextrestored", () => { resize(); startAnimation(); });

  resize();
  startAnimation();
};

const createGsapAnimations = () => {
  if (prefersReducedMotion) return;
  if (typeof window.gsap === "undefined") return;
  if (isCompactViewport() || prefersCoarsePointer || hasSaveData) return;

  const { gsap } = window;
  const { ScrollTrigger } = window;

  if (ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  document.documentElement.classList.add("motion-ready");

  gsap.from(".site-header", {
    y: -72,
    opacity: 0,
    delay: 1.3,
    duration: 0.9,
    ease: "power3.out",
  });

  const heroTimeline = gsap.timeline({
    defaults: {
      ease: "power3.out",
      duration: 0.95,
    },
  });

  heroTimeline
    .to(".hero-copy, .hero-panel", { opacity: 1, x: 0, y: 0, duration: 0.01 })
    .from(".hero-copy .eyebrow", { y: 24 }, 0)
    .from(".hero-title", { y: 54, scale: 0.98 }, 0.08)
    .from(".hero-subtitle", { y: 28 }, 0.16)
    .from(".hero-text", { y: 24 }, 0.24)
    .from(".hero-actions .button", { y: 16, stagger: 0.1 }, 0.32)
    .from(".hero-metrics .metric-card", { y: 18, stagger: 0.08 }, 0.38)
    .from(".hero-panel .panel-frame", { x: 40, rotateY: -8 }, 0.16);

  gsap.to(".ambient-one", {
    x: 36,
    y: -28,
    duration: 10,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.to(".ambient-two", {
    x: -32,
    y: 20,
    duration: 9,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.set("[data-reveal]", { x: 0, y: 26 });
  gsap.set('[data-reveal="left"]', { x: 28, y: 0 });

  if (ScrollTrigger) {
    gsap.to(".intro-video-sticky", {
      opacity: 0,
      scale: 1.04,
      ease: "none",
      scrollTrigger: {
        trigger: ".intro-video-section",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.fromTo(
      ".intro-video-copy",
      { y: 0, opacity: 1 },
      {
        y: -32,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".intro-video-section",
          start: "top top",
          end: "52% top",
          scrub: true,
        },
      }
    );

    gsap.fromTo(
      ".section-transition-intro .transition-track",
      { scaleX: 0.22, opacity: 0.22 },
      {
        scaleX: 1,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".section-transition-intro",
          start: "top 90%",
          end: "bottom 45%",
          scrub: true,
        },
      }
    );

    gsap.fromTo(
      ".section-transition-intro .transition-glow",
      { scale: 0.6, opacity: 0.12 },
      {
        scale: 1.15,
        opacity: 0.34,
        ease: "none",
        scrollTrigger: {
          trigger: ".section-transition-intro",
          start: "top 90%",
          end: "bottom 45%",
          scrub: true,
        },
      }
    );

    gsap.fromTo(
      ".section-transition-intro .transition-sweep",
      { xPercent: -180, opacity: 0.2 },
      {
        xPercent: 180,
        opacity: 0.95,
        ease: "none",
        scrollTrigger: {
          trigger: ".section-transition-intro",
          start: "top 95%",
          end: "bottom 40%",
          scrub: true,
        },
      }
    );

    gsap.fromTo(
      ".hero-section",
      { y: 68, opacity: 0.18, scale: 0.985 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".intro-video-section",
          start: "24% top",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  }

  document.querySelectorAll("[data-reveal]").forEach((element) => {
    const delay = Number(element.dataset.delay || 0) / 1000;

    gsap.to(element, {
      opacity: 1,
      x: 0,
      y: 0,
      delay,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: ScrollTrigger
        ? {
            trigger: element,
            start: "top 84%",
            once: true,
          }
        : undefined,
    });
  });

  if (ScrollTrigger) {
    gsap.utils.toArray(".section-transition").forEach((transition) => {
      if (transition.classList.contains("section-transition-intro")) return;

      const nextSection = transition.nextElementSibling;
      const track = transition.querySelector(".transition-track");
      const glow = transition.querySelector(".transition-glow");
      const sweep = transition.querySelector(".transition-sweep");

      if (track) {
        gsap.fromTo(
          track,
          { scaleX: 0.28, opacity: 0.2 },
          {
            scaleX: 1,
            opacity: 0.9,
            ease: "none",
            scrollTrigger: {
              trigger: transition,
              start: "top 92%",
              end: "bottom 48%",
              scrub: true,
            },
          }
        );
      }

      if (glow) {
        gsap.fromTo(
          glow,
          { scale: 0.72, opacity: 0.08 },
          {
            scale: 1.08,
            opacity: 0.24,
            ease: "none",
            scrollTrigger: {
              trigger: transition,
              start: "top 92%",
              end: "bottom 48%",
              scrub: true,
            },
          }
        );
      }

      if (sweep) {
        gsap.fromTo(
          sweep,
          { xPercent: -180, opacity: 0.12 },
          {
            xPercent: 180,
            opacity: 0.8,
            ease: "none",
            scrollTrigger: {
              trigger: transition,
              start: "top 95%",
              end: "bottom 44%",
              scrub: true,
            },
          }
        );
      }

      if (nextSection && nextSection.classList.contains("section")) {
        gsap.fromTo(
          nextSection,
          { y: 42, opacity: 0.55, scale: 0.992 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: transition,
              start: "top 88%",
              end: "bottom 34%",
              scrub: true,
            },
          }
        );
      }
    });

    gsap.utils.toArray(".section-heading").forEach((heading) => {
      gsap.fromTo(
        heading,
        { y: 18 },
        {
          y: -8,
          ease: "none",
          scrollTrigger: {
            trigger: heading,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });

    gsap.fromTo(
      ".bg-canvas",
      { opacity: 0.55 },
      {
        opacity: 0.85,
        ease: "none",
        scrollTrigger: {
          trigger: "main",
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      }
    );

    gsap.fromTo(
      ".showcase-scissors",
      { rotate: 52, x: 0, y: 0 },
      {
        rotate: 52,
        x: -20,
        y: 30,
        ease: "none",
        scrollTrigger: {
          trigger: ".showcase-section",
          start: "top 80%",
          end: "bottom 20%",
          scrub: true,
        },
      }
    );

    gsap.to(".showcase-scissors", {
      scale: 1.08,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.fromTo(
      ".showcase-device__screen",
      { rotateY: -30, rotateX: 12 },
      {
        rotateY: 30,
        rotateX: -12,
        ease: "none",
        scrollTrigger: {
          trigger: ".showcase-section",
          start: "top 80%",
          end: "bottom 20%",
          scrub: true,
        },
      }
    );
  }
};

const createCardHoverEffects = () => {
  if (!canUsePointerHover()) return;

  const cards = document.querySelectorAll(
    ".metric-card, .content-card, .tech-card, .testimonial-card, .process-item, .display-grid article, .stack-line, .tech-summary, .cta-card, .team-card"
  );

  cards.forEach((card) => {
    let raf = 0;
    let pointerEvent = null;

    const render = () => {
      if (!pointerEvent) { raf = 0; return; }

      const rect = card.getBoundingClientRect();
      const x = pointerEvent.clientX - rect.left;
      const y = pointerEvent.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 6;
      const rotateX = (0.5 - (y / rect.height)) * 6;

      card.style.setProperty("--card-glow-x", `${x}px`);
      card.style.setProperty("--card-glow-y", `${y}px`);
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
      raf = 0;
    };

    card.addEventListener("pointerenter", () => {
      card.style.willChange = "transform";
    }, { passive: true });

    card.addEventListener("pointermove", (event) => {
      pointerEvent = event;
      if (raf) return;
      raf = window.requestAnimationFrame(render);
    }, { passive: true });

    card.addEventListener("pointerdown", () => {
      pointerEvent = null;
      if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
    });

    card.addEventListener("pointerleave", () => {
      pointerEvent = null;
      if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
      card.style.transform = "";
      card.style.willChange = "";
    });
  });
};

const createTeamSwiper = () => {
  if (typeof window.Swiper === "undefined") return;
  if (!document.querySelector(".team-swiper")) return;

  new window.Swiper(".team-swiper", {
    effect: "coverflow",
    grabCursor: false,
    centeredSlides: true,
    slidesPerView: "auto",
    loop: true,
    initialSlide: 0,
    speed: 800,
    allowTouchMove: true,
    simulateTouch: true,
    watchSlidesProgress: true,
    watchSlidesVisibility: true,
    observer: true,
    observeParents: true,
    loopAdditionalSlides: 4,
    loopedSlides: 4,
    coverflowEffect: {
      rotate: 40,
      stretch: 0,
      depth: 150,
      modifier: 1,
      slideShadows: true,
    },
    autoplay: {
      delay: 3000,
      reverseDirection: true,
      disableOnInteraction: false,
      pauseOnMouseEnter: false,
      stopOnLastSlide: false,
    },
    pagination: {
      el: ".team-swiper-pagination",
      clickable: true,
    },
    on: {
      init(swiper) {
        swiper.slideToLoop(0, 0, false);
        swiper.update();
        swiper.updateSlidesClasses();

        window.requestAnimationFrame(() => {
          swiper.update();
          swiper.updateSlidesClasses();
        });
      },
      imagesReady(swiper) {
        swiper.update();
        swiper.updateSlidesClasses();
      },
    },
    breakpoints: {
      0: {
        slidesPerView: 1.1,
        centeredSlides: true,
      },
      640: {
        slidesPerView: 1.4,
        centeredSlides: true,
      },
      960: {
        slidesPerView: "auto",
        centeredSlides: true,
        allowTouchMove: false,
        simulateTouch: false,
      },
    },
  });
};

recalculateScrollAnchors();
onScroll();

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", () => {
  recalculateScrollAnchors();
  requestScrollUpdate();
}, { passive: true });
window.addEventListener("orientationchange", () => {
  recalculateScrollAnchors();
  requestScrollUpdate();
}, { passive: true });
window.addEventListener("load", () => {
  recalculateScrollAnchors();
  onScroll();
});
window.addEventListener("pageshow", () => {
  recalculateScrollAnchors();
  onScroll();
});

createCanvasBackground();
createCursorEffect();
createIntroAutoScroll();
createGsapAnimations();
createCardHoverEffects();
createTeamSwiper();

const createGlitchParticles = () => {
  if (prefersReducedMotion) return;

  const panelFrame = document.querySelector(".hero-panel .panel-frame");
  if (!panelFrame) return;

  /* Fixed canvas — covers viewport, bypasses all clipping */
  const cvs = document.createElement("canvas");
  cvs.setAttribute("aria-hidden", "true");
  cvs.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9998;";
  document.body.appendChild(cvs);

  const ctx = cvs.getContext("2d");
  let particles = [];
  let rafId     = null;   // null = loop stopped (idle)

  const WORDS  = ["404", "ERRO", "NULL", "ERR!", "BUG", "0x0", "FAIL", "???"];
  const COLORS = [
    [0, 229, 255],   // cyan
    [255, 184, 0],   // gold
    [0, 255, 65],    // matrix green
    [255, 50, 100],  // red
    [255, 255, 255], // white
  ];

  const resize = () => {
    cvs.width  = window.innerWidth;
    cvs.height = window.innerHeight;
  };

  const isPanelVisible = () => {
    const r = panelFrame.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  };

  const spawnBurst = (minCount = 4, maxCount = 7) => {
    if (!isPanelVisible()) return;

    const fr = panelFrame.getBoundingClientRect();
    const ox = fr.left, oy = fr.top, fw = fr.width, fh = fr.height;
    const count = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));

    for (let i = 0; i < count; i++) {
      const word  = WORDS[Math.floor(Math.random() * WORDS.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size  = 10 + Math.random() * 12;
      const edge  = Math.floor(Math.random() * 4);
      let spawnX, spawnY, baseAngle;

      switch (edge) {
        case 0: spawnX = ox + Math.random() * fw; spawnY = oy;      baseAngle = -Math.PI / 2; break;
        case 1: spawnX = ox + fw; spawnY = oy + Math.random() * fh; baseAngle = 0;             break;
        case 2: spawnX = ox + Math.random() * fw; spawnY = oy + fh;  baseAngle = Math.PI / 2;  break;
        default:spawnX = ox;      spawnY = oy + Math.random() * fh; baseAngle = Math.PI;       break;
      }

      const angle = baseAngle + (Math.random() - 0.5) * (Math.PI * 110 / 180);
      const speed = 2.0 + Math.random() * 3.5;

      particles.push({
        x: spawnX, y: spawnY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        word, color, size,
        life:  1.0,
        decay: 0.03 + Math.random() * 0.025,
        rot:   (Math.random() - 0.5) * 0.6,
        rotV:  (Math.random() - 0.5) * 0.06,
        skew:  (Math.random() - 0.5) * 0.28,
      });
    }

    startLoop(); // wake up rAF only when we have particles
  };

  /* Render loop — self-stops when particles array empties */
  const loop = () => {
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x   += p.vx;
      p.y   += p.vy;
      p.vy  += 0.05;
      p.life -= p.decay;
      p.rot  += p.rotV;

      if (p.life <= 0) { particles.splice(i, 1); continue; }

      const a = Math.max(0, p.life);
      const [r, g, b] = p.color;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.transform(1, 0, p.skew, 1, 0, 0);

      ctx.font         = `bold ${p.size}px "IBM Plex Mono", monospace`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      /* No shadowBlur — big GPU win */
      ctx.fillStyle = `rgba(${r},${g},${b},${a.toFixed(2)})`;
      ctx.fillText(p.word, 0, 0);
      ctx.restore();
    }

    if (particles.length > 0) {
      rafId = requestAnimationFrame(loop);
    } else {
      rafId = null; // stop — no canvas work until next burst
    }
  };

  const startLoop = () => {
    if (rafId === null) rafId = requestAnimationFrame(loop);
  };

  /* Sync with CSS: 6s cycle, burst at 64% = 3840ms */
  const CYCLE  = 6000;
  const OFFSET = 3840;

  const syncAndStart = () => {
    const delay = (OFFSET - (Date.now() % CYCLE) + CYCLE) % CYCLE;
    setTimeout(() => {
      spawnBurst();
      setInterval(spawnBurst, CYCLE);
    }, delay);
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });
  syncAndStart();
};

createGlitchParticles();

const createScheduleForm = () => {
  const form     = document.getElementById("schedule-form");
  const btn      = document.getElementById("schedule-submit");
  const feedback = document.getElementById("schedule-feedback");
  if (!form) return;

  const setFeedback = (msg, isError = false) => {
    if (!feedback) return;
    feedback.textContent = msg;
    feedback.className   = "form-feedback" + (isError ? " is-error" : "");
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name    = document.getElementById("call-name")?.value.trim()    ?? "";
    const email   = document.getElementById("call-email")?.value.trim()   ?? "";
    const time    = document.getElementById("call-time")?.value.trim()    ?? "";
    const project = document.getElementById("call-project")?.value.trim() ?? "";

    /* Basic validation */
    if (!name) {
      setFeedback("Por favor, informe seu nome.", true);
      document.getElementById("call-name")?.focus();
      return;
    }
    if (!email || !/^[^\s@]+@[^^\s@]+\.[^\s@]+$/.test(email)) {
      setFeedback("Informe um e-mail válido para contato.", true);
      document.getElementById("call-email")?.focus();
      return;
    }

    /* Build mailto */
    const subject = `[Call Request] ${name} — 404Devs`;
    const body = [
      `Olá, time 404Devs!`,
      ``,
      `Gostaria de agendar uma call para conversar sobre meu projeto.`,
      ``,
      `📋 Dados do solicitante`,
      `Nome: ${name}`,
      `E-mail de resposta: ${email}`,
      `Melhor horário: ${time || "Não especificado"}`,
      ``,
      `📌 Objetivo do projeto`,
      project || "Não especificado",
      ``,
      `---`,
      `Mensagem enviada pelo formulário do site 404Devs.`,
    ].join("\n");

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1`
      + `&to=${encodeURIComponent("404devsoficial@gmail.com")}`
      + `&su=${encodeURIComponent(subject)}`
      + `&body=${encodeURIComponent(body)}`;

    window.open(gmailUrl, "_blank", "noopener,noreferrer");

    /* Visual feedback */
    if (btn) {
      btn.textContent = "✔ E-mail pronto! Confira seu cliente de e-mail.";
      btn.classList.add("is-sent");
    }
    setFeedback("✔ Janela de e-mail aberta com os dados preenchidos.");

    setTimeout(() => {
      if (btn) {
        btn.textContent = "Abrir e-mail para agendar";
        btn.classList.remove("is-sent");
      }
      setFeedback("");
    }, 6000);
  });
};

createScheduleForm();

