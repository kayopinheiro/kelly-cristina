# Estrutura do blog no Sanity

As páginas `blog.html` e `blog-post.html` já consomem a interface definida em
`js/blog-service.js`. Enquanto `SANITY_CONFIG.projectId` estiver vazio, os dados
mock são utilizados. Depois de criar o Studio, preencha o `projectId`; a camada
passa automaticamente a usar as queries GROQ.

## Documento `post`

| Campo | Tipo | Regras |
|---|---|---|
| `title` | string | obrigatório |
| `slug` | slug | obrigatório, origem em `title` |
| `excerpt` | text | obrigatório, recomendado até 180 caracteres |
| `category` | reference → `category` | obrigatório |
| `author` | reference → `author` | obrigatório |
| `coverImage` | image | hotspot habilitado; campo `alt` obrigatório |
| `publishedAt` | datetime | obrigatório |
| `readingTime` | number | inteiro em minutos |
| `body` | array | Portable Text: block e image |
| `seo.title` | string | opcional; fallback para `title` |
| `seo.description` | text | opcional; fallback para `excerpt` |

## Documento `category`

| Campo | Tipo | Regras |
|---|---|---|
| `title` | string | obrigatório |
| `slug` | slug | obrigatório, único |

## Documento `author`

| Campo | Tipo | Regras |
|---|---|---|
| `name` | string | obrigatório |
| `image` | image | imagem quadrada recomendada |
| `bio` | text | opcional |

## Exemplo de schema `post`

```js
export default {
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    { name: 'title', title: 'Título', type: 'string', validation: Rule => Rule.required() },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    },
    { name: 'excerpt', title: 'Resumo', type: 'text', rows: 3, validation: Rule => Rule.required().max(180) },
    { name: 'category', title: 'Categoria', type: 'reference', to: [{ type: 'category' }], validation: Rule => Rule.required() },
    { name: 'author', title: 'Autoria', type: 'reference', to: [{ type: 'author' }], validation: Rule => Rule.required() },
    {
      name: 'coverImage',
      title: 'Imagem de capa',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', title: 'Texto alternativo', type: 'string', validation: Rule => Rule.required() }],
      validation: Rule => Rule.required(),
    },
    { name: 'publishedAt', title: 'Data de publicação', type: 'datetime', validation: Rule => Rule.required() },
    { name: 'readingTime', title: 'Tempo de leitura', type: 'number', validation: Rule => Rule.integer().positive() },
    {
      name: 'body',
      title: 'Conteúdo',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', title: 'Texto alternativo', type: 'string' },
            { name: 'caption', title: 'Legenda', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        { name: 'title', title: 'Título para busca', type: 'string' },
        { name: 'description', title: 'Descrição para busca', type: 'text', rows: 3 },
      ],
    },
  ],
  orderings: [{ title: 'Mais recentes', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
}
```

## URLs

- Listagem: `blog.html`
- Categoria: `blog.html?categoria=ansiedade`
- Post: `blog-post.html?slug=cuidar-da-ansiedade-no-dia-a-dia`

A implementação atual usa query string porque o site é estático e não possui
roteador ou etapa de build. Para URLs como `/blog/meu-post`, será necessário
adicionar regras de rewrite no deploy ou migrar a geração das páginas para
build time/SSR.
