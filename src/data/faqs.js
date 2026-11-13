// Shared FAQ content: powers the FAQ page, the home page block and its structured data.
export const FAQS = [
  {
    q: "What is Gabru Education?",
    a: "Gabru Education is an Indian digital marketplace for website and app templates, complete code files, AI prompt packs, online courses, software tools and PDF books. Every listing is ready to use, priced in INR and unlocked for life once your payment is approved.",
  },
  {
    q: "How do I receive my files after paying?",
    a: "Checkout is by UPI. Upload your payment screenshot, our team verifies it, and your files unlock automatically in My Library. The same download links are emailed to you, and you can download them again any time — access is lifetime.",
  },
  {
    q: "How long does payment approval take?",
    a: "Most UPI payments are verified within a few hours during working days, and always inside the verification window shown at checkout (24 hours by default). You get an in-app notification and an email as soon as the order is confirmed.",
  },
  {
    q: "What do the purchase options mean?",
    a: "Prompt only gives you the complete prompt text to build the project yourself. Complete code gives you the source code plus the full prompt. Hire developer means 50% now and the balance after your site goes live. App development is a full stack app — iOS, Android and web — built to order at the price shown on the listing.",
  },
  {
    q: "Do I need coding knowledge to use a template?",
    a: "No. Templates and prompt packs come with setup notes, and the prompt option is written so you can paste it into any AI builder. If you would rather have it done for you, choose Hire developer or App development on the product page.",
  },
  {
    q: "Can I use a template for my client projects?",
    a: "Yes. Each purchase licenses one end product, yours or a client's, with lifetime usage. You may not resell, redistribute or republish the template, code or prompt as a template, code pack or prompt pack of your own.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "UPI — Google Pay, PhonePe, Paytm or any UPI app — with manual verification of your payment screenshot. All prices and receipts are in Indian Rupees (INR).",
  },
  {
    q: "Are purchases refundable?",
    a: "Digital products are delivered instantly, so orders are non-refundable by default. If a refund window is enabled for a product, it is shown on the product page and in the refund policy before you pay.",
  },
  {
    q: "Do you offer support after I buy?",
    a: "Yes. Message us on WhatsApp or use the contact page and we help with setup, access problems and file downloads on working days. Custom work, maintenance and app builds are quoted separately.",
  },
  {
    q: "How do I contact Gabru Education?",
    a: "Use the contact page, email gabrueducation@gmail.com or message us on WhatsApp at +91 93106 01973. We reply on working days, usually within 24 hours.",
  },
];

export function faqJsonLd(faqs = FAQS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export const HOME_FAQS = FAQS.slice(0, 5);