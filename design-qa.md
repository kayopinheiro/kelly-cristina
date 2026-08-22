# Design QA — Blog

## Escopo

- Referência visual: `/var/folders/lk/t371ncr14vqd2v01hprj04f80000gn/T/codex-clipboard-84116a31-8d95-4cbb-9133-fc4042fa9666.png`
- Página de listagem: `blog.html`
- Página interna: `blog-post.html?slug=cuidar-da-ansiedade-no-dia-a-dia`
- Dados: mock local com a mesma interface prevista para o Sanity; instruções em `instrucoes/sanity-blog-schema.md`

## Evidências visuais

- Desktop — listagem: `screamshots/blog-listing-qa.png` (1265 × 712)
- Mobile — listagem: `screamshots/blog-listing-mobile-qa.png` (viewport 390 × 844, captura em 2x)
- Desktop — post: `screamshots/blog-post-qa.png`
- Mobile — post: `screamshots/blog-post-mobile-qa.png`
- Comparação referência × implementação: `screamshots/blog-listing-comparison.png`

## Estado validado

- 9 posts exibidos inicialmente, de um total de 18.
- O botão “Carregar mais 9 posts” completa a lista e desaparece ao chegar ao fim.
- O filtro “Ansiedade” atualiza a URL para `?categoria=ansiedade` e exibe 6 posts.
- Clique no card abre o post pelo slug.
- Slug inexistente exibe o estado de erro dedicado.
- Três posts relacionados aparecem ao final da página interna.

## Comparação de design

- Tipografia: Helvetica Neue e escala do projeto preservadas.
- Layout: grid desktop de 3 colunas, cards de 352 px, gap de 24 px e container de 1105 px no viewport testado.
- Cards: raio de 24 px, borda de 1 px e proporção de imagem coerentes com a referência.
- Cores: somente tokens existentes do projeto.
- Imagens: ativos existentes do projeto, com ordem e enquadramento alinhados à referência.
- Conteúdo: textos realistas em português, preparados para substituição pelo Sanity.
- Diferenças intencionais: cabeçalho compartilhado do site e controles de filtro/contagem, necessários para a navegação e para o requisito funcional.

## Iterações

### Rodada 1

- P2: overflow horizontal de 15 px na listagem mobile.
- P2: CTA do cabeçalho quebrava em duas linhas no mobile.

Correções aplicadas:

- Ajuste de largura e `min-width` no toolbar.
- Scroll horizontal restrito à faixa de filtros.
- CTA com `white-space: nowrap`, fonte e padding responsivos.

### Rodada 2

- Listagem mobile sem overflow de página.
- CTA em uma linha, com altura de 36 px.
- Post mobile sem overflow, título de 32 px e imagem em proporção 4:3.
- Nenhum erro ou aviso no console.

### Rodada 3 — navegação

- O cabeçalho exclusivo do blog foi substituído pelo mesmo componente `.hero__nav` da home.
- Estrutura, logo, links, CTA, dimensões, transparência, borda e comportamento mobile agora são compartilhados entre home, listagem e página interna.
- Comparação visual direta no mesmo viewport confirmou o alinhamento do componente.

### Rodada 4 — hero do post

- Uma imagem local e fixa do próprio projeto passou a ocupar toda a hero da página interna.
- O nav foi sobreposto à imagem, repetindo o comportamento visual da hero da home.
- Foi aplicado overlay em gradiente para preservar contraste de título, resumo, categoria e metadados.
- A hero é independente do Sanity; o campo `coverImage` permanece destinado às capas dos cards.

## Interações verificadas

- Filtro por categoria.
- Persistência do filtro na query string.
- Paginação incremental de 9 em 9.
- Navegação card → post.
- Link “Ver mais posts” da home → listagem.
- Estado vazio, erro e retry.
- Foco, hover e active nos elementos clicáveis.

## Resultado final

passed
