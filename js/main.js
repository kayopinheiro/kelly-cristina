/*
  Kelly Cristina — Site
  Animações (GSAP ScrollTrigger + smoke cursor) entram só depois que o layout
  estático de todas as seções estiver validado contra o Figma — ver CLAUDE.md
  ("Nunca aplicar essas animações antes do layout estático estar 100% fiel").

  TODO (próxima etapa, após aprovação do layout estático):
  1. Text reveal on scroll — GSAP ScrollTrigger, split de linha nos elementos
     [data-reveal="lines"], stagger de opacity + translateY.
     Ref: https://demos.gsap.com/demo/responsive-line-splits-on-scroll/
*/

document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  // Hero — parallax na imagem de fundo: a imagem entra escalada (1.15) para
  // sobrar margem e desliza mais devagar que o scroll (yPercent) enquanto o
  // hero passa pela viewport, dando profundidade ao fundo.
  const heroBg = document.querySelector(".hero__bg");
  if (heroBg) {
    gsap.set(heroBg, { scale: 1.08, transformOrigin: "50% 100%" });
    gsap.to(heroBg, {
      yPercent: 8,
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  // Text fill on scroll — palavras vão de cinza (--color-gray-200) a escuro
  // (--color-dark) conforme a seção rola pela viewport (node Figma 2144:2522).
  const rootStyles = getComputedStyle(document.documentElement);
  const mutedColor = rootStyles.getPropertyValue("--color-gray-200").trim();
  const darkColor = rootStyles.getPropertyValue("--color-dark").trim();

  document.querySelectorAll('[data-reveal="fill"]').forEach((el) => {
    const words = el.querySelectorAll(".word");
    gsap.set(words, { color: mutedColor });
    gsap.to(words, {
      color: darkColor,
      stagger: 0.05,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        end: "bottom 55%",
        scrub: true,
      },
    });
  });

  // Stack de 3 imagens com pin no scroll — mesmo mecanismo da seção de
  // cards do lassie.ai (pin:true + timeline com scrub): cada imagem entra
  // atrás em escala reduzida ("espiando"), assume a posição ativa
  // (scale 1) e depois sai por cima (yPercent negativo) enquanto a
  // próxima assume o lugar. As legendas laterais (esquerda/direita) fazem
  // cross-fade no meio da sequência, acompanhando a troca de imagem.
  document.querySelectorAll("[data-stack-pin]").forEach((row) => {
    const media = row.querySelector(".approach__media");
    if (!media) return;
    const slides = Array.from(media.querySelectorAll("[data-stack-slide]")).sort(
      (a, b) => Number(a.dataset.stackSlide) - Number(b.dataset.stackSlide)
    );
    const leftCol = row.querySelector(".approach__col--left");
    const rightCol = row.querySelector(".approach__col--right");
    if (slides.length < 3) return;

    const SCALE = [1, 0.92, 0.84];
    const Y_PERCENT = [0, 8, 16];
    const CAPTION_SHIFT = 48; // px — sobe junto com a imagem que sai, perceptível (não só opacity)

    slides.forEach((slide, i) => {
      gsap.set(slide, { scale: SCALE[i], yPercent: Y_PERCENT[i] });
    });
    const INACTIVE_OPACITY = 0; // só um texto visível por vez, trocando junto com a imagem
    gsap.set(leftCol, { opacity: 1, y: 0 });
    gsap.set(rightCol, { opacity: INACTIVE_OPACITY, y: CAPTION_SHIFT });

    // Timeline: transição (0.8) → hold no card ativo (1.2) → transição (0.8).
    // O hold dá tempo do card do meio ficar parado antes de sair, em vez de
    // já sair na sequência (o que ficava "atropelado").
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: row,
        start: "center center",
        end: "+=" + Math.round(window.innerHeight * 2.3),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      },
    });

    // Legenda em revezamento dentro da janela da imagem (0.8): a que sai
    // sobe e some na primeira metade (0 → 0.4), a próxima só começa a
    // entrar depois que a imagem já passou de 50% da transição (0.4 → 0.8).
    tl.to(slides[0], { yPercent: -112, ease: "power1.in", duration: 0.8 }, 0)
      .to(slides[1], { scale: SCALE[0], yPercent: Y_PERCENT[0], ease: "power1.out", duration: 0.8 }, 0)
      .to(slides[2], { scale: SCALE[1], yPercent: Y_PERCENT[1], ease: "power1.out", duration: 0.8 }, 0)
      .to(leftCol, { opacity: INACTIVE_OPACITY, y: -CAPTION_SHIFT, ease: "power1.in", duration: 0.4 }, 0)
      .to(rightCol, { opacity: 1, y: 0, ease: "power1.out", duration: 0.4 }, 0.4)
      .to(slides[1], { yPercent: -112, ease: "power1.in", duration: 0.8 }, 2.0)
      .to(slides[2], { scale: SCALE[0], yPercent: Y_PERCENT[0], ease: "power1.out", duration: 0.8 }, 2.0)
      // segunda transição: legenda volta pra esquerda, mesmo revezamento.
      .set(leftCol, { y: CAPTION_SHIFT }, 2.0)
      .to(rightCol, { opacity: INACTIVE_OPACITY, y: -CAPTION_SHIFT, ease: "power1.in", duration: 0.4 }, 2.0)
      .to(leftCol, { opacity: 1, y: 0, ease: "power1.out", duration: 0.4 }, 2.4);
  });

  // Sobre/Atendimento — as 4 fotos flutuantes surgem pequenas e giradas
  // (scale 0.4 + leve rotação por foto, cada uma com seu ângulo) e crescem
  // juntas, no mesmo tempo, até o tamanho/ângulo final na própria posição
  // (transform-origin center, por isso o posicionamento em .people__float
  // no CSS não muda) — todas se movendo em uníssono conforme a seção
  // entra na viewport (ref: lassie.ai).
  const peopleFloats = document.querySelectorAll(".people__float");
  const FLOAT_START_ROTATION = { tl: -9, tr: 7, bl: 6, br: -8 };
  peopleFloats.forEach((el) => {
    const corner = el.className.match(/people__float--(\w+)/)?.[1];
    const fromRotation = FLOAT_START_ROTATION[corner] ?? 0;
    gsap.set(el, { scale: 0.4, opacity: 0, rotate: fromRotation, y: 24 });
    gsap.to(el, {
      scale: 1,
      opacity: 1,
      rotate: 0,
      y: 0,
      duration: 1.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".people",
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });

  // Depoimentos — o heading encolhe suavemente (scrub) conforme a seção
  // entra. A opacidade não é controlada aqui: ela permanece em 1 até o fade
  // final, evitando disputa entre dois ScrollTriggers sobre a visibilidade.
  const testimonialsHeading = document.querySelector(".testimonials__heading");
  const testimonialsTag = document.querySelector("#depoimentos .tag");
  const testimonialIntro = [testimonialsTag, testimonialsHeading].filter(Boolean);
  gsap.set(testimonialIntro, { autoAlpha: 1 });
  if (testimonialsHeading) {
    gsap.fromTo(
      testimonialsHeading,
      { scale: 1.18 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "#depoimentos",
          start: "top bottom",
          end: "top 45%",
          scrub: true,
        },
      }
    );
  }

  // Depoimentos — a seção inteira fica presa para manter o título fixo no
  // centro. Os cards vivem em uma camada acima e atravessam o título de
  // baixo para cima. Enquanto o card atual pausa no centro, o topo do próximo
  // já fica visível no rodapé; depois ambos sobem juntos na troca.
  const testimonialSection = document.querySelector("#depoimentos");
  const testimonialStage = document.querySelector(".testimonials__stage");
  const testimonialSlides = gsap.utils.toArray(".testimonials__card");
  if (testimonialSection && testimonialStage && testimonialSlides.length > 0) {
    // Mantém aproximadamente 80–110px do próximo card aparecendo abaixo da
    // viewport central, como pista visual de que a sequência continua.
    const cardTravel = () =>
      Math.max(window.innerHeight * 0.6, testimonialStage.offsetHeight * 1.15);

    gsap.set(testimonialSlides, {
      autoAlpha: 0,
      scale: 0.92,
      y: () => cardTravel(),
      zIndex: 2,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: testimonialSection,
        start: "top top",
        end: "+=" + Math.round(window.innerHeight * testimonialSlides.length * 1.25),
        pin: testimonialSection,
        scrub: 0.45,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // O título recua visualmente enquanto os cards ocupam o primeiro plano.
    // A escala acompanha o mesmo progresso de scroll da entrada do 1º card.
    if (testimonialsHeading) {
      tl.to(
        testimonialsHeading,
        {
          scale: () => (window.innerWidth <= 600 ? 0.82 : 0.72),
          transformOrigin: "center center",
          ease: "none",
          duration: 0.9,
        },
        0
      );
    }

    const firstSlide = testimonialSlides[0];
    tl.set(firstSlide, { autoAlpha: 1, zIndex: 2 }, 0).to(
      firstSlide,
      {
        scale: 1,
        y: 0,
        ease: "none",
        duration: 0.9,
      },
      0
    );

    testimonialSlides.forEach((slide, i) => {
      const next = testimonialSlides[i + 1];
      // Ciclos quase contínuos: 0.9 de deslocamento + apenas 0.25 de leitura.
      // O fade começa antes do centro e continua no começo da subida seguinte.
      const centeredAt = 0.9 + i * 1.15;
      const transitionAt = centeredAt + 0.25;
      const fadeAt = Math.max(0, centeredAt - 0.15);

      if (next) {
        tl.set(next, { visibility: "visible", zIndex: 1 }, fadeAt)
          .fromTo(
            next,
            { opacity: 0 },
            {
              opacity: 1,
              ease: "none",
              duration: 0.75,
              immediateRender: false,
            },
            fadeAt
          )
          .to(
            slide,
            {
              scale: 0.92,
              y: () => -cardTravel(),
              ease: "none",
              duration: 0.9,
            },
            transitionAt
          )
          .to(
            next,
            {
              scale: 1,
              y: 0,
              ease: "none",
              duration: 0.9,
            },
            transitionAt
          )
          .set(slide, { autoAlpha: 0, zIndex: 0 }, transitionAt + 0.9)
          .set(next, { zIndex: 2 }, transitionAt + 0.9);
      } else {
        // Último card: dissolve enquanto sobe para entregar a composição
        // suavemente à transição de fundo/entrada da próxima seção.
        tl.to(
          slide,
          {
            opacity: 0,
            scale: 0.92,
            y: () => -cardTravel(),
            ease: "none",
            duration: 0.9,
          },
          transitionAt
        ).set(slide, { visibility: "hidden" }, transitionAt + 0.9);
      }
    });

    // Quando o último card sai, título e tag também se dissolvem. Isso evita
    // que o heading reapareça sozinho antes da entrada da próxima seção.
    if (testimonialIntro.length) {
      const lastCenteredAt = 0.9 + (testimonialSlides.length - 1) * 1.15;
      const introExitAt = lastCenteredAt + 0.25;
      tl.fromTo(
        testimonialIntro,
        { autoAlpha: 1 },
        {
          autoAlpha: 0,
          ease: "none",
          duration: 0.9,
          immediateRender: false,
        },
        introExitAt
      );
    }
  }

  // Transição de fundo entre seções — a cor real vive em .bg-transition-layer
  // (fixed, atrás de tudo); cada seção marcada com [data-bg-color] fica
  // transparente e "empresta" sua cor para o layer. O scrub prende a
  // interpolação ao progresso físico do scroll (sem inércia, reversível).
  const bgLayer = document.querySelector(".bg-transition-layer");
  const bgSections = gsap.utils.toArray("[data-bg-color]");
  if (bgLayer && bgSections.length > 1) {
    // backgroundImage some junto: .posts tem um gradiente estático no CSS
    // (fallback sem JS) que, se não for zerado aqui, fica por cima do layer
    // e cria a emenda dura no início da seção.
    gsap.set(bgSections, { backgroundColor: "transparent", backgroundImage: "none" });
    gsap.set(bgLayer, { backgroundColor: bgSections[0].dataset.bgColor });

    bgSections.forEach((section, i) => {
      if (i === 0) return; // primeira seção do fluxo: só fixa a cor base, sem transição de entrada

      const fromColor = bgSections[i - 1].dataset.bgColor;
      const toColor = section.dataset.bgColor;

      gsap.fromTo(
        bgLayer,
        { backgroundColor: fromColor }, // cor da seção anterior
        {
          backgroundColor: toColor, // background principal desta seção (ex.: #d3d9ff em #depoimentos)
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 85%", // entrada: começa a se fundir pouco antes da seção tomar a tela
            end: "top 15%", // seção em foco: cor final atingida e mantida até a próxima transição
            scrub: true,
          },
        }
      );
      // saída para a próxima seção = início do próximo tween deste loop,
      // mesma cor como ponto de partida — sem corte entre as duas transições
    });
  }
});

