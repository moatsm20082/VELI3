/* ==========================================================================
   VELIX WEB SOLUTIONS — MAIN SCRIPT
   Vanilla JS — no dependencies
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initNavbar();
  initMobileNav();
  initCursor();
  initScrollReveal();
  initCounters();
  initContactForm();
  initYear();
  initActiveNavLink();
});

/* --------------------------------------------------------------------------
   Page loader — hides once window resources are ready
   -------------------------------------------------------------------------- */
function initLoader() {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;

  const hide = () => loader.classList.add('is-hidden');

  // Hide as soon as everything is loaded, with a small minimum-display time
  // so the animation doesn't just flash on fast connections.
  const minTime = new Promise((resolve) => setTimeout(resolve, 450));
  const loaded = new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });

  Promise.all([minTime, loaded]).then(hide);

  // Safety net in case load event never fires cleanly
  setTimeout(hide, 2500);
}

/* --------------------------------------------------------------------------
   Navbar — background/shrink on scroll
   -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* --------------------------------------------------------------------------
   Mobile navigation drawer
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!toggle || !mobileNav) return;

  const closeNav = () => {
    toggle.classList.remove('is-active');
    mobileNav.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    toggle.classList.toggle('is-active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });
}

/* --------------------------------------------------------------------------
   Custom cursor — subtle dot + ring that follows the pointer,
   expands over interactive elements. Disabled on touch devices via CSS.
   -------------------------------------------------------------------------- */
function initCursor() {
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  // Smoothly trail the ring behind the dot
  const animateRing = () => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateRing);
  };
  requestAnimationFrame(animateRing);

  const interactiveSelector = 'a, button, input, textarea, select, [data-cursor-hover]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) ring.classList.add('is-active');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) ring.classList.remove('is-active');
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
}

/* --------------------------------------------------------------------------
   Scroll reveal — fade/slide elements up as they enter the viewport
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   Animated stat counters
   -------------------------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseFloat(el.dataset.count);
    const duration = 1600;
    const start = performance.now();
    const isFloat = !Number.isInteger(target);

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = isFloat ? value.toFixed(1) : Math.round(value);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = isFloat ? target.toFixed(1) : target;
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   Contact form — lightweight client-side validation + friendly success state
   (No backend wired up: swap the submit handler for a real endpoint.)
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const success = document.querySelector('.form-success');

  const i18nText = (key, fallback) => {
    if (window.VELIX_I18N && typeof window.VELIX_I18N.t === 'function') {
      const val = window.VELIX_I18N.t(key);
      if (val) return val;
    }
    return fallback;
  };

  const getMessage = (field) => {
    const validity = field.validity;
    if (validity.valueMissing) return i18nText('t_val_required', 'This field is required.');
    if (validity.typeMismatch) return i18nText('t_val_email', 'Please enter a valid email address.');
    if (validity.patternMismatch) return i18nText('t_val_phone', 'Please enter a valid phone number.');
    if (validity.tooShort) return i18nText('t_val_tooshort', `Please enter at least ${field.minLength} characters.`).replace('{n}', field.minLength);
    return i18nText('t_val_generic', 'Please check this field.');
  };

  const validateField = (field) => {
    const wrapper = field.closest('.field');
    if (!wrapper) return true;
    const errorEl = wrapper.querySelector('.field-error');

    if (field.checkValidity()) {
      wrapper.classList.remove('is-invalid');
      if (field.value.trim()) wrapper.classList.add('is-valid');
      else wrapper.classList.remove('is-valid');
      if (errorEl) errorEl.textContent = '';
      field.removeAttribute('aria-invalid');
      return true;
    }

    wrapper.classList.add('is-invalid');
    wrapper.classList.remove('is-valid');
    field.setAttribute('aria-invalid', 'true');
    if (errorEl) errorEl.textContent = getMessage(field);
    return false;
  };

  // Live feedback as the person types/leaves a field
  form.querySelectorAll('input[required], textarea[required], input[type="email"]').forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.closest('.field').classList.contains('is-invalid')) validateField(field);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fields = Array.from(form.querySelectorAll('input, textarea')).filter((f) => f.required || f.type === 'email');
    const allValid = fields.map(validateField).every(Boolean);

    if (!allValid) {
      const firstInvalid = form.querySelector('.field.is-invalid input, .field.is-invalid textarea');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = i18nText('t_sending', 'Sending…');

    // Simulate network request. Replace with a real fetch() to your backend
    // or form service (e.g. Formspree) when wiring this up for production.
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalLabel;
      form.reset();
      form.querySelectorAll('.field').forEach((w) => w.classList.remove('is-valid', 'is-invalid'));
      if (success) success.classList.add('is-visible');
    }, 900);
  });
}

/* --------------------------------------------------------------------------
   Footer year
   -------------------------------------------------------------------------- */
function initYear() {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

/* --------------------------------------------------------------------------
   Highlight the current page in the nav based on the file name
   -------------------------------------------------------------------------- */
function initActiveNavLink() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach((link) => {
    const href = link.getAttribute('href').split('/').pop();
    if (href === path) link.classList.add('active');
  });
}
