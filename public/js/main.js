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
