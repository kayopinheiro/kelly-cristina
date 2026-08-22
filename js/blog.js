import { getCategories, getPosts } from "./blog-service.js";

const PAGE_SIZE = 9;

const elements = {
  filters: document.querySelector("[data-blog-filters]"),
  grid: document.querySelector("[data-blog-grid]"),
  count: document.querySelector("[data-blog-count]"),
  loadMore: document.querySelector("[data-blog-load-more]"),
  empty: document.querySelector("[data-blog-empty]"),
  error: document.querySelector("[data-blog-error]"),
  retry: document.querySelector("[data-blog-retry]"),
};

const requestedCategory = new URLSearchParams(window.location.search).get("categoria");

const state = {
  category: requestedCategory || "todos",
  offset: 0,
  total: 0,
  loading: false,
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const createElement = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

const createPostCard = (post) => {
  const card = createElement("a", "blog-card");
  card.href = `blog-post.html?slug=${encodeURIComponent(post.slug)}`;
  card.setAttribute("aria-label", `Ler: ${post.title}`);

  const imageWrap = createElement("div", "blog-card__image-wrap");
  const image = createElement("img", "blog-card__image");
  image.src = post.coverImage?.imageUrl || "assets/images/img.png";
  image.alt = post.coverImage?.alt || "";
  image.loading = "lazy";
  image.width = 640;
  image.height = 400;
  imageWrap.append(image);

  const body = createElement("div", "blog-card__body");
  const category = createElement("span", "tag text-tiny", post.category?.title || "Conteúdo");
  const title = createElement("h2", "blog-card__title", post.title);
  const excerpt = createElement("p", "blog-card__excerpt", post.excerpt);
  const meta = createElement("div", "blog-card__meta");
  const date = createElement("time", "", formatDate(post.publishedAt));
  date.dateTime = post.publishedAt;
  const readingTime = createElement("span", "", `${post.readingTime || 5} min de leitura`);
  meta.append(date, readingTime);
  body.append(category, title, excerpt, meta);
  card.append(imageWrap, body);

  return card;
};

const renderSkeletons = () => {
  elements.grid.replaceChildren();
  const fragment = document.createDocumentFragment();

  Array.from({ length: PAGE_SIZE }).forEach(() => {
    const skeleton = createElement("div", "blog-card blog-card--skeleton");
    skeleton.setAttribute("aria-hidden", "true");
    const image = createElement("div", "blog-card__image-wrap");
    const body = createElement("div", "blog-card__body");
    body.append(createElement("span"), createElement("span"), createElement("span"));
    skeleton.append(image, body);
    fragment.append(skeleton);
  });

  elements.grid.append(fragment);
};

const renderFilters = (categories) => {
  const allCategories = [{ title: "Todos", slug: "todos" }, ...categories];
  const validSlugs = new Set(allCategories.map((category) => category.slug));
  if (!validSlugs.has(state.category)) state.category = "todos";

  const fragment = document.createDocumentFragment();
  allCategories.forEach((category) => {
    const button = createElement("button", "blog-filter", category.title);
    button.type = "button";
    button.dataset.category = category.slug;
    button.classList.toggle("is-active", category.slug === state.category);
    button.setAttribute("aria-pressed", String(category.slug === state.category));
    fragment.append(button);
  });

  elements.filters.replaceChildren(fragment);
};

const updateFilterState = () => {
  elements.filters.querySelectorAll("[data-category]").forEach((button) => {
    const isActive = button.dataset.category === state.category;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
};

const updateUrl = () => {
  const url = new URL(window.location.href);
  if (state.category === "todos") url.searchParams.delete("categoria");
  else url.searchParams.set("categoria", state.category);
  window.history.replaceState({}, "", url);
};

const updateCatalogState = () => {
  const visible = Math.min(state.offset, state.total);
  const label = state.total === 1 ? "post" : "posts";
  elements.count.textContent = `${visible} de ${state.total} ${label}`;
  elements.empty.hidden = state.total !== 0;
  elements.loadMore.hidden = visible >= state.total || state.total === 0;
};

const loadPosts = async ({ reset = false } = {}) => {
  if (state.loading) return;
  state.loading = true;
  elements.error.hidden = true;
  elements.empty.hidden = true;
  elements.grid.setAttribute("aria-busy", "true");
  elements.loadMore.setAttribute("aria-busy", "true");
  elements.loadMore.disabled = true;

  if (reset) {
    state.offset = 0;
    renderSkeletons();
  }

  try {
    const result = await getPosts({
      category: state.category,
      offset: state.offset,
      limit: PAGE_SIZE,
    });

    const fragment = document.createDocumentFragment();
    result.items.forEach((post) => fragment.append(createPostCard(post)));

    if (reset) elements.grid.replaceChildren(fragment);
    else elements.grid.append(fragment);

    state.offset += result.items.length;
    state.total = result.total;
    updateCatalogState();
  } catch (error) {
    console.error("Falha ao carregar os posts:", error);
    if (reset) elements.grid.replaceChildren();
    elements.error.hidden = false;
    elements.count.textContent = "";
    elements.loadMore.hidden = true;
  } finally {
    state.loading = false;
    elements.grid.setAttribute("aria-busy", "false");
    elements.loadMore.setAttribute("aria-busy", "false");
    elements.loadMore.disabled = false;
  }
};

const initialize = async () => {
  renderSkeletons();

  try {
    const categories = await getCategories();
    renderFilters(categories);
    updateUrl();
    await loadPosts({ reset: true });
  } catch (error) {
    console.error("Falha ao iniciar o blog:", error);
    elements.grid.replaceChildren();
    elements.error.hidden = false;
    elements.grid.setAttribute("aria-busy", "false");
  }
};

elements.filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button || button.dataset.category === state.category) return;

  state.category = button.dataset.category;
  updateFilterState();
  updateUrl();
  loadPosts({ reset: true });
});

elements.loadMore.addEventListener("click", () => loadPosts());
elements.retry.addEventListener("click", () => loadPosts({ reset: true }));

initialize();
