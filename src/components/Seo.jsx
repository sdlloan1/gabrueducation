import { useEffect } from "react";

function upsertMeta(attr, key, content) {
  if (!content) return null;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  const created = !el;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  const previous = el.getAttribute("content");
  el.setAttribute("content", content);
  return () => {
    if (created) el.remove();
    else if (previous !== null) el.setAttribute("content", previous);
  };
}

function upsertLink(rel, href) {
  if (!href) return null;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  const created = !el;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  return () => {
    if (created) el.remove();
  };
}

/**
 * Per-page SEO: title, description, keywords, canonical, Open Graph, JSON-LD.
 */
export default function Seo({ title, description, keywords, image, path, jsonLd }) {
  useEffect(() => {
    const cleanups = [];
    if (title) cleanups.push(upsertMeta("name", "title", title) || (() => {}));
    document.title = title || "Gabru Education";
    cleanups.push(upsertMeta("name", "description", description));
    cleanups.push(upsertMeta("name", "keywords", Array.isArray(keywords) ? keywords.join(", ") : keywords));
    cleanups.push(upsertMeta("property", "og:title", title));
    cleanups.push(upsertMeta("property", "og:description", description));
    cleanups.push(upsertMeta("property", "og:image", image));
    cleanups.push(upsertMeta("property", "og:type", "website"));
    cleanups.push(upsertMeta("name", "twitter:title", title));
    cleanups.push(upsertMeta("name", "twitter:description", description));
    cleanups.push(upsertMeta("name", "twitter:image", image));
    const canonical = upsertLink("canonical", path ? window.location.origin + path : window.location.href.split("?")[0]);
    cleanups.push(canonical);

    let script;
    if (jsonLd) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      cleanups.forEach((fn) => fn && fn());
      if (script) script.remove();
    };
  }, [title, description, keywords, image, path, JSON.stringify(jsonLd)]);

  return null;
}