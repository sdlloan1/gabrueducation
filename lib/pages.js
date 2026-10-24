'use strict';

const { escapeHtml, formatDate } = require('./utils');
const { icon, page } = require('./layout');

const FEATURES = [
  {
    icon: 'users',
    title: 'Batches capped at 18',
    text: 'Every teacher knows every student by name, and no doubt waits for the back of a crowded hall.'
  },
  {
    icon: 'help',
    title: 'Doubt desk, every evening',
    text: 'A teacher stays back from 6:00 to 8:00 PM so questions are answered the same day they appear.'
  },
  {
    icon: 'clipboard',
    title: 'Weekly tests with feedback',
    text: 'Short, honest tests every week, returned with a written plan for what to fix next.'
  },
  {
    icon: 'chart',
    title: 'Monthly parent report',
    text: 'Attendance, test scores and a short teacher note, so families are never guessing.'
  }
];

const STEPS = [
  { icon: 'chat', title: 'Free counselling', text: 'A 30-minute conversation about the student, the goal and the timeline.' },
  { icon: 'clipboard', title: 'Diagnostic test', text: 'A short test that shows exactly which concepts are shaky.' },
  { icon: 'pencil', title: 'Study plan', text: 'A term-wise plan built around the student, not around a printed brochure.' },
  { icon: 'target', title: 'Weekly review', text: 'Tests, feedback and course corrections until the goal is met.' }
];

const TESTIMONIALS = [
  {
    quote: 'The weekly tests were the turning point. I could finally see which chapters were actually weak instead of guessing.',
    name: 'Harleen Kaur',
    role: 'Class 12 student, scored 94% in boards'
  },
  {
    quote: 'The evening doubt desk meant my son never carried a question home. That alone changed our routine.',
    name: 'Rakesh Sharma',
    role: 'Parent of a Class 9 student'
  },
  {
    quote: 'Small batches, patient teachers and honest feedback. My daughter started studying on her own for the first time.',
    name: 'Simran Gill',
    role: 'Parent of a Class 11 student'
  }
];

const VALUES = [
  { icon: 'book', title: 'Concepts before shortcuts', text: 'We teach the reasoning first. Tricks are useful only after the idea is understood.' },
  { icon: 'users', title: 'Small and personal', text: 'Eighteen students per batch so a teacher can see the whole room in one glance.' },
  { icon: 'clipboard', title: 'Feedback you can act on', text: 'No vague "work harder" remarks — every test comes back with specific next steps.' },
  { icon: 'award', title: 'Honest guidance', text: 'If a student needs a different path, we say so and help them find it.' }
];

const TEAM = [
  { name: 'Amritpal Singh', role: 'Founder & Physics faculty', tag: 'AS', detail: '14 years of physics teaching, JEE and boards.' },
  { name: 'Neha Bansal', role: 'Head of Mathematics', tag: 'NB', detail: 'Builds the problem sheets and weekly test papers.' },
  { name: 'Rajan Verma', role: 'Chemistry faculty', tag: 'RV', detail: 'Former college lecturer, NEET and boards.' },
  { name: 'Priya Dua', role: 'Biology & Communications', tag: 'PD', detail: 'NEET biology plus the spoken English programme.' }
];

const MILESTONES = [
  { year: '2013', text: 'Gabru Education starts as a two-room tuition centre in Chandigarh.' },
  { year: '2017', text: 'Batch size capped at 18 and the evening doubt desk is introduced.' },
  { year: '2021', text: 'Online test series and monthly parent reports go live.' },
  { year: '2025', text: 'Over 1,200 students coached, with dedicated JEE and NEET batches.' }
];

const FAQS = [
  { q: 'How large are the batches?', a: 'Every batch is capped at 18 students. When it fills, a new batch is opened instead of adding chairs.' },
  { q: 'Can we try a class before paying?', a: 'Yes. Every new student gets one free demo class with the batch they would join, no deposit required.' },
  { q: 'What if a student joins late?', a: 'We run a catch-up plan for the missed chapters — extra sessions in the first three weeks at no extra cost.' },
  { q: 'Are fees monthly or per term?', a: 'Fees are monthly and payable at the start of each month. Term packages are available with a small discount.' }
];

