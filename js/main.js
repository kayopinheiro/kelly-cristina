/*
  Kelly Cristina — Site
  Animações (GSAP ScrollTrigger + smoke cursor) entram só depois que o layout
  estático de todas as seções estiver validado contra o Figma — ver CLAUDE.md
  ("Nunca aplicar essas animações antes do layout estático estar 100% fiel").

  TODO (próxima etapa, após aprovação do layout estático):
  1. Text reveal on scroll — GSAP ScrollTrigger, split de linha nos elementos
     [data-reveal="lines"], stagger de opacity + translateY.
     Ref: https://demos.gsap.com/demo/responsive-line-splits-on-scroll/
  2. Smoke mouse cursor — shader WebGL/canvas sobre .hero__bg, ativo só em
     desktop (matchMedia("(pointer: fine)")).
     Refs: https://smoke-mouse-cursor.webflow.io/ · https://smokeshader.netlify.app/
*/

document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

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
    const CAPTION_SHIFT = 16; // px — mesmo sentido do movimento da imagem (sobe e sai)

    slides.forEach((slide, i) => {
      gsap.set(slide, { scale: SCALE[i], yPercent: Y_PERCENT[i] });
    });
    gsap.set(leftCol, { opacity: 1, y: 0 });
    gsap.set(rightCol, { opacity: 0, y: CAPTION_SHIFT });

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

    tl.to(slides[0], { yPercent: -112, ease: "power1.in", duration: 0.8 }, 0)
      .to(slides[1], { scale: SCALE[0], yPercent: Y_PERCENT[0], ease: "power1.out", duration: 0.8 }, 0)
      .to(slides[2], { scale: SCALE[1], yPercent: Y_PERCENT[1], ease: "power1.out", duration: 0.8 }, 0)
      // legenda troca de lado (esquerda → direita), com leve translateY junto
      // com o movimento da imagem — não é só opacity, o texto "anda" também.
      .to(leftCol, { opacity: 0, y: -CAPTION_SHIFT, duration: 0.4 }, 0.3)
      .to(rightCol, { opacity: 1, y: 0, duration: 0.4 }, 0.3)
      .to(slides[1], { yPercent: -112, ease: "power1.in", duration: 0.8 }, 2.0)
      .to(slides[2], { scale: SCALE[0], yPercent: Y_PERCENT[0], ease: "power1.out", duration: 0.8 }, 2.0)
      // segunda transição: legenda volta pra esquerda (alterna de novo).
      .set(leftCol, { y: CAPTION_SHIFT }, 2.0)
      .to(rightCol, { opacity: 0, y: -CAPTION_SHIFT, duration: 0.4 }, 2.3)
      .to(leftCol, { opacity: 1, y: 0, duration: 0.4 }, 2.3);
  });
});
