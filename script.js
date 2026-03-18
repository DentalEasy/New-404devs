const header = document.querySelector(".site-header");
const canvas = document.querySelector(".bg-canvas");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canUsePointerHover = () => window.matchMedia("(pointer: fine) and (hover: hover)").matches;
const isCompactViewport = () => window.matchMedia("(max-width: 900px)").matches;

const onScroll = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 16);
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
  if (!canvas || prefersReducedMotion) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  let rafId = 0;
  let isAnimating = false;
  let frameInterval = isCompactViewport() ? (1000 / 24) : (1000 / 30);

  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    columns: [],
    pulse: 0,
    lastFrameAt: 0,
  };

  const palette = [
    "0,229,255",
    "255,184,0",
    "0,255,65",
    "224,224,224",
  ];

  const snippets = [
    "> init 404devs",
    "> deploy --prod",
    "> ship feature",
    "> npm run build",
    "> pnpm dev",
    "> git push origin main",
    "Error 404",
    "BUG DETECTED",
    "stack trace",
    "UnhandledError",
    "ERR_MODULE_NOT_FOUND",
    "Promise rejected",
    "route: /not-found",
    "{ status: 404 }",
    "logs streaming...",
    "compile success",
    "patch applied",
    "system online",
    "prompt -> build",
    "fixing layout shift",
    "reconnecting...",
    "launch sequence",
  ];

  const randomBetween = (min, max) => min + Math.random() * (max - min);

  const getColumnSpacing = () => {
    if (state.width <= 900) {
      return Math.max(76, Math.floor(state.width / 10));
    }

    return Math.max(56, Math.floor(state.width / 18));
  };

  const createColumn = (index, spacing) => {
    const size = randomBetween(12, 18);
    return {
      x: index * spacing + randomBetween(-8, 8),
      y: randomBetween(-state.height, state.height),
      speed: randomBetween(0.35, 1.1),
      size,
      alpha: randomBetween(0.08, 0.22),
      color: palette[Math.floor(Math.random() * palette.length)],
      text: snippets[Math.floor(Math.random() * snippets.length)],
      shift: Math.random() > 0.6,
    };
  };

  const resize = () => {
    state.width = Math.max(window.innerWidth, 1);
    state.height = Math.max(window.innerHeight, 1);
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    frameInterval = state.width <= 900 ? (1000 / 24) : (1000 / 30);

    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    const spacing = getColumnSpacing();
    const nextCount = Math.ceil(state.width / spacing) + 3;
    state.columns = Array.from({ length: nextCount }, (_, index) => createColumn(index, spacing));
  };

  const ensureCanvasSize = () => {
    const nextWidth = Math.max(window.innerWidth, 1);
    const nextHeight = Math.max(window.innerHeight, 1);

    if (nextWidth !== state.width || nextHeight !== state.height || canvas.width === 0 || canvas.height === 0) {
      resize();
    }
  };

  const tick = (time = 0) => {
    if (document.hidden) {
      isAnimating = false;
      return;
    }

    if (time - state.lastFrameAt < frameInterval) {
      rafId = window.requestAnimationFrame(tick);
      return;
    }

    state.lastFrameAt = time;
    ensureCanvasSize();

    state.pulse += 0.008;
    context.clearRect(0, 0, state.width, state.height);

    const baseGradient = context.createLinearGradient(0, 0, state.width, state.height);
    baseGradient.addColorStop(0, "rgba(0,0,0,0.995)");
    baseGradient.addColorStop(0.32, "rgba(3,3,3,0.99)");
    baseGradient.addColorStop(0.68, "rgba(2,4,4,0.985)");
    baseGradient.addColorStop(1, "rgba(0,0,0,0.995)");
    context.fillStyle = baseGradient;
    context.fillRect(0, 0, state.width, state.height);

    const accentGradient = context.createLinearGradient(0, 0, state.width, 0);
    accentGradient.addColorStop(0, "rgba(255,184,0,0.022)");
    accentGradient.addColorStop(0.28, "rgba(255,184,0,0.008)");
    accentGradient.addColorStop(0.62, "rgba(0,255,65,0.01)");
    accentGradient.addColorStop(1, "rgba(0,229,255,0.025)");
    context.fillStyle = accentGradient;
    context.fillRect(0, 0, state.width, state.height);

    const pulseGlow = context.createRadialGradient(
      state.width * 0.52,
      state.height * 0.34,
      0,
      state.width * 0.52,
      state.height * 0.34,
      Math.max(state.width, state.height) * 0.42
    );
    pulseGlow.addColorStop(0, `rgba(0,229,255,${0.022 + Math.sin(state.pulse) * 0.006})`);
    pulseGlow.addColorStop(0.45, "rgba(0,255,65,0.012)");
    pulseGlow.addColorStop(0.7, "rgba(255,184,0,0.01)");
    pulseGlow.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = pulseGlow;
    context.fillRect(0, 0, state.width, state.height);

    const leftShade = context.createLinearGradient(0, 0, state.width * 0.42, 0);
    leftShade.addColorStop(0, "rgba(0,0,0,0.28)");
    leftShade.addColorStop(0.45, "rgba(0,0,0,0.12)");
    leftShade.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = leftShade;
    context.fillRect(0, 0, state.width * 0.42, state.height);

    context.textBaseline = "top";
    context.lineWidth = 1;

    const drawLinkMesh = state.width > 980;
    const shadowBlurStrength = state.width <= 900 ? 10 : 16;

    state.columns.forEach((column, index) => {
      column.y += column.speed;

      if (column.y > state.height + 80) {
        const spacing = getColumnSpacing();
        state.columns[index] = createColumn(index, spacing);
        state.columns[index].y = randomBetween(-220, -40);
      }

      const current = state.columns[index];
      context.font = `${current.size}px "IBM Plex Mono", monospace`;

      const fadeHeight = current.size * 5.2;
      const tailGradient = context.createLinearGradient(
        current.x,
        current.y - fadeHeight,
        current.x,
        current.y + current.size * 1.2
      );
      tailGradient.addColorStop(0, "rgba(0,0,0,0)");
      tailGradient.addColorStop(0.35, `rgba(${current.color},${current.alpha * 0.32})`);
      tailGradient.addColorStop(1, `rgba(${current.color},${current.alpha * 1.15})`);

      context.fillStyle = tailGradient;
      context.fillRect(current.x - 10, current.y - fadeHeight, 2, fadeHeight + current.size * 1.2);

      context.shadowBlur = shadowBlurStrength;
      context.shadowColor = `rgba(${current.color},0.18)`;
      context.fillStyle = `rgba(${current.color},${Math.min(current.alpha * 1.28, 0.34)})`;
      context.fillText(current.text, current.x, current.y);

      if (current.shift) {
        context.fillStyle = `rgba(224,224,224,${Math.min(current.alpha * 0.75, 0.28)})`;
        context.fillText(">", current.x - 14, current.y);
      }
      context.shadowBlur = 0;

      if (drawLinkMesh && index < state.columns.length - 1) {
        const next = state.columns[index + 1];
        if (Math.abs(current.y - next.y) < 90) {
          context.beginPath();
          context.moveTo(current.x + 10, current.y + current.size * 0.7);
          context.lineTo(next.x - 10, next.y + next.size * 0.7);
          context.strokeStyle = `rgba(0,229,255,0.045)`;
          context.stroke();
        }
      }
    });

    rafId = window.requestAnimationFrame(tick);
  };

  const startAnimation = () => {
    if (isAnimating || document.hidden) return;
    isAnimating = true;
    state.lastFrameAt = 0;
    tick();
  };

  const stopAnimation = () => {
    if (!rafId) return;
    window.cancelAnimationFrame(rafId);
    rafId = 0;
    isAnimating = false;
  };

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("orientationchange", () => {
    resize();
    startAnimation();
  }, { passive: true });

  window.addEventListener("pageshow", () => {
    resize();
    startAnimation();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAnimation();
      return;
    }

    resize();
    startAnimation();
  });

  canvas.addEventListener("contextlost", (event) => {
    event.preventDefault();
    stopAnimation();
  });

  canvas.addEventListener("contextrestored", () => {
    resize();
    startAnimation();
  });

  resize();
  startAnimation();
};

