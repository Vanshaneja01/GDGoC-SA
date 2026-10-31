/**
 * GDG on Campus IIMT Meerut - Single Page Application Controller
 * Handles smooth scrolling, sticky nav active highlighting, mobile menu, and copy protection
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. COPY PROTECTION (User Requirement)
     Disables text copying and selection across the portal while preserving inputs
     ========================================================================== */
  function initCopyProtection() {
    const isInput = (el) => {
      if (!el) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
    };

    document.addEventListener('copy', (e) => {
      if (!isInput(document.activeElement) && !isInput(e.target)) {
        e.preventDefault();
      }
    }, true);

    document.addEventListener('cut', (e) => {
      if (!isInput(document.activeElement) && !isInput(e.target)) {
        e.preventDefault();
      }
    }, true);

    document.addEventListener('selectstart', (e) => {
      if (!isInput(e.target)) {
        e.preventDefault();
      }
    }, true);

    document.addEventListener('dragstart', (e) => {
      if (!isInput(e.target)) {
        e.preventDefault();
      }
    }, true);
  }

  /* ==========================================================================
     2. SMOOTH SCROLLING & ACTIVE NAV LINK HIGHLIGHTER
     ========================================================================== */
  function initNavigation() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    const sections = document.querySelectorAll('section[id], div[id]');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');

    // Smooth scroll with navbar offset
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#' || !href.startsWith('#')) return;

        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          const navHeight = 72;
          const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Close mobile menu if open
          if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
          }
        }
      });
    });

    // Mobile menu toggle
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }

    // ScrollSpy active state
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 100;
      sections.forEach(section => {
        const id = section.getAttribute('id');
        if (!id) return;
        const top = section.offsetTop;
        const height = section.offsetHeight;

        if (scrollPos >= top && scrollPos < top + height) {
          document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('text-blue-600', 'font-semibold');
              link.classList.remove('text-slate-600');
            } else {
              link.classList.remove('text-blue-600', 'font-semibold');
              link.classList.add('text-slate-600');
            }
          });
        }
      });
    }, { passive: true });
  }

  /* ==========================================================================
     3. PORTAL LOGIN MODAL CONTROLLER
     ========================================================================== */
  function initPortalModal() {
    const loginModal = document.getElementById('portal-login-modal');
    const openBtns = document.querySelectorAll('.btn-open-portal-login');
    const closeBtn = document.getElementById('btn-close-login-modal');
    const loginForm = document.getElementById('portal-login-form');

    if (!loginModal) return;

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModal = () => {
      loginModal.classList.add('hidden');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !loginModal.classList.contains('hidden')) {
        closeModal();
      }
    });

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const role = document.getElementById('login-role-select')?.value || 'Ambassador';
        const email = document.getElementById('login-email-input')?.value || 'user@iimtu.edu.in';
        
        // Show success notification and proceed
        alert(`Welcome back! Logged in as ${role} (${email}).`);
        closeModal();
      });
    }
  }

  // DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    initCopyProtection();
    initNavigation();
    initPortalModal();
  });
})();