/* ------------------------------------------------------------------ pieces */

function sectionHead(kicker, title, text) {
  return `<div class="section-head">
    ${kicker ? `<p class="eyebrow">${escapeHtml(kicker)}</p>` : ''}
    <h2>${escapeHtml(title)}</h2>
    ${text ? `<p class="section-text">${escapeHtml(text)}</p>` : ''}
  </div>`;
}

function courseCard(course) {
  return `<article class="card course-card" id="${escapeHtml(course.slug)}" data-categories="">
    <div class="course-card-top">
      <span class="course-icon">${icon(course.icon || 'spark')}</span>
      <span class="pill">${escapeHtml(course.level)}</span>
    </div>
    <h3>${escapeHtml(course.title)}</h3>
    <p class="card-text">${escapeHtml(course.summary)}</p>
    <ul class="tick-list">
      ${(course.highlights || []).map((item) => `<li>${icon('check')}<span>${escapeHtml(item)}</span></li>`).join('\n      ')}
    </ul>
    <dl class="course-meta">
      <div><dt>Duration</dt><dd>${escapeHtml(course.duration)}</dd></div>
      <div><dt>Format</dt><dd>${escapeHtml(course.mode)}</dd></div>
      <div><dt>Fee</dt><dd>${escapeHtml(course.fee)}</dd></div>
    </dl>
    <a class="card-link" href="/contact">Enquire about this course ${icon('arrow')}</a>
  </article>`;
}

function postCard(post) {
  return `<article class="card post-card" data-category="${escapeHtml(post.category)}">
    <p class="post-card-meta"><span class="badge">${escapeHtml(post.category)}</span> <time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time></p>
    <h3><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a></h3>
    <p class="card-text">${escapeHtml(post.excerpt)}</p>
    <p class="post-card-foot">By ${escapeHtml(post.author)} <span aria-hidden="true">&middot;</span> <span class="file-chip">${escapeHtml(post.file)}</span></p>
  </article>`;
}

function ctaBand(site) {
  return `<section class="cta-band">
    <div class="container cta-inner">
      <div>
        <h2>Book a free demo class</h2>
        <p>Sit in on a real class, meet the faculty and see whether the pace suits your child — no obligation.</p>
      </div>
      <div class="cta-actions">
        <a class="btn btn-light" href="/contact">Request a demo ${icon('arrow')}</a>
        <a class="btn btn-ghost-light" href="tel:${escapeHtml(String(site.phone).replace(/\s/g, ''))}">Call ${escapeHtml(site.phone)}</a>
      </div>
    </div>
  </section>`;
}

/* ------------------------------------------------------------------- pages */

