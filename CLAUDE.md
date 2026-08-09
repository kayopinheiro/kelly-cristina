@instrucoes/projeto-guide.md

# Regras de Desenvolvimento Frontend

## Sempre Fazer Primeiro
- **Invocar a skill `frontend-design`** antes de escrever qualquer código frontend, toda sessão, sem exceções.

## Imagens de Referência
- Reproduzir layout, espaçamento, tipografia e cores dos screenshots em `screamshots/` com exatidão. Não melhorar nem adicionar ao design.
- Tirar screenshot do output, comparar com a referência, corrigir diferenças, tirar novo screenshot. Fazer no mínimo 2 rodadas de comparação. Parar apenas quando não houver diferenças visíveis ou o usuário confirmar.

## Servidor Local
- **Sempre servir em localhost** — nunca tirar screenshot de URL `file:///`.
- Iniciar o servidor: `npx serve . -p 3000`
- Iniciar em background antes de qualquer screenshot.
- Se o servidor já estiver rodando, não iniciar uma segunda instância.

## Fluxo de Screenshot
- Sempre tirar screenshot via localhost: `http://localhost:3000`
- Após tirar screenshot, analisar a imagem e comparar com a referência.
- Ser específico nas comparações: "heading está em 32px mas referência mostra ~24px", "gap do card está 16px mas deveria ser 24px"
- Verificar: espaçamento/padding, tamanho/peso/line-height da fonte, cores (hex exato), alinhamento, border-radius, sombras, tamanho das imagens.

## Stack de Desenvolvimento
- **HTML + CSS + JS vanilla** — sem framework de build. Tailwind pode ser usado via CDN só para utilitários de layout se necessário; preferir CSS próprio com os tokens do projeto.
- **CMS: Sanity** — Studio separado. Conteúdo consumido client-side via `@sanity/client` importado por CDN (`esm.sh`), `useCdn: true`, sem build step — site continua estático no deploy. Nunca hardcodar conteúdo que deveria vir do Sanity (textos de posts, depoimentos) — usar dados mock/placeholder claramente sinalizados até o schema do Sanity estar definido.
- **Deploy: Vercel** — projeto deve rodar como site estático (ou com uma function mínima, se necessário para o fetch do Sanity). Confirmar com o usuário o `vercel.json` quando chegar a hora do deploy.
- **Animações:** GSAP + ScrollTrigger via CDN (`cdnjs.cloudflare.com`) para o text reveal on scroll. Shader/canvas customizado para o smoke cursor do hero (sem dependência externa pesada — WebGL puro ou biblioteca leve).
- Fonte: Helvetica Neue (fallback: `-apple-system, "Segoe UI", sans-serif`).
- Imagens: usar os arquivos reais de `assets/images/` (fotos) e `assets/logo.svg` — não usar placeholders onde já existe asset.
- Mobile-first responsivo.
- CSS customizado (tokens, overrides de brand) sempre em `css/tokens.css`.

## Estrutura de Arquivos
```
site-kelly-cristina/
├── index.html
├── style-guide.html
├── css/
│   ├── tokens.css        ← variáveis (cores, tipografia, grid, espaçamento)
│   ├── base.css           ← reset + componentes compartilhados (btn, card, tag, grid)
│   ├── home.css            ← estilos específicos de index.html
│   └── style-guide.css    ← estilos específicos de style-guide.html
├── js/
│   └── main.js             ← animações (GSAP + smoke cursor)
├── assets/
│   ├── logo.svg
│   └── images/             ← fotos exportadas do Figma
├── screamshots/            ← referência visual por seção (Figma)
├── instrucoes/
│   └── projeto-guide.md
└── .claude/
    └── launch.json
```
Toda página nova segue esse padrão: um `<pagina>.css` próprio em `css/`, sempre depois de `tokens.css` e `base.css` no `<head>`.

## Animações — Requisitos Específicos
1. **Hero — Smoke Mouse Cursor**: efeito de fumaça reagindo ao mouse sobre a imagem do hero (refs: smoke-mouse-cursor.webflow.io, smokeshader.netlify.app). Só desktop (`pointer: fine`). Não travar o scroll nem a performance em telas menores.
2. **Text reveal on scroll**: headings de seção entram em cena com stagger por linha (ref: GSAP ScrollTrigger responsive line splits). Usar `data-reveal="lines"` nos headings marcados no projeto-guide.md.
3. Nunca aplicar essas animações antes do layout estático estar 100% fiel ao Figma — animação é a última etapa de cada seção.

## Assets do Projeto
- Sempre verificar a pasta `assets/` antes de começar.
- Assets já exportados do Figma — usar diretamente, não usar placeholders onde há assets reais.
- Cores: usar apenas os tokens definidos em `instrucoes/projeto-guide.md`. Nunca inventar cores.

## Guardrails Anti-Genérico
- **Cores:** Usar exclusivamente os tokens do design system do projeto (paleta port gore / brand). Nunca usar paletas padrão de frameworks.
- **Sombras:** Nunca usar sombra flat. Usar sombras em camadas, com tint de cor e baixa opacidade.
- **Tipografia:** Helvetica Neue, respeitando os tamanhos/pesos/line-heights da tabela de tokens. Nunca misturar outra fonte.
- **Gradientes:** Usar apenas as cores brand (creole sauce, water baby, tropical holiday, port gore, deep cobalt, blue ice) nos gradientes das imagens/ilustrações.
- **Animações:** Animar apenas `transform` e `opacity` no CSS/GSAP (exceção: shader do cursor, que é canvas/WebGL). Nunca `transition-all`. Usar easing suave.
- **Estados interativos:** Todo elemento clicável precisa de estados hover, focus-visible e active. Sem exceções.
- **Espaçamento:** Usar os tokens de espaçamento definidos em `css/tokens.css` (grid 12 col, gutter 24px, margem 80px desktop). Não usar valores aleatórios.
- **Profundidade:** Superfícies devem ter sistema de camadas (base → elevado → flutuante).

## Regras Absolutas
- Não adicionar seções, features ou conteúdo que não esteja no Figma/screenshots
- Não "melhorar" o design de referência — reproduzir com fidelidade
- Não parar após um único screenshot
- Não usar `transition-all`
- HTML e CSS sempre em arquivos separados
- Não inventar cores fora dos tokens
- Não implementar integração real do Sanity sem antes alinhar o schema de conteúdo com o usuário

## Fluxo de Desenvolvimento por Página
1. Invocar a skill `frontend-design`
2. Enviar screenshots da página (`screamshots/`) como referência visual
3. **Apresentar plano de ação** — listar todas as seções, ordem de execução e componentes. Aguardar aprovação antes de escrever código.
4. Após aprovação: criar a página (começar sempre pelo Style Guide)
5. Após cada seção: tirar screenshot, comparar com referência, corrigir diferenças
6. Implementar animações por último (smoke cursor + text reveal)
7. Repetir para cada página
