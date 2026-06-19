/* ============================================================
   SM OPERATIONS — main.js
   Features: Hamburger Menu | Smooth Scroll | Form Validation
             | Gallery Lightbox | Scroll Animations | Back To Top
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────
     1. HAMBURGER MENU
  ────────────────────────────────────────── */
  const hamburger = document.querySelector('.hamburger');
  const nav       = document.querySelector('nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close nav when a link is clicked
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      });
    });

    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
        nav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      }
    });
  }


  /* ──────────────────────────────────────────
     2. ACTIVE NAV LINK
  ────────────────────────────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });


  /* ──────────────────────────────────────────
     3. SMOOTH SCROLL (anchor links)
  ────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* ──────────────────────────────────────────
     4. FORM VALIDATION
  ────────────────────────────────────────── */
  function wrapFieldsInGroups() {
    // Wraps each label+input pair in a .form-group div for proper error display
    document.querySelectorAll('form label').forEach(label => {
      const forId  = label.getAttribute('for');
      const field  = forId ? document.getElementById(forId) : label.nextElementSibling;
      if (!field || label.parentElement.classList.contains('form-group')) return;

      const group = document.createElement('div');
      group.className = 'form-group';
      label.parentNode.insertBefore(group, label);
      group.appendChild(label);
      group.appendChild(field);

      // Add error span
      if (!group.querySelector('.field-error')) {
        const err = document.createElement('span');
        err.className = 'field-error';
        group.appendChild(err);
      }
    });
  }

  function showError(field, message) {
    field.classList.add('invalid');
    const group = field.closest('.form-group');
    if (group) {
      const err = group.querySelector('.field-error');
      if (err) { err.textContent = message; err.classList.add('visible'); }
    }
  }

  function clearError(field) {
    field.classList.remove('invalid');
    const group = field.closest('.form-group');
    if (group) {
      const err = group.querySelector('.field-error');
      if (err) { err.textContent = ''; err.classList.remove('visible'); }
    }
  }

  function validateField(field) {
    const value = field.value.trim();
    if (field.hasAttribute('required') && value === '') {
      showError(field, 'This field is required.');
      return false;
    }
    if (field.type === 'email' && value !== '') {
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(value)) {
        showError(field, 'Please enter a valid email address.');
        return false;
      }
    }
    if (field.tagName === 'TEXTAREA' && value.length > 0 && value.length < 10) {
      showError(field, 'Please enter at least 10 characters.');
      return false;
    }
    clearError(field);
    return true;
  }

  function initFormValidation(form) {
    const fields = form.querySelectorAll('input[type="text"], input[type="email"], textarea');

    // Live validation on blur
    fields.forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('invalid')) validateField(field);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      fields.forEach(field => { if (!validateField(field)) valid = false; });

      if (valid) {
        // Show success message
        let success = form.querySelector('.form-success');
        if (!success) {
          success = document.createElement('div');
          success.className = 'form-success';
          success.textContent = '✓ Thank you! Your message has been received.';
          form.appendChild(success);
        }
        success.classList.add('visible');
        form.reset();
        // Hide success after 5 seconds
        setTimeout(() => success.classList.remove('visible'), 5000);
      }
    });
  }

  wrapFieldsInGroups();
  document.querySelectorAll('form').forEach(initFormValidation);


  /* ──────────────────────────────────────────
     5. GALLERY LIGHTBOX
  ────────────────────────────────────────── */
  function buildLightbox() {
    if (document.querySelector('.lightbox-overlay')) return; // already exists

    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image lightbox');

    overlay.innerHTML = `
      <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
      <img src="" alt="" class="lightbox-img">
      <p class="lightbox-caption"></p>
    `;
    document.body.appendChild(overlay);

    const img     = overlay.querySelector('.lightbox-img');
    const caption = overlay.querySelector('.lightbox-caption');
    const closeBtn = overlay.querySelector('.lightbox-close');

    function openLightbox(src, alt) {
      img.src = src;
      img.alt = alt;
      caption.textContent = alt;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeLightbox() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      img.src = '';
    }

    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeLightbox();
    });

    // Attach to gallery images
    document.querySelectorAll('.gallery .template img, .gallery img').forEach(image => {
      image.style.cursor = 'zoom-in';
      image.addEventListener('click', () => {
        const alt = image.getAttribute('alt') || '';
        openLightbox(image.src, alt);
      });
    });

    // Also attach to team images
    document.querySelectorAll('.team-member img').forEach(image => {
      image.style.cursor = 'zoom-in';
      image.addEventListener('click', () => {
        openLightbox(image.src, image.getAttribute('alt') || '');
      });
    });
  }

  buildLightbox();


  /* ──────────────────────────────────────────
     6. BACK TO TOP BUTTON
  ────────────────────────────────────────── */
  const btt = document.createElement('button');
  btt.className = 'back-to-top';
  btt.setAttribute('aria-label', 'Back to top');
  btt.innerHTML = '↑';
  document.body.appendChild(btt);

  window.addEventListener('scroll', () => {
    btt.classList.toggle('visible', window.scrollY > 320);
  }, { passive: true });

  btt.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  /* ──────────────────────────────────────────
     7. SCROLL ANIMATIONS (Intersection Observer)
  ────────────────────────────────────────── */
  const animTargets = document.querySelectorAll(
    '.card, .box, .team-member, .template, .services-box, ' +
    '.contact-box, .location-box, .image-box, .content-box, ' +
    '.about-section, .mission-vision-container, .team-section, ' +
    '.form-container, .gallery, .welcome-section'
  );

  animTargets.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  animTargets.forEach(el => observer.observe(el));


  /* ──────────────────────────────────────────
     8. INJECT HAMBURGER BUTTON (if not in HTML)
  ────────────────────────────────────────── */
  if (!document.querySelector('.hamburger')) {
    const btn = document.createElement('button');
    btn.className = 'hamburger';
    btn.setAttribute('aria-label', 'Toggle navigation');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span></span><span></span><span></span>';

    const headerInner = document.querySelector('.header-inner');
    if (headerInner) {
      headerInner.appendChild(btn);
    } else {
      const hdr = document.querySelector('header');
      if (hdr) hdr.appendChild(btn);
    }

    // Re-bind hamburger now that it's in the DOM
    btn.addEventListener('click', () => {
      const isOpen = nav && nav.classList.toggle('open');
      btn.classList.toggle('open', isOpen);
      btn.setAttribute('aria-expanded', !!isOpen);
    });
  }

});