function home(site, courses, posts) {
  const featured = courses.slice(0, 3);
  const latest = posts.slice(0, 3);

  const body = `    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-copy">
          <p class="eyebrow eyebrow-light">Admissions open for the 2026–27 session</p>
          <h1>Learning that builds confident, curious students.</h1>
          <p class="hero-text">Small batches, a daily doubt desk and honest weekly feedback — for classes 6 to 12 and competitive exams.</p>
          <div class="hero-actions">
            <a class="btn btn-light" href="/courses">Explore courses ${icon('arrow')}</a>
            <a class="btn btn-ghost-light" href="/contact">Talk to a counsellor</a>
          </div>
          <dl class="hero-stats">
            <div><dt>1,200+</dt><dd>students coached</dd></div>
            <div><dt>18</dt><dd>students per batch</dd></div>
            <div><dt>96%</dt><dd>board pass rate</dd></div>
            <div><dt>12 yrs</dt><dd>of teaching</dd></div>
          </dl>
        </div>
        <div class="hero-art-wrap">
          <img class="hero-art" src="/img/hero.svg" width="720" height="560" alt="Illustration of books, a graduation cap and study notes">
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${sectionHead('Why Gabru', 'Teaching that keeps every student in view', 'Most students do not need more lectures. They need someone to notice when a concept has not landed — and to fix it that week.')}
        <div class="grid grid-4">
          ${FEATURES.map((feature) => `<article class="card feature-card">
            <span class="feature-icon">${icon(feature.icon)}</span>
            <h3>${escapeHtml(feature.title)}</h3>
            <p class="card-text">${escapeHtml(feature.text)}</p>
          </article>`).join('\n          ')}
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        ${sectionHead('Courses', 'Programmes built around one goal at a time', 'From the foundation years to the final year of competitive preparation, each programme has its own pace, test cycle and mentor.')}
        <div class="grid grid-3">
          ${featured.map(courseCard).join('\n          ')}
        </div>
        <p class="section-more"><a class="btn btn-outline" href="/courses">See all ${courses.length} programmes ${icon('arrow')}</a></p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${sectionHead('How it works', 'Four steps from first call to first result', '')}
        <ol class="steps">
          ${STEPS.map((step, index) => `<li class="step">
            <span class="step-number">${index + 1}</span>
            <span class="step-icon">${icon(step.icon)}</span>
            <h3>${escapeHtml(step.title)}</h3>
            <p>${escapeHtml(step.text)}</p>
          </li>`).join('\n          ')}
        </ol>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        ${sectionHead('From our families', 'What students and parents say', '')}
        <div class="grid grid-3">
          ${TESTIMONIALS.map((item) => `<figure class="card quote-card">
            <blockquote>${escapeHtml(item.quote)}</blockquote>
            <figcaption><span class="avatar">${escapeHtml(item.name.split(' ').map((part) => part[0]).join('').slice(0, 2))}</span><span><strong>${escapeHtml(item.name)}</strong><em>${escapeHtml(item.role)}</em></span></figcaption>
          </figure>`).join('\n          ')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${sectionHead('From the blog', 'Notes for students and parents', latest.length ? 'Study routines, exam strategy and guidance — written by the faculty who teach here.' : '')}
        ${latest.length
          ? `<div class="grid grid-3">
          ${latest.map(postCard).join('\n          ')}
        </div>
        <p class="section-more"><a class="btn btn-outline" href="/blog">Read all posts ${icon('arrow')}</a></p>`
          : `<div class="empty-state"><p><strong>The blog is ready and waiting.</strong></p><p>Publish the first post from the staff console — every post is saved as its own HTML file.</p><a class="btn btn-primary" href="/admin">Write the first post ${icon('arrow')}</a></div>`}
      </div>
    </section>

    ${ctaBand(site)}`;

  return page({
    site,
    title: '',
    description: site.description,
    active: 'home',
    body
  });
}

