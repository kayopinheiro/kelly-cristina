/*
  Camada de conteúdo do blog.

  Enquanto SANITY_CONFIG.projectId estiver vazio, as páginas usam os dados
  MOCK abaixo. Quando o projeto do Sanity for criado, basta preencher a
  configuração: as mesmas funções passam a consultar o CMS via GROQ.
*/

export const SANITY_CONFIG = {
  projectId: "jtc1gy78",
  dataset: "production",
  apiVersion: "2026-08-22",
  useCdn: true,
};

const MOCK_CATEGORIES = [
  { title: "Ansiedade", slug: "ansiedade" },
  { title: "Autoconhecimento", slug: "autoconhecimento" },
  { title: "Relacionamentos", slug: "relacionamentos" },
];

const MOCK_POST_DEFINITIONS = [
  ["Cuidar da ansiedade no dia a dia", "cuidar-da-ansiedade-no-dia-a-dia", "Ansiedade", "ansiedade", "assets/images/img-3.png"],
  ["O que muda quando aprendemos a nos escutar?", "aprender-a-se-escutar", "Autoconhecimento", "autoconhecimento", "assets/images/img-2.png"],
  ["Limites também são uma forma de cuidado", "limites-como-forma-de-cuidado", "Relacionamentos", "relacionamentos", "assets/images/img.png"],
  ["Quando a preocupação ocupa espaço demais", "quando-a-preocupacao-ocupa-espaco", "Ansiedade", "ansiedade", "assets/images/img-1.png"],
  ["Pequenas pausas para voltar ao presente", "pequenas-pausas-para-o-presente", "Autoconhecimento", "autoconhecimento", "assets/images/img.png"],
  ["Conversas difíceis podem aproximar", "conversas-dificeis-podem-aproximar", "Relacionamentos", "relacionamentos", "assets/images/img-2.png"],
  ["Como reconhecer os sinais de sobrecarga", "reconhecer-sinais-de-sobrecarga", "Ansiedade", "ansiedade", "assets/images/img-3.png"],
  ["Autocobrança: quando nada parece suficiente", "autocobranca-nada-parece-suficiente", "Autoconhecimento", "autoconhecimento", "assets/images/img-1.png"],
  ["A importância de pedir o que você precisa", "pedir-o-que-voce-precisa", "Relacionamentos", "relacionamentos", "assets/images/img.png"],
  ["Respirar não resolve tudo, mas abre espaço", "respirar-abre-espaco", "Ansiedade", "ansiedade", "assets/images/img-2.png"],
  ["Acolher emoções sem precisar consertá-las", "acolher-emocoes", "Autoconhecimento", "autoconhecimento", "assets/images/img-3.png"],
  ["Vínculos seguros são construídos aos poucos", "vinculos-seguros", "Relacionamentos", "relacionamentos", "assets/images/img-1.png"],
  ["O corpo também comunica ansiedade", "o-corpo-comunica-ansiedade", "Ansiedade", "ansiedade", "assets/images/img.png"],
  ["Descansar sem transformar pausa em culpa", "descansar-sem-culpa", "Autoconhecimento", "autoconhecimento", "assets/images/img-2.png"],
  ["Presença é mais importante que resposta perfeita", "presenca-nas-relacoes", "Relacionamentos", "relacionamentos", "assets/images/img-3.png"],
  ["Criando uma rotina emocional possível", "rotina-emocional-possivel", "Ansiedade", "ansiedade", "assets/images/img-1.png"],
  ["Conhecer a si é um processo, não uma chegada", "autoconhecimento-como-processo", "Autoconhecimento", "autoconhecimento", "assets/images/img.png"],
  ["Afeto e autonomia podem caminhar juntos", "afeto-e-autonomia", "Relacionamentos", "relacionamentos", "assets/images/img-2.png"],
];

const MOCK_SUMMARY = "Reflexões para compreender emoções, construir novas possibilidades e cultivar uma relação mais cuidadosa consigo.";

const createMockBody = (title) => [
  {
    _type: "block",
    style: "normal",
    children: [{ _type: "span", text: `Às vezes, ${title.toLowerCase()} começa por movimentos muito pequenos: perceber o que acontece, nomear sensações e abrir espaço para uma resposta diferente.` }],
  },
  {
    _type: "block",
    style: "h2",
    children: [{ _type: "span", text: "Começar pela observação" }],
  },
  {
    _type: "block",
    style: "normal",
    children: [{ _type: "span", text: "Nem toda mudança precisa acontecer de uma vez. Observar pensamentos, emoções e reações com curiosidade ajuda a reconhecer padrões sem transformar essa percepção em mais uma cobrança." }],
  },
  {
    _type: "block",
    style: "blockquote",
    children: [{ _type: "span", text: "Cuidar de si também é aprender a respeitar o próprio ritmo." }],
  },
  {
    _type: "block",
    style: "h2",
    children: [{ _type: "span", text: "Construir possibilidades" }],
  },
  {
    _type: "block",
    style: "normal",
    children: [{ _type: "span", text: "O processo terapêutico pode oferecer um espaço seguro para compreender experiências, experimentar novas formas de se relacionar e construir escolhas mais alinhadas ao que faz sentido para você." }],
  },
];

