import { DEFAULT_POST_SLUG, getPostBySlug } from "./blog-service.js";

const elements = {
  content: document.querySelector("[data-post-content]"),
  error: document.querySelector("[data-post-error]"),
  heroImage: document.querySelector("[data-post-hero-image]"),
  category: document.querySelector("[data-post-category]"),
  title: document.querySelector("[data-post-title]"),
  excerpt: document.querySelector("[data-post-excerpt]"),
  author: document.querySelector("[data-post-author]"),
  authorImage: document.querySelector("[data-post-author-image]"),
  date: document.querySelector("[data-post-date]"),
  readingTime: document.querySelector("[data-post-reading-time]"),
  body: document.querySelector("[data-post-body]"),
  relatedSection: document.querySelector("[data-related-section]"),
  relatedGrid: document.querySelector("[data-related-grid]"),
  share: document.querySelector("[data-share]"),
  shareFeedback: document.querySelector("[data-share-feedback]"),
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

const createElement = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

const appendBlockChildren = (element, block) => {
  const markDefinitions = new Map((block.markDefs || []).map((mark) => [mark._key, mark]));

  (block.children || []).forEach((child) => {
    let node = document.createTextNode(child.text || "");

    (child.marks || []).slice().reverse().forEach((mark) => {
      let wrapper;
      if (mark === "strong") wrapper = document.createElement("strong");
      else if (mark === "em") wrapper = document.createElement("em");
      else {
        const definition = markDefinitions.get(mark);
        if (definition?._type === "link" && definition.href) {
          wrapper = document.createElement("a");
          wrapper.href = definition.href;
          if (/^https?:\/\//.test(definition.href)) {
            wrapper.target = "_blank";
            wrapper.rel = "noopener noreferrer";
          }
        }
      }

      if (wrapper) {
        wrapper.append(node);
        node = wrapper;
      }
    });

    element.append(node);
  });
};

const renderPortableText = (blocks = []) => {
  const fragment = document.createDocumentFragment();
  let openList = null;

  const closeList = () => {
    openList = null;
  };

  blocks.forEach((block) => {
    if (block._type === "image" && block.imageUrl) {
      closeList();
      const figure = document.createElement("figure");
      const image = document.createElement("img");
      image.src = block.imageUrl;
      image.alt = block.alt || "";
      image.loading = "lazy";
      figure.append(image);

      if (block.caption) figure.append(createElement("figcaption", "", block.caption));
      fragment.append(figure);
      return;
    }

    if (block._type !== "block") return;

    if (block.listItem) {
      const listTag = block.listItem === "number" ? "ol" : "ul";
      if (!openList || openList.tagName.toLowerCase() !== listTag) {
        openList = document.createElement(listTag);
        fragment.append(openList);
      }
      const item = document.createElement("li");
      appendBlockChildren(item, block);
      openList.append(item);
      return;
    }

    closeList();

    const tagByStyle = {
      h2: "h2",
      h3: "h3",
      blockquote: "blockquote",
      normal: "p",
    };
    const element = document.createElement(tagByStyle[block.style] || "p");
    appendBlockChildren(element, block);
    fragment.append(element);
  });

  elements.body.replaceChildren(fragment);
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
  body.append(
    createElement("span", "tag text-tiny", post.category?.title || "Conteúdo"),
    createElement("h3", "blog-card__title", post.title),
    createElement("p", "blog-card__excerpt", post.excerpt)
  );
  card.append(imageWrap, body);
  return card;
};

const updateMetadata = (post) => {
  document.title = `${post.seo?.title || post.title} — Kelly Cristina`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = post.seo?.description || post.excerpt;
};

const SHARE_URL_BUILDERS = {
  whatsapp: (url, title) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  facebook: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  x: (url, title) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  linkedin: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
};

let shareFeedbackTimeoutId;
const showShareFeedback = (message) => {
  elements.shareFeedback.textContent = message;
  elements.shareFeedback.classList.add("is-visible");
  window.clearTimeout(shareFeedbackTimeoutId);
  shareFeedbackTimeoutId = window.setTimeout(() => {
    elements.shareFeedback.classList.remove("is-visible");
  }, 2500);
};

const setupShare = (post) => {
  const url = window.location.href;
  const title = post.title;

  elements.share.querySelectorAll("[data-share-network]").forEach((button) => {
    const build = SHARE_URL_BUILDERS[button.dataset.shareNetwork];
    if (!build) return;
    button.addEventListener("click", () => {
      window.open(build(url, title), "_blank", "noopener,noreferrer,width=600,height=500");
    });
  });

  elements.share.querySelector("[data-copy-link]")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(url);
      showShareFeedback("Link copiado!");
    } catch (error) {
      showShareFeedback("Não foi possível copiar o link.");
    }
  });
};

const renderPost = (post) => {
  elements.heroImage.src = post.coverImage?.imageUrl || "assets/images/hero-img.png";
  elements.heroImage.alt = post.coverImage?.alt || "";
  elements.category.textContent = post.category?.title || "Conteúdo";
  elements.title.textContent = post.title;
  elements.excerpt.textContent = post.excerpt;
  elements.author.textContent = post.author?.name || "Kelly Cristina";
  elements.authorImage.src = post.author?.imageUrl || "assets/images/avatar.webp";
  elements.authorImage.alt = post.author?.name ? `Foto de ${post.author.name}` : "";
  elements.date.textContent = formatDate(post.publishedAt);
  elements.date.dateTime = post.publishedAt;
  elements.readingTime.textContent = `${post.readingTime || 5} min de leitura`;
  renderPortableText(post.body);
  updateMetadata(post);
  setupShare(post);
};

const renderRelated = (posts) => {
  if (!posts.length) return;

  const fragment = document.createDocumentFragment();
  posts.forEach((post) => fragment.append(createPostCard(post)));
  elements.relatedGrid.replaceChildren(fragment);
  elements.relatedSection.hidden = false;
};

const showError = () => {
  elements.content.hidden = true;
  elements.error.hidden = false;
  document.body.classList.add("blog-post-page--error");
  document.title = "Post não encontrado — Kelly Cristina";
};

const initialize = async () => {
  const slug = new URLSearchParams(window.location.search).get("slug") || DEFAULT_POST_SLUG;

  try {
    const { post, related } = await getPostBySlug(slug);
    if (!post) {
      showError();
      return;
    }

    renderPost(post);
    renderRelated(related);
    elements.content.setAttribute("aria-busy", "false");
  } catch (error) {
    console.error("Falha ao carregar o post:", error);
    showError();
  }
};

initialize();