function about(site) {
  const body = `    <section class="page-head">
      <div class="container page-head-inner">
        <p class="eyebrow eyebrow-light">About us</p>
        <h1>A neighbourhood classroom with serious academic standards.</h1>
        <p class="page-text">We started in ${escapeHtml(site.established)} with two rooms, one whiteboard and a simple rule: no student leaves with a doubt that could have been answered today.</p>
      </div>
    </section>

    <section class="section">
      <div class="container split">
        <div>
          <p class="eyebrow">Our story</p>
          <h2>Built by teachers, not by marketing.</h2>
          <p>Gabru Education began as evening tuition for a handful of Class 9 students in Chandigarh. Word travelled the way it usually does — a parent telling another parent that their child finally understood trigonometry.</p>
          <p>Twelve years later the batch size is still capped at eighteen, the doubt desk still runs every evening, and every family still receives a monthly report signed by the teacher who took the class.</p>
          <p>We keep the centre small on purpose. Growth for us means better teachers and better material, not more chairs squeezed into a hall.</p>
        </div>
        <aside class="card fact-card">
          <h3>At a glance</h3>
          <dl class="fact-list">
            <div><dt>Founded</dt><dd>${escapeHtml(site.established)}</dd></div>
            <div><dt>Students coached</dt><dd>1,200+</dd></div>
            <div><dt>Batch size</dt><dd>18 students</dd></div>
            <div><dt>Programmes</dt><dd>Foundation to JEE / NEET</dd></div>
            <div><dt>Hours</dt><dd>${escapeHtml(site.hours)}</dd></div>
          </dl>
        </aside>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        ${sectionHead('What we stand for', 'Four rules we do not bend', '')}
        <div class="grid grid-4">
          ${VALUES.map((value) => `<article class="card feature-card">
            <span class="feature-icon">${icon(value.icon)}</span>
            <h3>${escapeHtml(value.title)}</h3>
            <p class="card-text">${escapeHtml(value.text)}</p>
          </article>`).join('\n          ')}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${sectionHead('Our faculty', 'The people in the classroom', 'Every faculty member teaches the batch they mentor — there is no separate "doubt staff".')}
        <div class="grid grid-4">
          ${TEAM.map((member) => `<article class="card team-card">
            <span class="avatar avatar-lg">${escapeHtml(member.tag)}</span>
            <h3>${escapeHtml(member.name)}</h3>
            <p class="team-role">${escapeHtml(member.role)}</p>
            <p class="card-text">${escapeHtml(member.detail)}</p>
          </article>`).join('\n          ')}
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        ${sectionHead('Milestones', 'How the centre grew', '')}
        <ol class="timeline">
          ${MILESTONES.map((item) => `<li>
            <span class="timeline-year">${escapeHtml(item.year)}</span>
            <p>${escapeHtml(item.text)}</p>
          </li>`).join('\n          ')}
        </ol>
      </div>
    </section>

    ${ctaBand(site)}`;

  return page({
    site,
    title: 'About',
    description: `About ${site.name} — our story, our faculty and the rules we teach by.`,
    active: 'about',
    body
  });
}

function coursesPage(site, courses) {
  const body = `    <section class="page-head">
      <div class="container page-head-inner">
        <p class="eyebrow eyebrow-light">Courses</p>
        <h1>${courses.length} programmes, one honest pace each.</h1>
        <p class="page-text">Class sizes stay at eighteen, every programme runs its own weekly test cycle, and each student gets a mentor who teaches them.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="grid grid-3">
          ${courses.map(courseCard).join('\n          ')}
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container narrow">
        ${sectionHead('Questions parents ask', 'Before you join', '')}
        <div class="faq">
          ${FAQS.map((faq) => `<details class="faq-item">
            <summary>${escapeHtml(faq.q)}</summary>
            <p>${escapeHtml(faq.a)}</p>
          </details>`).join('\n          ')}
        </div>
      </div>
    </section>

    ${ctaBand(site)}`;

  return page({
    site,
    title: 'Courses',
    description: `Programmes at ${site.name}: foundation, board classes, JEE, NEET and spoken English.`,
    active: 'courses',
    body
  });
}

