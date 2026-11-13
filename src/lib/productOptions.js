import { discountPct, inr } from "@/lib/format";

/**
 * A product can be sold as one bundle or split into cheaper options (prompt,
 * code files, developer setup, full app build). This returns the options the
 * buyer can pick, cheapest first, always with a "full" option last.
 *
 * Every option carries: key, label, tagline, price (list price), payNow (what
 * is charged today), balance (amount due after a service goes live) and the
 * benefits shown under the selected option.
 */
export function getProductOptions(product) {
  if (!product) return [];

  const listPrice = Number(product.original_price) || 0;
  const salePrice = Number(product.discounted_price) || listPrice;
  const options = [];

  if (product.type === "service") {
    const min = Number(product.service_monthly_min) || 0;
    const max = Number(product.service_monthly_max) || 0;
    const advance = Number(product.service_advance) || salePrice;
    const monthly = min && max ? `${inr(min)}–${inr(max)} per month` : "Monthly plan";
    const benefits = [
      "Installation and setup done for you",
      product.delivery_note || "Ongoing fixes and updates handled by us",
    ].filter(Boolean);

    return [
      {
        key: "full",
        label: "Setup & maintenance",
        tagline: monthly,
        price: listPrice || advance,
        payNow: advance,
        balance: 0,
        benefits,
      },
    ];
  }

  if (product.has_prompt) {
    const promptPrice = Number(product.prompt_price) || 0;
    if (promptPrice > 0) {
      options.push({
        key: "prompt",
        label: "Prompt only",
        tagline: "The full AI prompt, copy and paste it",
        price: promptPrice,
        payNow: promptPrice,
        balance: 0,
        benefits: [
          `${Number(product.prompt_char_count) || 0} characters of tested prompt`,
          "Works with ChatGPT, Claude and Gemini",
        ],
      });
    }
  }

  if (product.has_code_file) {
    const codePrice = Number(product.code_price) || salePrice;
    options.push({
      key: "code",
      label: "Prompt + complete code",
      tagline: "The prompt and every source file",
      price: codePrice,
      payNow: codePrice,
      balance: 0,
      benefits: ["Everything in Prompt only", "Downloadable source files", product.delivery_note].filter(Boolean),
    });
  }

  const developerPrice = Number(product.developer_price) || 0;
  if (developerPrice > 0) {
    options.push({
      key: "developer",
      label: "Code + developer support",
      tagline: "Files plus help getting it live",
      price: developerPrice,
      payNow: developerPrice,
      balance: 0,
      benefits: ["Everything in Prompt + complete code", "Direct support from the developer"],
    });
  }

  const appDevPrice = Number(product.app_dev_price) || 0;
  if (appDevPrice > 0) {
    options.push({
      key: "app_dev",
      label: "Done for you",
      tagline: "We set the whole thing up for you",
      price: appDevPrice,
      payNow: appDevPrice,
      balance: 0,
      benefits: ["Everything in Code + developer support", "Deployed on your own domain"],
    });
  }

  const fullPrice = salePrice || listPrice;
  options.push({
    key: "full",
    label: options.length ? "Complete package" : "Full access — lifetime",
    tagline: "One payment, lifetime access",
    price: listPrice || fullPrice,
    payNow: fullPrice,
    balance: 0,
    benefits: [
      "Lifetime access to this product",
      product.has_code_file ? "Prompt and all source files" : "Every file that ships with it",
      "Free updates whenever it changes",
    ],
  });

  return options;
}

export function cheapestDiscount(product) {
  const options = getProductOptions(product);
  const cheapest = options.reduce((best, option) => (option.payNow < best.payNow ? option : best), options[0]);
  return cheapest ? discountPct(cheapest.price, cheapest.payNow) : 0;
}