// ============================================================================
// Hero — Smoke Mouse Cursor
// Fumaça reagindo ao mouse sobre o céu do hero (refs: smoke-mouse-cursor.
// webflow.io, smokeshader.netlify.app — ambos usam simulação de fluido
// estilo Navier-Stokes). Aqui usamos uma versão leve: um campo de "tinta"
// (dye) em baixa resolução, advectado por curl noise + a velocidade do
// mouse, com dissipação — dá o efeito de fumaça sem o custo de um solver
// de pressão completo. Só roda em desktop (pointer: fine).
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(pointer: fine)").matches) return;

  const hero = document.querySelector(".hero");
  const canvas = document.querySelector(".hero__smoke");
  if (!hero || !canvas) return;

  const glOptions = { alpha: true, premultipliedAlpha: false, antialias: false, depth: false, stencil: false };
  const gl = canvas.getContext("webgl", glOptions) || canvas.getContext("experimental-webgl", glOptions);
  if (!gl) return;

  const VERT_SRC = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const ADVECT_FRAG_SRC = `
    precision mediump float;
    varying vec2 vUv;
    uniform sampler2D uSource;
    uniform float uTime;
    uniform float uDt;
    uniform vec2 uMouse;
    uniform vec2 uMouseVel;
    uniform float uMouseActive;
    uniform float uAspect;
    uniform vec2 uTexel;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    float vnoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }
    float fbm(vec2 p) {
      float v = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 4; i++) {
        v += amp * vnoise(p);
        p *= 2.02;
        amp *= 0.5;
      }
      return v;
    }
    vec2 curl(vec2 p) {
      float e = 0.05;
      float n1 = fbm(p + vec2(0.0, e));
      float n2 = fbm(p - vec2(0.0, e));
      float n3 = fbm(p + vec2(e, 0.0));
      float n4 = fbm(p - vec2(e, 0.0));
      float dx = (n1 - n2) / (2.0 * e);
      float dy = (n3 - n4) / (2.0 * e);
      return vec2(dy, -dx);
    }

    void main() {
      vec2 uv = vUv;
      vec2 aspectUv = vec2(uv.x * uAspect, uv.y);

      vec2 flow = curl(aspectUv * 1.3 + uTime * 0.035) * 0.22;
      vec2 mouseDelta = uMouse - uv;
      float mouseDist = length(vec2(mouseDelta.x * uAspect, mouseDelta.y));
      float mouseInfluence = smoothstep(0.35, 0.0, mouseDist);
      flow += uMouseVel * 5.0 * mouseInfluence;

      vec2 backUv = uv - flow * uDt;

      // Diffusão leve (blur de 5 amostras) — sem isso, a advecção por curl
      // noise sozinha estica a fumaça em filamentos que viram ruído
      // sub-pixel depois de alguns segundos parada. O blur devolve massa
      // aos vizinhos a cada frame e mantém a forma coesa/macia.
      vec4 prev = texture2D(uSource, backUv) * 0.4;
      prev += texture2D(uSource, backUv + vec2(uTexel.x, 0.0)) * 0.15;
      prev += texture2D(uSource, backUv - vec2(uTexel.x, 0.0)) * 0.15;
      prev += texture2D(uSource, backUv + vec2(0.0, uTexel.y)) * 0.15;
      prev += texture2D(uSource, backUv - vec2(0.0, uTexel.y)) * 0.15;
      prev *= exp(-uDt * 0.45);

      float splat = smoothstep(0.09, 0.0, mouseDist) * uMouseActive;
      float speed = clamp(length(uMouseVel) * 14.0, 0.0, 1.0);
      vec3 smokeColor = mix(vec3(1.0), vec3(0.369, 0.714, 0.8), 0.14);
      vec4 result = prev + vec4(smokeColor * splat * speed * 1.1, splat * speed * 1.1);

      gl_FragColor = clamp(result, 0.0, 1.0);
    }
  `;

  const DISPLAY_FRAG_SRC = `
    precision mediump float;
    varying vec2 vUv;
    uniform sampler2D uSource;
    void main() {
      vec4 c = texture2D(uSource, vUv);
      gl_FragColor = vec4(c.rgb, c.a * 0.9);
    }
  `;

  function compileShader(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("[smoke] shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram(vertSrc, fragSrc) {
    const vs = compileShader(gl.VERTEX_SHADER, vertSrc);
    const fs = compileShader(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return null;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.bindAttribLocation(program, 0, "aPosition");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("[smoke] program link error:", gl.getProgramInfoLog(program));
      return null;
    }
    return program;
  }

  const advectProgram = createProgram(VERT_SRC, ADVECT_FRAG_SRC);
  const displayProgram = createProgram(VERT_SRC, DISPLAY_FRAG_SRC);
  if (!advectProgram || !displayProgram) return;

  const advectUniforms = {
    uSource: gl.getUniformLocation(advectProgram, "uSource"),
    uTime: gl.getUniformLocation(advectProgram, "uTime"),
    uDt: gl.getUniformLocation(advectProgram, "uDt"),
    uMouse: gl.getUniformLocation(advectProgram, "uMouse"),
    uMouseVel: gl.getUniformLocation(advectProgram, "uMouseVel"),
    uMouseActive: gl.getUniformLocation(advectProgram, "uMouseActive"),
    uAspect: gl.getUniformLocation(advectProgram, "uAspect"),
    uTexel: gl.getUniformLocation(advectProgram, "uTexel"),
  };
  const displayUniforms = { uSource: gl.getUniformLocation(displayProgram, "uSource") };

  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  function bindQuad() {
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  }

  function createFBO(w, h) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { tex, fbo, w, h };
  }

  const SIM_HEIGHT = 180;
  let simWidth = SIM_HEIGHT;
  let fboA;
  let fboB;

  function initFBOs() {
    const rect = hero.getBoundingClientRect();
    simWidth = Math.max(1, Math.round(SIM_HEIGHT * (rect.width / rect.height)));
    fboA = createFBO(simWidth, SIM_HEIGHT);
    fboB = createFBO(simWidth, SIM_HEIGHT);
    [fboA, fboB].forEach((fbo) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
      gl.viewport(0, 0, fbo.w, fbo.h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function resizeCanvas() {
    const rect = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
  }

  resizeCanvas();
  initFBOs();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
      initFBOs();
    }, 200);
  });

  const mouse = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, vx: 0, vy: 0, active: false };
  let idleTimer;
  hero.addEventListener("pointermove", (e) => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    const rect = hero.getBoundingClientRect();
    mouse.px = mouse.x;
    mouse.py = mouse.y;
    mouse.x = (e.clientX - rect.left) / rect.width;
    mouse.y = 1 - (e.clientY - rect.top) / rect.height;
    mouse.vx = mouse.x - mouse.px;
    mouse.vy = mouse.y - mouse.py;
    mouse.active = true;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { mouse.active = false; }, 120);
  });
  hero.addEventListener("pointerleave", () => { mouse.active = false; });

  let heroVisible = true;
  const io = new IntersectionObserver(
    (entries) => { heroVisible = entries[0].isIntersecting; },
    { threshold: 0 }
  );
  io.observe(hero);

  let started = false;
  let lastTime = performance.now();

  function frame(now) {
    requestAnimationFrame(frame);
    if (!heroVisible || document.hidden) {
      lastTime = now;
      return;
    }
    const dt = Math.min((now - lastTime) / 1000, 1 / 30);
    lastTime = now;

    gl.bindFramebuffer(gl.FRAMEBUFFER, fboB.fbo);
    gl.viewport(0, 0, fboB.w, fboB.h);
    gl.disable(gl.BLEND);
    gl.useProgram(advectProgram);
    bindQuad();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fboA.tex);
    gl.uniform1i(advectUniforms.uSource, 0);
    gl.uniform1f(advectUniforms.uTime, now * 0.001);
    gl.uniform1f(advectUniforms.uDt, dt);
    gl.uniform2f(advectUniforms.uMouse, mouse.x, mouse.y);
    gl.uniform2f(advectUniforms.uMouseVel, mouse.vx, mouse.vy);
    gl.uniform1f(advectUniforms.uMouseActive, mouse.active ? 1 : 0);
    gl.uniform1f(advectUniforms.uAspect, simWidth / SIM_HEIGHT);
    gl.uniform2f(advectUniforms.uTexel, 1 / simWidth, 1 / SIM_HEIGHT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    const tmp = fboA;
    fboA = fboB;
    fboB = tmp;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(displayProgram);
    bindQuad();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fboA.tex);
    gl.uniform1i(displayUniforms.uSource, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (!started) {
      started = true;
      canvas.classList.add("is-active");
    }
  }

  requestAnimationFrame(frame);
});