function blogPage(site, posts) {
  const categories = [...new Set(posts.map((post) => post.category))];

  const body = `    <section class="page-head">
      <div class="container page-head-inner">
        <p class="eyebrow eyebrow-light">Blog</p>
        <h1>Notes from the classroom.</h1>
        <p class="page-text">Study routines, exam strategy and career guidance — plus everything we publish from the staff console.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${posts.length
          ? `${categories.length > 1
            ? `<div class="filter-bar" role="group" aria-label="Filter posts by category">
          <button class="chip is-active" type="button" data-filter="all">All posts</button>
          ${categories.map((category) => `<button class="chip" type="button" data-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('\n          ')}
        </div>`
            : ''}
        <div class="grid grid-3" data-post-grid>
          ${posts.map(postCard).join('\n          ')}
        </div>
        <p class="filter-empty" data-filter-empty hidden>No posts in that category yet.</p>`
          : `<div class="empty-state">
          <p><strong>No posts published yet.</strong></p>
          <p>Every post you publish is written to its own HTML file in the <code>posts/</code> folder and appears here.</p>
          <a class="btn btn-primary" href="/admin">Write the first post ${icon('arrow')}</a>
        </div>`}
      </div>
    </section>

    <section class="section section-alt">
      <div class="container split split-tight">
        <div>
          <p class="eyebrow">How posting works</p>
          <h2>One post, one HTML file.</h2>
          <p>Open the staff console, write the post and publish. The site stores it as <code>posts/&lt;slug&gt;.html</code> — a complete, self-contained page with the styling baked in — and links it from this page.</p>
        </div>
        <div class="side-actions">
          <a class="btn btn-primary" href="/admin">Open the staff console ${icon('arrow')}</a>
          <a class="btn btn-outline" href="/contact">Ask a question</a>
        </div>
      </div>
    </section>`;

  return page({
    site,
    title: 'Blog',
    description: `Study and exam guidance from the faculty at ${site.name}.`,
    active: 'blog',
    body
  });
}

function contact(site, courses) {
  const body = `    <section class="page-head">
      <div class="container page-head-inner">
        <p class="eyebrow eyebrow-light">Contact</p>
        <h1>Let's find the right programme.</h1>
        <p class="page-text">Tell us the class, the subject or the exam, and we will call you back with a plan — usually the same day.</p>
      </div>
    </section>

    <section class="section">
      <div class="container contact-layout">
        <div class="contact-info">
          <h2>Visit or call</h2>
          <ul class="contact-list">
            <li>${icon('pin')}<span><strong>Centre</strong>${escapeHtml(site.address)}</span></li>
            <li>${icon('phone')}<span><strong>Phone</strong><a href="tel:${escapeHtml(String(site.phone).replace(/\s/g, ''))}">${escapeHtml(site.phone)}</a></span></li>
            <li>${icon('mail')}<span><strong>Email</strong><a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a></span></li>
            <li>${icon('clock')}<span><strong>Open</strong>${escapeHtml(site.hours)}</span></li>
          </ul>
          <div class="notice">
            <strong>Free demo class</strong>
            <p>Every new student can sit in on one real class before deciding. Mention it in your message and we will book a slot.</p>
          </div>
        </div>

        <form class="card contact-form" data-contact-form novalidate>
          <h2>Send us a message</h2>
          <div class="field-row">
            <label class="field">
              <span>Your name</span>
              <input type="text" name="name" required autocomplete="name" placeholder="e.g. Rakesh Sharma">
            </label>
            <label class="field">
              <span>Phone</span>
              <input type="tel" name="phone" autocomplete="tel" placeholder="Optional">
            </label>
          </div>
          <div class="field-row">
            <label class="field">
              <span>Email</span>
              <input type="email" name="email" required autocomplete="email" placeholder="you@example.com">
            </label>
            <label class="field">
              <span>Interested in</span>
              <select name="interest">
                <option value="">Not sure yet</option>
                ${courses.map((course) => `<option value="${escapeHtml(course.title)}">${escapeHtml(course.title)}</option>`).join('\n                ')}
              </select>
            </label>
          </div>
          <label class="field">
            <span>Message</span>
            <textarea name="message" rows="5" required placeholder="Tell us the class, subjects and what you are hoping to improve."></textarea>
          </label>
          <p class="form-status" data-form-status role="status" aria-live="polite"></p>
          <button class="btn btn-primary" type="submit">Send message ${icon('arrow')}</button>
        </form>
      </div>
    </section>`;

  return page({
    site,
    title: 'Contact',
    description: `Contact ${site.name} — address, phone, email and enquiry form.`,
    active: 'contact',
    body
  });
}

function notFound(site, path) {
  const body = `    <section class="section error-page">
      <div class="container narrow center">
        <p class="eyebrow">404</p>
        <h1>That page has moved on.</h1>
        <p class="page-text">We could not find <code>${escapeHtml(path)}</code>. Try the courses, the blog, or head back home.</p>
        <div class="side-actions center-actions">
          <a class="btn btn-primary" href="/">Back home ${icon('arrow')}</a>
          <a class="btn btn-outline" href="/blog">Read the blog</a>
        </div>
      </div>
    </section>`;

  return page({
    site,
    title: 'Page not found',
    description: 'The page you were looking for is not here.',
    active: '',
    body
  });
}

module.exports = { home, about, coursesPage, blogPage, contact, notFound, postCard };