const createGsapAnimations = () => {
  if (prefersReducedMotion) return;
  if (typeof window.gsap === "undefined") return;
  if (isCompactViewport()) return;

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

  gsap.to(".hero-panel .panel-frame", {
    y: -12,
    duration: 3.8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

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
  }
};

const createCardHoverEffects = () => {
  if (prefersReducedMotion) return;
  if (!canUsePointerHover()) return;

  const cards = document.querySelectorAll(
    ".metric-card, .content-card, .tech-card, .testimonial-card, .process-item, .display-grid article, .stack-line, .tech-summary, .cta-card, .team-card"
  );

  cards.forEach((card) => {
    let raf = 0;
    let pointerEvent = null;

    const render = () => {
      if (!pointerEvent) {
        raf = 0;
        return;
      }

      const rect = card.getBoundingClientRect();
      const x = pointerEvent.clientX - rect.left;
      const y = pointerEvent.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 8;
      const rotateX = (0.5 - (y / rect.height)) * 8;

      card.style.setProperty("--card-glow-x", `${x}px`);
      card.style.setProperty("--card-glow-y", `${y}px`);
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      raf = 0;
    };

    card.addEventListener("pointermove", (event) => {
      pointerEvent = event;
      if (raf) return;
      raf = window.requestAnimationFrame(render);
    }, { passive: true });

    card.addEventListener("pointerleave", () => {
      pointerEvent = null;
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
      card.style.transform = "";
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

createCanvasBackground();
createCursorEffect();
createGsapAnimations();
createCardHoverEffects();
createTeamSwiper();
onScroll();

window.addEventListener("scroll", onScroll, { passive: true });