export const MOCK_POSTS = MOCK_POST_DEFINITIONS.map((post, index) => {
  const [title, slug, categoryTitle, categorySlug, imageUrl] = post;
  const day = String(18 - index).padStart(2, "0");

  return {
    _id: `mock-post-${index + 1}`,
    title,
    slug,
    excerpt: MOCK_SUMMARY,
    category: { title: categoryTitle, slug: categorySlug },
    author: { name: "Kelly Cristina", imageUrl: "assets/images/avatar.webp" },
    coverImage: { imageUrl, alt: title },
    publishedAt: `2026-08-${day}T12:00:00.000Z`,
    readingTime: 5,
    body: createMockBody(title),
    seo: { title, description: MOCK_SUMMARY },
  };
});

export const DEFAULT_POST_SLUG = MOCK_POSTS[0].slug;

const isSanityConfigured = () => Boolean(SANITY_CONFIG.projectId.trim());

let sanityClientPromise;

const getSanityClient = async () => {
  if (!isSanityConfigured()) return null;

  if (!sanityClientPromise) {
    sanityClientPromise = import("https://esm.sh/@sanity/client@6").then(({ createClient }) =>
      createClient(SANITY_CONFIG)
    );
  }

  return sanityClientPromise;
};

const POST_CARD_PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  "category": {
    "title": category->title,
    "slug": category->slug.current
  },
  "author": {
    "name": author->name,
    "imageUrl": author->image.asset->url
  },
  "coverImage": {
    "imageUrl": coverImage.asset->url,
    "alt": coalesce(coverImage.alt, title)
  },
  publishedAt,
  readingTime
}`;

const getMockCategories = () => MOCK_CATEGORIES.map((category) => ({ ...category }));

export const getCategories = async () => {
  const client = await getSanityClient();
  if (!client) return getMockCategories();

  return client.fetch(`
    *[_type == "category" && count(*[_type == "post" && references(^._id)]) > 0]
      | order(title asc) { title, "slug": slug.current }
  `);
};

export const getPosts = async ({ category = "todos", offset = 0, limit = 9 } = {}) => {
  const client = await getSanityClient();

  if (!client) {
    const filtered = category === "todos"
      ? MOCK_POSTS
      : MOCK_POSTS.filter((post) => post.category.slug === category);

    return {
      items: filtered.slice(offset, offset + limit),
      total: filtered.length,
      source: "mock",
    };
  }

  const categoryFilter = category === "todos" ? "" : " && category->slug.current == $category";
  const params = { category, start: offset, end: offset + limit };
  const [items, total] = await Promise.all([
    client.fetch(`
      *[_type == "post" && defined(slug.current)${categoryFilter}]
        | order(publishedAt desc)[$start...$end] ${POST_CARD_PROJECTION}
    `, params),
    client.fetch(`count(*[_type == "post" && defined(slug.current)${categoryFilter}])`, params),
  ]);

  return { items, total, source: "sanity" };
};

export const getPostBySlug = async (slug) => {
  const client = await getSanityClient();

  if (!client) {
    const post = MOCK_POSTS.find((item) => item.slug === slug) || null;
    if (!post) return { post: null, related: [], source: "mock" };

    const related = MOCK_POSTS
      .filter((item) => item.slug !== slug && item.category.slug === post.category.slug)
      .slice(0, 3);

    return { post, related, source: "mock" };
  }

  const post = await client.fetch(`
    *[_type == "post" && slug.current == $slug][0] {
      ${POST_CARD_PROJECTION.slice(1, -1)},
      body[]{
        ...,
        _type == "image" => {
          "imageUrl": asset->url,
          alt,
          caption
        }
      },
      seo
    }
  `, { slug });

  if (!post) return { post: null, related: [], source: "sanity" };

  const related = await client.fetch(`
    *[_type == "post" && defined(slug.current) && slug.current != $slug && category->slug.current == $category]
      | order(publishedAt desc)[0...3] ${POST_CARD_PROJECTION}
  `, { slug, category: post.category.slug });

  return { post, related, source: "sanity" };
};