// ============================================================================
// Hero — encolhe nas laterais ao rolar (ref: lassie.ai)
// Alterna uma classe que anima o clip-path do hero via CSS; a transição de
// duração/curva vive em css/home.css para ficar junto do resto dos tokens
// de animação.
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const SHRINK_THRESHOLD = 24;
  let ticking = false;

  function updateHeroShrink() {
    hero.classList.toggle("is-shrunk", window.scrollY > SHRINK_THRESHOLD);
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateHeroShrink);
    },
    { passive: true }
  );

  updateHeroShrink();
});

// ============================================================================
// Hero — áudio ambiente: o botão liga/desliga; clicar em qualquer ponto do
// hero que não seja um link/botão também liga/desliga (atalho para não
// precisar acertar o ícone pequeno).
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero");
  const audio = document.getElementById("hero-audio");
  const soundToggle = document.querySelector(".hero__sound-toggle");
  const soundIcon = document.querySelector(".hero__sound-icon");
  if (!hero || !audio || !soundToggle || !soundIcon) return;

  const ICON_ON = "assets/icons/volume-low.svg";
  const ICON_OFF = "assets/icons/volume-off.svg";

  function setPlayingState(isPlaying) {
    soundIcon.src = isPlaying ? ICON_ON : ICON_OFF;
    soundToggle.classList.toggle("is-playing", isPlaying);
    soundToggle.setAttribute("aria-label", isPlaying ? "Pausar som" : "Ativar som");
  }

  function toggleAudio() {
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  soundToggle.addEventListener("click", toggleAudio);

  audio.addEventListener("play", () => setPlayingState(true));
  audio.addEventListener("pause", () => setPlayingState(false));

  hero.addEventListener("click", (e) => {
    if (e.target.closest("a, button")) return;
    toggleAudio();
  });
});
