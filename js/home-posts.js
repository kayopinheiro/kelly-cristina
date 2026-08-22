import { getPosts } from "./blog-service.js";

const createElement = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

const createPostCard = (post) => {
  const card = createElement("a", "card card--post");
  card.href = `blog-post.html?slug=${encodeURIComponent(post.slug)}`;
  card.setAttribute("aria-label", `Ler post: ${post.title}`);

  const image = createElement("img");
  image.src = post.coverImage?.imageUrl || "assets/images/img.png";
  image.alt = post.coverImage?.alt || "";

  const body = createElement("div", "card--post__body");
  const title = createElement("h3", "text-h6", post.title);
  title.style.margin = "16px 0 8px";

  body.append(
    createElement("span", "tag text-tiny", post.category?.title || "Conteúdo"),
    title,
    createElement("p", "text-small text-muted", post.excerpt)
  );

  card.append(image, body);
  return card;
};

const renderHomePosts = async () => {
  const grid = document.querySelector('[data-sanity="posts"]');
  if (!grid) return;

  try {
    const { items } = await getPosts({ limit: 3 });
    grid.replaceChildren(...items.map(createPostCard));
  } catch (error) {
    console.error("Falha ao carregar posts na home:", error);
    grid.replaceChildren();
  } finally {
    grid.setAttribute("aria-busy", "false");
  }
};

renderHomePosts();
