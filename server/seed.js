// Seeds a demo catalogue, settings and two accounts so the app has something to
// render the first time it boots. Safe to run on every start: it only fills
// collections that are still empty.
import crypto from 'node:crypto';

import { collection, initStore, newId, nowIso, save, getState, UPLOAD_DIR } from './store.js';

initStore();

function hash(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function makeUser(email, password, fullName, role) {
  const salt = crypto.randomBytes(16).toString('hex');
  return {
    id: newId(),
    email,
    full_name: fullName,
    role,
    password_salt: salt,
    password_hash: hash(password, salt),
    is_verified: true,
    created_date: nowIso(),
  };
}

const users = getState().users;
if (!users.length) {
  users.push(makeUser('admin@gabrueducation.com', 'Gabru@12345', 'Gabru Admin', 'admin'));
  users.push(makeUser('demo@gabrueducation.com', 'Demo@12345', 'Demo Buyer', 'user'));
  save();
  console.log('[seed] created admin@gabrueducation.com and demo@gabrueducation.com');
}

const image = (name, label, w = 800, h = 600) =>
  `/api/placeholders/${name}.svg?label=${encodeURIComponent(label)}&w=${w}&h=${h}`;

function create(name, data) {
  const record = { id: newId(), created_date: nowIso(), updated_date: nowIso(), ...data };
  collection(name).push(record);
  return record;
}

function ensure(name, rows) {
  if (collection(name).length) return false;
  rows.forEach((row) => create(name, row));
  save();
  return true;
}

// ---------------------------------------------------------------- categories
const categorySeeds = [
  { name: 'Website Templates', slug: 'website-templates', image_url: image('cat-templates', 'Website Templates', 400, 400), description: 'Ready-to-launch websites you can deploy in an afternoon.', sort_order: 1 },
  { name: 'AI Prompts', slug: 'ai-prompts', image_url: image('cat-prompts', 'AI Prompts', 400, 400), description: 'Tested prompt packs for ChatGPT, Claude and Gemini.', sort_order: 2 },
  { name: 'Code Files', slug: 'code-files', image_url: image('cat-code', 'Code Files', 400, 400), description: 'Complete, commented source code for real projects.', sort_order: 3 },
  { name: 'Courses', slug: 'courses', image_url: image('cat-courses', 'Courses', 400, 400), description: 'Step-by-step video courses in Hindi and English.', sort_order: 4 },
  { name: 'Software', slug: 'software', image_url: image('cat-software', 'Software', 400, 400), description: 'Small tools that do one job very well.', sort_order: 5 },
  { name: 'eBooks', slug: 'ebooks', image_url: image('cat-ebooks', 'eBooks', 400, 400), description: 'Practical PDF playbooks you can finish in a sitting.', sort_order: 6 },
  { name: 'Services', slug: 'services', image_url: image('cat-services', 'Services', 400, 400), description: 'Done-for-you setup and maintenance.', sort_order: 7 },
];
ensure('Category', categorySeeds.map((category) => ({ ...category, is_active: true })));

const categoryBySlug = Object.fromEntries(collection('Category').map((category) => [category.slug, category]));
const cat = (slug) => {
  const category = categoryBySlug[slug];
  return { category_id: category?.id || '', category_name: category?.name || '' };
};

// -------------------------------------------------------------------- banners
ensure('Banner', [
  {
    title: 'Templates that look expensive',
    subtitle: 'Premium website and app templates, built for Indian businesses.',
    badge: 'New this week',
    cta_label: 'Browse templates',
    link: '/category/website-templates',
    image_url: image('banner-templates', 'Website templates', 1200, 600),
    sort_order: 1,
    is_active: true,
  },
  {
    title: '500+ AI prompts inside',
    subtitle: 'Prompt packs that actually ship content you can post today.',
    badge: 'Best seller',
    cta_label: 'See prompt packs',
    link: '/category/ai-prompts',
    image_url: image('banner-prompts', 'AI prompt packs', 1200, 600),
    sort_order: 2,
    is_active: true,
  },
]);

// ------------------------------------------------------------------- products
const productSeeds = [
  {
    title: 'Portfolio Website Template — React + Tailwind',
    slug: 'portfolio-website-template-react-tailwind',
    type: 'template',
    ...cat('website-templates'),
    images: [image('portfolio-1', 'Portfolio template'), image('portfolio-2', 'Dark mode')],
    short_description: 'A fast, single-page portfolio with dark mode and a working contact form.',
    description:
      'A clean portfolio for freelancers and students. Built with React, Vite and Tailwind CSS, and deployed in minutes on Netlify or Vercel.\n\nWhat you get:\n- Every source file, commented\n- Dark mode and light mode\n- Working contact form\n- SEO tags already set up',
    tags: ['react', 'tailwind', 'portfolio'],
    original_price: 1499,
    discounted_price: 799,
    badge: 'best_offer',
    has_prompt: false,
    has_code_file: true,
    delivery_note: 'Source files are delivered as a ZIP after payment approval.',
    rating_avg: 4.6,
    rating_count: 2,
    sales_count: 42,
    is_active: true,
    is_featured: true,
    seo_title: 'Portfolio Website Template — React + Tailwind | Gabru Education',
    seo_description: 'Buy a fast, responsive portfolio template built with React, Vite and Tailwind CSS.',
  },
  {
    title: 'E-Commerce Starter — Full-Stack Template',
    slug: 'ecommerce-starter-full-stack-template',
    type: 'template',
    ...cat('website-templates'),
    images: [image('ecommerce-1', 'E-commerce store'), image('ecommerce-2', 'Admin panel')],
    short_description: 'Store, cart, UPI checkout and an admin panel — ready to customise.',
    description:
      'Everything a small online store needs: product catalogue, cart, UPI checkout with screenshot upload, order approval and an admin dashboard.\n\nRuns on React + Vite with a Node API.',
    tags: ['ecommerce', 'react', 'node'],
    original_price: 4999,
    discounted_price: 2499,
    badge: 'best_choice',
    has_prompt: true,
    prompt_price: 899,
    prompt_preview: 'You are a senior full-stack engineer. Build a production-ready e-commerce store…',
    prompt_char_count: 8600,
    has_code_file: true,
    code_price: 2499,
    developer_price: 3999,
    app_dev_price: 9999,
    delivery_note: 'Includes a setup guide and one year of free updates.',
    rating_avg: 4.8,
    rating_count: 3,
    sales_count: 96,
    is_active: true,
    is_featured: true,
  },
  {
    title: '500 ChatGPT Prompts for Instagram Growth',
    slug: '500-chatgpt-prompts-instagram-growth',
    type: 'prompt',
    ...cat('ai-prompts'),
    images: [image('prompts-instagram', '500 AI prompts'), image('prompts-instagram-2', 'Prompt pack')],
    short_description: 'Reels scripts, captions, hooks and hashtags — all in one prompt pack.',
    description: '500 tested prompts organised by goal: reach, engagement, DMs and sales. Copy, paste, fill in your niche.',
    tags: ['chatgpt', 'instagram', 'marketing'],
    original_price: 499,
    discounted_price: 199,
    badge: 'trending',
    has_prompt: true,
    prompt_price: 199,
    prompt_preview: 'Act as an Instagram growth strategist for a [niche] account. Write 10 reel hooks…',
    prompt_char_count: 48000,
    has_code_file: false,
    rating_avg: 4.4,
    rating_count: 2,
    sales_count: 210,
    is_active: true,
    is_featured: true,
  },
  {
    title: 'AI Resume Builder — Complete Code File',
    slug: 'ai-resume-builder-complete-code',
    type: 'code_file',
    ...cat('code-files'),
    images: [image('resume-1', 'AI resume builder'), image('resume-2', 'PDF export')],
    short_description: 'A working AI resume builder you can rebrand and sell.',
    description: 'React front end, Node API, streaming AI suggestions and PDF export. Ships with the prompt that powers it.',
    tags: ['resume', 'ai', 'react'],
    original_price: 1999,
    discounted_price: 999,
    has_prompt: true,
    prompt_price: 399,
    prompt_preview: 'You are an expert resume writer. Rewrite the following experience bullet…',
    prompt_char_count: 22000,
    has_code_file: true,
    code_price: 999,
    developer_price: 1499,
    rating_avg: 4.5,
    rating_count: 1,
    sales_count: 64,
    is_active: true,
    is_featured: true,
  },
  {
    title: 'Full-Stack Web Development Course',
    slug: 'full-stack-web-development-course',
    type: 'course',
    ...cat('courses'),
    images: [image('course-1', 'Full-stack course'), image('course-2', '32 hours of lessons')],
    short_description: '32 hours of project-based lessons, from HTML to deployment.',
    description: 'Learn by building: a portfolio, a dashboard and a full store. Hindi and English subtitles included.',
    tags: ['course', 'javascript', 'react'],
    original_price: 4999,
    discounted_price: 2499,
    badge: 'trending',
    has_prompt: false,
    has_code_file: false,
    rating_avg: 4.7,
    rating_count: 2,
    sales_count: 128,
    is_active: true,
    is_featured: true,
  },
  {
    title: 'Invoice & GST Billing Software',
    slug: 'invoice-gst-billing-software',
    type: 'software',
    ...cat('software'),
    images: [image('invoice-1', 'GST billing')],
    short_description: 'Offline billing for small shops with GST invoices and PDF export.',
    description: 'Runs in the browser, stores data locally, prints GST invoices and exports monthly reports.',
    tags: ['gst', 'billing', 'offline'],
    original_price: 2499,
    discounted_price: 1299,
    has_prompt: false,
    has_code_file: false,
    rating_avg: 4.2,
    rating_count: 1,
    sales_count: 33,
    is_active: true,
  },
  {
    title: 'Digital Marketing Playbook (PDF)',
    slug: 'digital-marketing-playbook-pdf',
    type: 'ebook',
    ...cat('ebooks'),
    images: [image('playbook-1', 'Marketing playbook')],
    short_description: 'A 120-page playbook for your first ₹1 lakh online.',
    description: 'Practical chapters on offer building, pricing, ads and follow-up — written for Indian small businesses.',
    tags: ['marketing', 'ebook'],
    original_price: 399,
    discounted_price: 149,
    has_prompt: false,
    has_code_file: false,
    rating_avg: 4.3,
    rating_count: 1,
    sales_count: 87,
    is_active: true,
  },
  {
    title: 'School Website Setup & Maintenance',
    slug: 'school-website-setup-maintenance',
    type: 'service',
    ...cat('services'),
    images: [image('school-1', 'School website')],
    short_description: 'We set up your school website and keep it running.',
    description: 'Domain, hosting, forms and updates handled for you every month.',
    tags: ['service', 'school'],
    original_price: 2999,
    discounted_price: 2999,
    has_prompt: false,
    has_code_file: false,
    service_monthly_min: 1999,
    service_monthly_max: 4999,
    service_advance: 999,
    delivery_note: 'Monthly plan bills on the same date every month.',
    rating_avg: 4.9,
    rating_count: 1,
    sales_count: 12,
    is_active: true,
  },
];
ensure('Product', productSeeds);

const productBySlug = Object.fromEntries(collection('Product').map((product) => [product.slug, product]));

// A locked secret for the e-commerce template so buyers can see the download flow.
const ecommerce = productBySlug['ecommerce-starter-full-stack-template'];
if (ecommerce && !collection('ProductSecret').length) {
  create('ProductSecret', {
    product_id: ecommerce.id,
    full_prompt_text:
      'You are a senior full-stack engineer. Build a production-ready e-commerce store with a React storefront, a Node API, UPI checkout, order approval and an admin dashboard…',
    prompt_file_name: 'ecommerce-build-prompt.txt',
    prompt_file_uri: '',
    delivery_file_name: 'ecommerce-starter-source.zip',
    delivery_file_uri: '',
    extra_files: [],
  });
  save();
}

// --------------------------------------------------------------------- reviews
const reviewSeeds = [
  { slug: 'portfolio-website-template-react-tailwind', name: 'Rahul K.', rating: 5, title: 'Deployed the same day', comment: 'Clean code, easy to change the colours, and the contact form worked first try.' },
  { slug: 'portfolio-website-template-react-tailwind', name: 'Neha S.', rating: 4, title: 'Great value', comment: 'Wish it had a blog section, but for this price it is excellent.' },
  { slug: 'ecommerce-starter-full-stack-template', name: 'Aman D.', rating: 5, title: 'Saved me a month', comment: 'The UPI approval flow is exactly what my store needed.' },
  { slug: 'ecommerce-starter-full-stack-template', name: 'Priya M.', rating: 5, title: 'Worth it', comment: 'Support on WhatsApp was quick when I got stuck with the database.' },
  { slug: 'ecommerce-starter-full-stack-template', name: 'Vikram J.', rating: 4, title: 'Solid base', comment: 'Customised it for my furniture shop in two evenings.' },
  { slug: '500-chatgpt-prompts-instagram-growth', name: 'Simran G.', rating: 5, title: 'Reels got easier', comment: 'The hook prompts alone are worth the price.' },
  { slug: '500-chatgpt-prompts-instagram-growth', name: 'Karan P.', rating: 4, title: 'Good pack', comment: 'Would love more prompts for YouTube Shorts.' },
  { slug: 'ai-resume-builder-complete-code', name: 'Ishaan R.', rating: 5, title: 'Real working code', comment: 'Not a tutorial project — this actually runs.' },
  { slug: 'full-stack-web-development-course', name: 'Aditi B.', rating: 5, title: 'Clear explanations', comment: 'The deployment lessons finally made hosting click for me.' },
  { slug: 'full-stack-web-development-course', name: 'Manav T.', rating: 4, title: 'Very practical', comment: 'Good pace, though I had to rewatch the auth module.' },
  { slug: 'invoice-gst-billing-software', name: 'Shopkeeper Ravi', rating: 4, title: 'Does the job', comment: 'Invoices print correctly with GST breakdown.' },
  { slug: 'digital-marketing-playbook-pdf', name: 'Tanya V.', rating: 4, title: 'Useful playbook', comment: 'Short and practical — I read it in one sitting.' },
  { slug: 'school-website-setup-maintenance', name: 'Principal Meera', rating: 5, title: 'Zero stress', comment: 'They handled everything, including the domain renewal.' },
];

if (!collection('Review').length) {
  for (const review of reviewSeeds) {
    const product = productBySlug[review.slug];
    if (!product) continue;
    create('Review', {
      product_id: product.id,
      user_id: '',
      name: review.name,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      images: [],
      is_verified: true,
      is_hidden: false,
    });
  }
  save();
}

// ---------------------------------------------------------------- blog posts
ensure('Blog', [
  {
    title: 'How to price a website template in India',
    slug: 'how-to-price-a-website-template-in-india',
    cover_image: image('blog-pricing', 'Pricing templates', 1200, 700),
    excerpt: 'A simple pricing ladder that works for solo builders and small studios.',
    content:
      '## Start with the outcome, not the code\n\nBuyers compare your template to the cost of hiring someone. Price against that number.\n\n## Use three tiers\n\n- **Prompt only** for people who already build\n- **Code** for people who want the files\n- **Done for you** for people who want it live\n\nEach tier should feel obvious next to the one above it.',
    category: 'Business',
    tags: ['pricing', 'templates'],
    author: 'Gabru Education',
    read_time: 6,
    is_published: true,
    views: 0,
    seo_title: 'How to price a website template in India — Gabru Education',
    seo_description: 'A practical three-tier pricing ladder for selling website templates in India.',
  },
  {
    title: 'UPI payments without a payment gateway',
    slug: 'upi-payments-without-a-payment-gateway',
    cover_image: image('blog-upi', 'UPI payments', 1200, 700),
    excerpt: 'The manual UPI flow most Indian digital stores actually start with.',
    content:
      '## Why start manual\n\nA gateway needs approvals and takes a cut. For your first fifty orders, a UPI ID and a screenshot upload is enough.\n\n## How the flow works\n\n1. The buyer scans your UPI QR\n2. They upload the payment screenshot\n3. You approve the order from the admin panel\n4. Their downloads unlock instantly',
    category: 'Payments',
    tags: ['upi', 'payments'],
    author: 'Gabru Education',
    read_time: 4,
    is_published: true,
    views: 0,
  },
]);

// ------------------------------------------------------------------ settings
const settings = collection('SiteSettings');
if (!settings.length) {
  create('SiteSettings', {
    key: 'main',
    brand_name: 'Gabru Education',
    tagline: 'Templates, prompts, courses & tools',
    upi_id: 'gabrueducation@upi',
    upi_name: 'Gabru Education',
    support_whatsapp: '',
    support_email: 'gabrueducation@gmail.com',
    refund_enabled: true,
    refund_days: 3,
    pending_hours: 24,
    refund_policy:
      'All products on Gabru Education are digital goods that are delivered instantly after your payment is approved. By default every product is non-refundable. If a refund window is enabled for a product, it is shown before you place the order.',
  });
  save();
}

console.log(`[seed] ready — ${collection('Product').length} products, ${collection('Category').length} categories, uploads in ${UPLOAD_DIR}`);
