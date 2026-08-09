# Kelly Cristina — Site

## Sobre o projeto
Site institucional (one-page) para Kelly Cristina S. De Lima, psicóloga clínica. Referência de tom/estética: [lassie.ai](https://www.lassie.ai/) — visual limpo, gradientes suaves, ilustrações delicadas e microinterações no scroll.

## Skill obrigatória
**Sempre invocar a skill `frontend-design` antes de implementar qualquer página ou componente visual.**

## Figma
URL do design: https://www.figma.com/design/Jne7xkusmjg40jGlaWlwK7/Kelly-Cristina---Site?node-id=2109-4&m=dev

Para extrair dados do Figma via MCP:
- Tokens/variáveis: `Get design variables from this Figma file: [URL_DO_FIGMA]`
- Componentes: `Get the [Nome] component from: [URL_DO_FIGMA]`
- Status: `Check Figma status`

## Stack técnica
- **Frontend:** HTML + CSS + JS vanilla
- **CMS:** Sanity (Studio separado, conteúdo consumido via `@sanity/client` / GROQ)
- **Deploy:** Vercel
- **Animações:** GSAP (ScrollTrigger + SplitText/custom split) via CDN

**Abordagem escolhida:** fetch client-side, sem build step. É a que melhor se adapta a um site vanilla sem toolchain: `@sanity/client` importado via CDN (`esm.sh`) direto no JS da página, com `useCdn: true` (lê do CDN cacheado do Sanity, rápido e sem custo de API extra). Cada seção que consome conteúdo do Sanity (posts do blog, depoimentos) faz sua própria query GROQ no load da página e popula o DOM. Sem necessidade de function na Vercel — o site continua 100% estático no deploy; o fetch acontece no navegador do visitante.

```js
import { createClient } from 'https://esm.sh/@sanity/client'
const client = createClient({
  projectId: '[PROJECT_ID]',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})
```

Se no futuro precisar de SEO/SSR para o conteúdo dinâmico (ex: posts indexados pelo Google), reavaliar para build-time fetch — mas não implementar isso agora sem necessidade real.

## Estrutura de arquivos
```
site-kelly-cristina/
├── index.html
├── style-guide.html
├── css/
│   ├── tokens.css       ← variáveis (cores, tipografia, grid, espaçamento)
│   ├── base.css          ← reset + componentes compartilhados (btn, card, tag, grid)
│   ├── home.css           ← estilos específicos de index.html
│   └── style-guide.css   ← estilos específicos de style-guide.html
├── js/
│   └── main.js            ← animações (GSAP + smoke cursor)
├── assets/
│   ├── logo.svg
│   └── images/            ← fotos exportadas do Figma
├── screamshots/          ← prints das seções por página (referência visual)
├── instrucoes/
│   └── projeto-guide.md  ← este arquivo
├── CLAUDE.md             ← @import instrucoes/projeto-guide.md
└── .claude/
    └── launch.json
```
Cada página nova segue o padrão: `<pagina>.html` na raiz + `css/<pagina>.css` próprio, carregado depois de `css/tokens.css` e `css/base.css`.

## Fonte de verdade

| O quê | Onde buscar |
|---|---|
| Layout, espaçamentos, hierarquia | Figma → node 2109-4 (página "01. Home") |
| Cores (hex exatos) | instrucoes/projeto-guide.md (seção Tokens) |
| Tipografia (tamanhos, pesos, line-heights) | instrucoes/projeto-guide.md (seção Tokens) |
| Logos e imagens | `assets/logo.svg` e `assets/images/` |
| Referência visual por seção | pasta screamshots/ |

## Design System

> Extraído diretamente das variáveis e text styles do arquivo Figma (Desktop Bridge).

### Cores

**Brand**
| Token | Hex | Observação |
|---|---|---|
| --color-brand-port-gore | #39406a | navy escuro — cards de destaque (ex: quote de depoimento) |
| --color-brand-deep-cobalt | #424769 | navy secundário |
| --color-brand-blue-ice | #7077a1 | azul acinzentado |
| --color-brand-creole-sauce | #ed8737 | laranja — usado nos gradientes das imagens ilustrativas |
| --color-brand-water-baby | #5eb6cc | azul-turquesa — gradientes |
| --color-brand-tropical-holiday | #8dcecb | menta — gradientes |

**Neutros (escala port gore / gray, mesma escala duplicada no Figma)**
| Token | Hex |
|---|---|
| --color-gray-50 | #f3f4f6 |
| --color-gray-100 | #dbdde2 |
| --color-gray-200 | #caccd5 |
| --color-gray-300 | #b1b5c1 |
| --color-gray-400 | #a2a7b5 |
| --color-gray-500 | #8b91a3 |
| --color-gray-600 | #7e8494 |
| --color-gray-700 | #636774 |
| --color-gray-800 | #4c505a |
| --color-gray-900 | #3a3d44 |

**Base**
| Token | Hex |
|---|---|
| --color-white | #ffffff |
| --color-dark | #0c0e13 |

### Tipografia

**Família:** Helvetica Neue (pesos: Light, Regular, Medium, Bold)

| Estilo | Tamanho | Peso | Line-height |
|---|---|---|---|
| Display | 64px | Medium | 110% |
| H1 | 48px | Medium | 115% |
| H2 | 40px | Medium | 120% |
| H3 | 32px | Medium | 125% |
| H4 | 24px | Medium | 130% |
| H5 | 20px | Medium | 135% |
| H6 | 18px | Medium | 140% |
| Text/large | 20px | Regular | 150% |
| Text/medium | 18px | Regular | 150% |
| Text/regular | 16px | Regular | 150% |
| Text/small | 14px | Regular | 150% |
| Text/tiny | 12px | Regular | 150% |
| Button | 16px | Medium | 150% |
| Overline | 12px | Regular | 150% |

### Grid (Figma — frame "01. Home")
- **Desktop:** container 1440px · 12 colunas · gutter 24px · margem lateral 80px
- **Mobile:** conferir no Figma (não extraído ainda — checar frame mobile antes de implementar breakpoints)

### Espaçamentos
- Margem lateral das seções (desktop): 80px
- Gap entre colunas do grid: 24px
- Demais espaçamentos: medir por seção no Figma / conferir contra os screenshots em `screamshots/`

## Convenções de classes
- **Seção:** `.section` + `.section--dark` / `.section--light`
- **Botão:** `.btn` + `.btn--primary` (pill preto `#0c0e13`) / `.btn--secondary` (pill branco)
- **Card:** `.card` + `.card--testimonial` / `.card--post`
- **Grid:** `.grid` + `.grid-[cols]`
- **Scroll reveal:** `data-reveal` + `data-reveal="lines"` (para o text reveal on scroll)

## Animações (requisito do projeto)

### 1. Hero — Smoke Mouse Cursor
Efeito de "fumaça" seguindo o cursor sobre a imagem do hero (céu + porta).
- Referências: https://smoke-mouse-cursor.webflow.io/ e https://smokeshader.netlify.app/
- Abordagem: shader WebGL (canvas) sobreposto à imagem do hero, reagindo à posição do mouse. Só ativar em desktop (`pointer: fine`); desabilitar em touch/mobile por performance.
- Consultar `get_shader_effect` / `get_motion_context` (Figma MCP) e o site de referência para extrair o shader antes de implementar.

### 2. Text reveal on scroll (staggered line reveal)
Aplicar em headings de seção (ex: "Lorem ipsum dolor sit amet consectetur.") conforme entram na viewport.
- Referência: https://demos.gsap.com/demo/responsive-line-splits-on-scroll/
- Abordagem: GSAP + ScrollTrigger, split do heading em linhas (SplitText ou split manual via `<span>` por linha), stagger de opacity + translateY.
- Usar `data-reveal="lines"` nos headings que devem receber o efeito.

## Páginas
| Página | Status | Seções (ordem no Figma) |
|---|---|---|
| style-guide.html | 🟡 Layout estático criado — aguardando validação visual | Documentação de componentes (cores, tipografia, botões, cards, grid) |
| index.html | 🟡 Layout estático criado — aguardando validação visual, animações pendentes | Hero (nav + smoke cursor) → Intro/manifesto (texto + avatar) → Abordagem (imagem + texto com reveal) → Sobre/Atendimento (colagem de fotos + CTA) → Depoimentos (quote card escuro) → Blog/Posts (cards + "Ver mais posts") → Footer (CTA + copyright) |

> Sem screenshot automatizado neste ambiente (sandbox sem permissão para instalar dependências de browser headless) — a validação visual de cada seção é feita pelo Kayo rodando `npx serve . -p 3000` localmente e comparando com `screamshots/`.

## Assets disponíveis

### Logos
- `assets/logo.svg`

### Imagens (`assets/images/`)
- `bg-img-hero.png` — imagem de fundo do hero (céu + porta + grama)
- `img.png`, `img-1.png`, `img-2.png`, `img-3.png` — fotos com gradiente (seção Sobre/Atendimento)
- `img-cta.png` — imagem da seção de CTA/footer
- `ilustration-notion.png` — ilustração das duas pessoas conversando (seção Abordagem)

### Screenshots de referência (pasta `screamshots/`)
- `bg-img-hero.png` — Hero completo (nav + heading + CTA + imagem)
- `section.png` — Intro/manifesto (texto grande + avatar "Kelly Cristina")
- `section-3.png` — Abordagem (imagem em destaque + textos laterais, candidata ao text reveal)
- `section-4.png` — Sobre/Atendimento (colagem de fotos + ilustração + CTA)
- `section-5.png` — Depoimentos (card escuro de quote, depoimento "Fernanda")
- `section-6.png` — Blog/Posts (3 cards + "Ver mais posts")
- `footer.png` — Footer (CTA final + copyright + links legais)

## Regras absolutas
- Não inventar cores — usar apenas os tokens definidos acima
- Não usar outra fonte além de Helvetica Neue
- Não melhorar o design — reproduzir o Figma com fidelidade
- Todo elemento clicável deve ter estado hover, focus-visible e active
- Não adicionar seções que não existam no design
- Animar apenas `transform` e `opacity` (exceto o shader do cursor, que é canvas/WebGL)

## Fluxo de desenvolvimento por página
1. Invocar a skill `frontend-design`
2. Enviar os screenshots da página (`screamshots/`) como referência visual
3. **Apresentar plano de ação da página** — listar todas as seções que serão criadas, ordem de execução e componentes envolvidos. Aguardar aprovação do usuário antes de escrever qualquer código.
4. Após aprovação: criar a página (começar pelo Style Guide)
5. Após cada seção: verificar no preview e comparar com o screenshot
6. Corrigir diferenças antes de avançar para a próxima seção
7. Implementar as animações (smoke cursor no hero, text reveal nos headings) por último, depois do layout estático estar fiel ao Figma
8. Repetir para cada página seguinte
