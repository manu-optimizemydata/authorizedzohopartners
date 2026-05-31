(function () {
  'use strict';

  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav__link');
  const navActionLinks = document.querySelectorAll('.nav__actions .btn');

  function closeNav() {
    navToggle.classList.remove('active');
    nav.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Header scroll effect
  function handleScroll() {
    if (window.scrollY > 20) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile navigation toggle
  navToggle.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('active');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile nav on link click
  navLinks.forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  navActionLinks.forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  // Scroll reveal animation
  const revealElements = document.querySelectorAll(
    '.section__header, .service-card, .industry-card, .journey-step, .why-zoho__grid, .why-us__grid, .cta__inner, .problem-card, .faq-list'
  );

  revealElements.forEach(function (el) {
    el.classList.add('reveal');
  });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach(function (el) {
    observer.observe(el);
  });

  // Active nav link highlighting
  const sections = document.querySelectorAll('section[id]');

  function highlightNav() {
    const scrollY = window.scrollY + 100;

    sections.forEach(function (section) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(function (link) {
          link.classList.remove('nav__link--active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('nav__link--active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });

  // Hero contact form → Brevo API (via server)
  const heroForm = document.getElementById('heroForm');
  const formFeedback = document.getElementById('formFeedback');
  const formFields = document.getElementById('formFields');
  const formSubmitBtn = document.getElementById('formSubmitBtn');

  function showFormFeedback(type, message) {
    if (!formFeedback) return;
    formFeedback.hidden = false;
    formFeedback.className = 'form-feedback form-feedback--' + type;
    formFeedback.textContent = message;
  }

  function clearFormFeedback() {
    if (!formFeedback) return;
    formFeedback.hidden = true;
    formFeedback.textContent = '';
    formFeedback.className = 'form-feedback';
  }

  if (heroForm) {
    heroForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      clearFormFeedback();

      if (!heroForm.checkValidity()) {
        heroForm.reportValidity();
        return;
      }

      const payload = {
        name: document.getElementById('name').value.trim(),
        company: document.getElementById('company').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        message: document.getElementById('message').value.trim(),
      };

      if (formSubmitBtn) {
        formSubmitBtn.disabled = true;
        formSubmitBtn.textContent = 'Submitting...';
      }

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Submission failed. Please try again.');
        }

        showFormFeedback('success', result.message);
        heroForm.reset();

        if (formFields) {
          formFields.hidden = true;
        }
      } catch (error) {
        showFormFeedback('error', error.message || 'Something went wrong. Please try again.');
      } finally {
        if (formSubmitBtn) {
          formSubmitBtn.disabled = false;
          formSubmitBtn.textContent = 'Submit Enquiry';
        }
      }
    });
  }
})();
