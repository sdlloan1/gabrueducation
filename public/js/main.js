'use strict';

/* Mobile navigation */
document.querySelectorAll('[data-nav-toggle]').forEach((button) => {
  button.addEventListener('click', () => {
    const nav = document.querySelector('[data-nav]');
    if (!nav) return;
    const open = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
});

/* Blog category filter */
const filterButtons = document.querySelectorAll('[data-filter]');
if (filterButtons.length) {
  const cards = document.querySelectorAll('[data-post-grid] [data-category]');
  const empty = document.querySelector('[data-filter-empty]');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.getAttribute('data-filter');
      filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
      let visible = 0;
      cards.forEach((card) => {
        const match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.hidden = !match;
        if (match) visible += 1;
      });
      if (empty) empty.hidden = visible > 0;
    });
  });
}

/* Contact form */
const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
  const status = contactForm.querySelector('[data-form-status]');
  const submit = contactForm.querySelector('button[type="submit"]');

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const payload = Object.fromEntries(data.entries());

    if (!String(payload.name || '').trim() || !String(payload.email || '').trim() || !String(payload.message || '').trim()) {
      status.textContent = 'Please fill in your name, email and message.';
      status.className = 'form-status is-error';
      return;
    }

    submit.disabled = true;
    status.textContent = 'Sending…';
    status.className = 'form-status';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Something went wrong.');
      contactForm.reset();
      status.textContent = 'Thank you — your message has reached us. We will call you back soon.';
      status.className = 'form-status is-success';
    } catch (error) {
      status.textContent = error.message || 'We could not send that. Please try again.';
      status.className = 'form-status is-error';
    } finally {
      submit.disabled = false;
    }
  });
}

/* Writing desk: publish + delete */
const postForm = document.querySelector('[data-post-form]');
if (postForm) {
  const status = postForm.querySelector('[data-post-status]');
  const submit = postForm.querySelector('button[type="submit"]');
  const rows = document.querySelector('[data-post-rows]');
  const counter = document.querySelector('[data-post-count]');

  postForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(postForm).entries());

    if (String(payload.title || '').trim().length < 3 || String(payload.body || '').trim().length < 20) {
      status.textContent = 'A title and a post body of at least 20 characters are required.';
      status.className = 'form-status is-error';
      return;
    }

    submit.disabled = true;
    status.textContent = 'Publishing…';
    status.className = 'form-status';

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Could not publish that post.');

      const post = result.post;
      if (rows) {
        const emptyRow = rows.querySelector('[data-empty-row]');
        if (emptyRow) emptyRow.remove();
        const tr = document.createElement('tr');
        tr.setAttribute('data-slug', post.slug);
        tr.innerHTML =
          '<td data-label="Title"><a></a></td>' +
          '<td data-label="Category"></td>' +
          '<td data-label="Published"></td>' +
          '<td data-label="File"><code></code></td>' +
          '<td data-label="Action" class="col-action"><button class="btn btn-danger btn-sm" type="button" data-delete-post><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.2 7h13.6M9.6 7V4.8h4.8V7M7 7l.9 12.2h8.2L17 7"/><path d="M10.6 10.4v5.8M13.4 10.4v5.8"/></svg> Delete</button></td>';
        tr.querySelector('a').href = `/blog/${post.slug}`;
        tr.querySelector('a').textContent = post.title;
        tr.children[1].textContent = post.category;
        tr.children[2].textContent = post.date;
        tr.querySelector('code').textContent = post.file;
        tr.querySelector('[data-delete-post]').setAttribute('data-delete-post', post.slug);
        rows.prepend(tr);
      }
      if (counter) counter.textContent = String(Number(counter.textContent || 0) + 1);

      postForm.reset();
      const dateField = postForm.querySelector('input[name="date"]');
      if (dateField && !dateField.value) dateField.value = new Date().toISOString().slice(0, 10);

      status.innerHTML = 'Published. ';
      const link = document.createElement('a');
      link.href = `/blog/${post.slug}`;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Open the post →';
      status.appendChild(link);
      status.className = 'form-status is-success';
    } catch (error) {
      status.textContent = error.message || 'Could not publish that post.';
      status.className = 'form-status is-error';
    } finally {
      submit.disabled = false;
    }
  });

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-delete-post]');
    if (!button || button.disabled) return;
    const slug = button.getAttribute('data-delete-post');
    if (!slug) return;

    /* First press asks inside the page; the second press removes the post. */
    if (button.getAttribute('data-confirm') !== 'yes') {
      const label = button.innerHTML;
      button.setAttribute('data-confirm', 'yes');
      button.classList.add('is-confirming');
      button.textContent = 'Confirm delete';
      window.setTimeout(() => {
        if (!document.contains(button)) return;
        button.removeAttribute('data-confirm');
        button.classList.remove('is-confirming');
        button.innerHTML = label;
      }, 6000);
      return;
    }

    button.disabled = true;
    try {
      const response = await fetch(`/api/posts/${encodeURIComponent(slug)}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Could not delete that post.');
      const row = rows && rows.querySelector(`tr[data-slug="${slug}"]`);
      if (row) row.remove();
      if (counter) counter.textContent = String(Math.max(0, Number(counter.textContent || 0) - 1));
      status.textContent = 'Post deleted.';
      status.className = 'form-status';
    } catch (error) {
      button.disabled = false;
      status.textContent = error.message || 'Could not delete that post.';
      status.className = 'form-status is-error';
    }
  });
}
