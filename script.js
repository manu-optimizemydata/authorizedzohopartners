(function () {
  'use strict';

  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav__link');

  function closeNav() {
    navToggle.classList.remove('active');
    nav.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
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
    document.body.classList.toggle('nav-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile nav on link click
  navLinks.forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  // Scroll CTA buttons to hero enquiry form
  const formScrollLinks = document.querySelectorAll('.js-scroll-to-form');
  const enquiryFormCard = document.getElementById('enquiry-form');
  const nameInput = document.getElementById('name');

  function scrollToEnquiryForm() {
    if (!enquiryFormCard) return;

    enquiryFormCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

    window.setTimeout(function () {
      enquiryFormCard.classList.add('hero__form-card--highlight');
      if (nameInput && !nameInput.disabled) {
        nameInput.focus({ preventScroll: true });
      }
      window.setTimeout(function () {
        enquiryFormCard.classList.remove('hero__form-card--highlight');
      }, 2000);
    }, 500);
  }

  formScrollLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      closeNav();
      scrollToEnquiryForm();
    });
  });

  if (window.location.hash === '#enquiry-form') {
    window.setTimeout(scrollToEnquiryForm, 300);
  }

  // Hero "Read more" on mobile
  const heroReadMore = document.getElementById('heroReadMore');
  const heroExpandable = document.getElementById('heroExpandable');

  if (heroReadMore && heroExpandable) {
    heroReadMore.addEventListener('click', function () {
      const expanded = heroReadMore.getAttribute('aria-expanded') === 'true';
      heroReadMore.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      heroExpandable.hidden = expanded;
      heroReadMore.textContent = expanded ? 'Read more' : 'Read less';
    });
  }

  // Service cards — expand details on mobile
  document.querySelectorAll('.service-card__toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const card = btn.closest('.service-card');
      if (!card) return;
      const expanded = card.classList.toggle('service-card--expanded');
      btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      btn.textContent = expanded ? 'Hide details' : 'View details';
    });
  });

  // FAQ — show remaining questions on mobile
  const faqShowMore = document.getElementById('faqShowMore');
  const faqList = document.querySelector('.faq-list');

  if (faqShowMore && faqList) {
    faqShowMore.addEventListener('click', function () {
      faqList.classList.add('faq-list--expanded');
      faqShowMore.setAttribute('aria-expanded', 'true');
      faqShowMore.hidden = true;
    });
  }

  // Sticky mobile CTA bar after scrolling past hero
  const mobileCtaBar = document.getElementById('mobileCtaBar');
  const heroSection = document.getElementById('hero');
  const mobileMq = window.matchMedia('(max-width: 768px)');

  function updateMobileCtaBar() {
    if (!mobileCtaBar || !heroSection) return;

    if (!mobileMq.matches) {
      mobileCtaBar.hidden = true;
      document.body.classList.remove('has-mobile-cta');
      return;
    }

    const pastHero = window.scrollY > heroSection.offsetHeight * 0.5;
    mobileCtaBar.hidden = !pastHero;
    document.body.classList.toggle('has-mobile-cta', pastHero);
  }

  window.addEventListener('scroll', updateMobileCtaBar, { passive: true });
  mobileMq.addEventListener('change', updateMobileCtaBar);
  updateMobileCtaBar();

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
