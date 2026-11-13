const SEARCH_FIELDS = ["title", "short_description", "description", "tags", "category_name"];

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds a forgiving product query: every word the buyer types must appear
 * somewhere in the product, so "e comm" still finds "E-Commerce" or
 * "E   Commerce" titles.
 */
export function buildSearchQuery(raw) {
  const tokens = String(raw || "")
    .trim()
    .split(/\s+/)
    .filter((token) => token.length >= 2);
  if (!tokens.length) return {};
  return {
    $and: tokens.map((token) => {
      const needle = escapeRegex(token);
      return { $or: SEARCH_FIELDS.map((field) => ({ [field]: { $regex: needle, $options: "i" } })) };
    }),
  };
}