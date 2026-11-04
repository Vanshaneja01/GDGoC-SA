/**
 * GDGconnect - GDG Community Showcase & Portal Gateway
 * Manages public community presentation, "Tap to Enter" gateway, and credential sign-in
 */

(function () {
  'use strict';

  const AUTH_SESSION_KEY = 'gdgconnect_auth_session';

  const CommunityManager = {
    init() {
      this.bindPortalButtons();
      this.initCaSlider();
      this.checkInitialView();
    },

    /* ==========================================================================
       CAMPUS AMBASSADORS & ALLOTTED MENTORS CAROUSEL / SLIDE CONTROLLER
       ========================================================================== */
    initCaSlider() {
      const track = document.getElementById('ca-slider-track');
      const viewport = document.getElementById('ca-slider-viewport');
      const prevBtn = document.getElementById('ca-slide-prev');
      const nextBtn = document.getElementById('ca-slide-next');
      const dotsContainer = document.getElementById('ca-slider-dots');
      const filterBar = document.getElementById('ca-filter-bar');

      if (!track || !viewport) return;

      const mentors = (window.CC.db && window.CC.db.getMentors()) || [];
      const ambassadors = (window.CC.db && window.CC.db.getAmbassadors()) || [];

      const mentorMap = {};
      mentors.forEach(m => { mentorMap[m.id] = m; });

      // Default mentor fallback
      const defaultMentor = mentors[0] || { name: 'Disha Agarwal', department: 'AI & Distributed Systems', avatar: 'DA' };

      // Update Filter Bar Buttons with dynamic counts
      if (filterBar) {
        const allBtn = filterBar.querySelector('.ca-filter-btn[data-filter="all"]');
        if (allBtn) {
          allBtn.innerHTML = `All Ambassadors <span class="ca-filter-count">${ambassadors.length}</span>`;
        }

        mentors.forEach(m => {
          const btn = filterBar.querySelector(`.ca-filter-btn[data-filter="${m.id}"]`);
          if (btn) {
            const count = ambassadors.filter(a => a.mentorId === m.id).length;
            btn.innerHTML = `${m.name} <span class="ca-filter-count">${count}</span>`;
          }
        });
      }

      const renderCards = (filterId = 'all') => {
        track.innerHTML = '';

        const filtered = ambassadors.filter(a => {
          if (filterId === 'all') return true;
          return a.mentorId === filterId;
        });

        if (filtered.length === 0) {
          track.innerHTML = `
            <div style="padding: 3rem 1.5rem; text-align: center; width: 100%; color: #94a3b8;">
              <p style="font-size: 1.15rem; font-weight: 700; color: #ffffff; margin-bottom: 0.4rem;">No Ambassadors in this Cohort</p>
              <p style="font-size: 0.9rem;">Select another mentor cohort or click "All Ambassadors" to view the full directory.</p>
            </div>
          `;
          if (dotsContainer) dotsContainer.innerHTML = '';
          return;
        }

        filtered.forEach(a => {
          const mentor = mentorMap[a.mentorId] || defaultMentor;
          const card = document.createElement('div');
          card.className = 'ca-slide-card';
          card.setAttribute('data-mentor-id', a.mentorId || '');

          const initials = a.avatar || a.name.split(' ').map(n => n[0]).join('').substring(0, 2);
          const mentorInitials = mentor.avatar || mentor.name.split(' ').map(n => n[0]).join('').substring(0, 2);

          const photoMarkup = a.photoUrl
            ? `<img src="${a.photoUrl}" alt="${a.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><span style="display:none; width: 100%; height: 100%; align-items: center; justify-content: center;">${initials}</span>`
            : `<span>${initials}</span>`;

          const linkedinMarkup = (a.linkedin && a.linkedin !== 'https://linkedin.com' && !a.linkedin.includes('Not Created'))
            ? `<a href="${a.linkedin}" target="_blank" rel="noopener noreferrer" class="ca-linkedin-btn" title="LinkedIn Profile: ${a.name}">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64c-.9 0-1.63.73-1.63 1.63 0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.63-1.63-1.63Z"/></svg>
              </a>`
            : '';

          const skillsHtml = (a.skills || ['React', 'Python', 'Cloud', 'Outreach']).slice(0, 3).map(s => `
            <span class="ca-skill-pill">${s}</span>
          `).join('');

          const bioMarkup = a.bio
            ? `<p class="ca-card-bio" title="${a.bio}">&ldquo;${a.bio}&rdquo;</p>`
            : '';

          card.innerHTML = `
            <div class="ca-card-main-content">
              <!-- AMBASSADOR PROFILE (STUDENT LEADER) -->
              <div class="ca-card-header">
                <div class="ca-avatar-circle" title="${a.name}">${photoMarkup}</div>
                <div class="ca-card-meta">
                  <span class="ca-card-name" title="${a.name}">${a.name}</span>
                  <span class="ca-card-dept" title="${a.department || 'B.Tech Computer Science'} • ${a.year || ''}">${a.department || 'B.Tech Computer Science'}</span>
                </div>
                ${linkedinMarkup}
              </div>

              <!-- ROLE PILL: CAMPUS AMBASSADOR -->
              <div class="ca-role-badge-row">
                <span class="ca-card-badge">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                  <span>Campus Ambassador</span>
                </span>
              </div>

              <!-- ONE-LINE BIO -->
              ${bioMarkup}

              <!-- DEDICATED ALLOTTED MENTOR SUB-CARD -->
              <div class="ca-mentor-box" title="Allotted Senior Mentor: ${mentor.name}">
                <div class="ca-mentor-box-label">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>Guided by Senior Mentor</span>
                </div>
                <div class="ca-mentor-body">
                  <div class="ca-mentor-avatar" title="${mentor.name}">${mentorInitials}</div>
                  <div class="ca-mentor-info">
                    <span class="ca-mentor-name">${mentor.name}</span>
                    <span class="ca-mentor-dept">${mentor.department || 'Senior Student Mentor'}</span>
                  </div>
                </div>
              </div>

              <!-- SKILLS CHIPS -->
              <div class="ca-skills-row">
                ${skillsHtml}
              </div>
            </div>

            <!-- PINNED BOTTOM FOOTER -->
            <div class="ca-card-footer">
              <span class="ca-footer-status"><span class="ca-status-dot"></span> ${a.status || 'Active Ambassador'}</span>
              <span class="ca-footer-year">${a.year ? a.year.split(',')[0].trim() : 'Year 1'}</span>
            </div>
          `;

          track.appendChild(card);
        });

        // Recreate dots
        if (dotsContainer) {
          dotsContainer.innerHTML = '';
          const cardCount = filtered.length;
          const dotsCount = Math.min(cardCount, 8);
          for (let i = 0; i < dotsCount; i++) {
            const dot = document.createElement('div');
            dot.className = `ca-slider-dot ${i === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => {
              const cardWidth = track.firstElementChild ? track.firstElementChild.offsetWidth + 24 : 320;
              viewport.scrollTo({ left: i * cardWidth, behavior: 'smooth' });
            });
            dotsContainer.appendChild(dot);
          }
        }
      };

      // Initial Render
      renderCards('all');

      // Prev & Next Buttons
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          const cardWidth = track.firstElementChild ? track.firstElementChild.offsetWidth + 24 : 320;
          viewport.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          const cardWidth = track.firstElementChild ? track.firstElementChild.offsetWidth + 24 : 320;
          viewport.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });
      }

      // Filter Bar
      if (filterBar) {
        filterBar.addEventListener('click', (e) => {
          const btn = e.target.closest('.ca-filter-btn');
          if (!btn) return;

          filterBar.querySelectorAll('.ca-filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const filter = btn.getAttribute('data-filter') || 'all';
          renderCards(filter);
          viewport.scrollTo({ left: 0, behavior: 'smooth' });
        });
      }

      // Viewport scroll listener for dots
      viewport.addEventListener('scroll', () => {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.ca-slider-dot');
        if (dots.length === 0) return;
        const cardWidth = track.firstElementChild ? track.firstElementChild.offsetWidth + 24 : 320;
        const activeIdx = Math.min(dots.length - 1, Math.round(viewport.scrollLeft / cardWidth));
        dots.forEach((d, idx) => {
          d.classList.toggle('active', idx === activeIdx);
        });
      }, { passive: true });
    },

    // Check if user is already logged in or has a URL query
    checkInitialView() {
      const urlParams = new URLSearchParams(window.location.search);
      const userParam = urlParams.get('user') || urlParams.get('id');
      const portalParam = urlParams.get('portal');

      // If a specific user parameter or explicit portal parameter is present, enter the portal directly
      if (userParam || portalParam === 'true') {
        this.showPortalView();
        return;
      }

      // Default: Always display the public GDG Community Showcase first!
      this.showCommunityView();
    },

    getSession() {
      try {
        const raw = localStorage.getItem(AUTH_SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },

    setSession(user, role) {
      const session = {
        id: user.id,
        role: role,
        name: user.name,
        email: user.email,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      window.CC.state.setRoleAndUser(role, user.id);
    },

    clearSession() {
      localStorage.removeItem(AUTH_SESSION_KEY);
      this.updateCtaButtonWithSession();
    },

    showCommunityView() {
      const landing = document.getElementById('community-landing');
      const app = document.getElementById('app');
      if (landing) landing.style.display = 'block';
      if (app) app.style.display = 'none';

      this.updateCtaButtonWithSession();

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    updateCtaButtonWithSession() {
      const session = this.getSession();
      const heroBtn = document.getElementById('btn-tap-to-enter-portal');
      const navBtn = document.getElementById('btn-nav-enter-portal');
      const bannerBtn = document.getElementById('btn-enter-portal-cta');
      const hint = document.querySelector('.comm-credentials-hint');

      if (session && session.name) {
        const shortName = session.name.split(' ')[0];
        if (heroBtn) {
          heroBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
            <span>Enter GDGconnect (${shortName})</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          `;
        }
        if (navBtn) {
          navBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
            <span>Dashboard (${session.role})</span>
          `;
        }
        if (bannerBtn) {
          bannerBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span>Open ${session.role} Dashboard (${shortName})</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          `;
        }
        if (hint) {
          hint.innerHTML = `<span>Active Session: <strong>${session.name}</strong> (${session.id}) &bull; <a href="#" id="link-switch-active-account" style="color: var(--color-primary); text-decoration: underline;">Switch Account</a></span>`;
        }
      } else {
        if (heroBtn) {
          heroBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span>Tap to Enter GDGconnect</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          `;
        }
        if (navBtn) {
          navBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
            <span>GDGconnect</span>
          `;
        }
        if (bannerBtn) {
          bannerBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span>Sign In with Credentials</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          `;
        }
        if (hint) {
          hint.innerHTML = `<span>🔑 Appointed Ambassadors & Faculty Mentors: Tap above to sign in with your issued credentials</span>`;
        }
      }
    },

    showPortalView() {
      const landing = document.getElementById('community-landing');
      const app = document.getElementById('app');
      if (landing) landing.style.display = 'none';
      if (app) app.style.display = 'flex';

      // Ensure active section is rendered
      if (window.CC.app && typeof window.CC.app.init === 'function') {
        window.CC.state.setSection(window.CC.state.activeSection || 'dashboard');
      }
    },

    signOut() {
      this.clearSession();
      window.CC.ui.showToast("Signed out. Returned to GDG Community Showcase.", "info", "Signed Out");
      this.showCommunityView();
    },

    bindPortalButtons() {
      // Tap to Enter button in Hero
      document.addEventListener('click', (e) => {
        // FAQ Accordion Toggle with smooth transition and accessible state
        const faqHeader = e.target.closest('.comm-faq-question');
        if (faqHeader) {
          e.preventDefault();
          const faqItem = faqHeader.closest('.comm-faq-item');
          if (faqItem) {
            const wasOpen = faqItem.classList.contains('open');
            // Close other FAQ items for a clean single-open accordion flow
            document.querySelectorAll('.comm-faq-item').forEach(item => {
              item.classList.remove('open');
              const btn = item.querySelector('.comm-faq-question');
              if (btn) btn.setAttribute('aria-expanded', 'false');
            });
            if (!wasOpen) {
              faqItem.classList.add('open');
              faqHeader.setAttribute('aria-expanded', 'true');
            }
            return;
          }
        }

        const switchLink = e.target.closest('#link-switch-active-account');
        if (switchLink) {
          e.preventDefault();
          this.openAuthModal();
          return;
        }

        const sheetsBtn = e.target.closest('#btn-comm-nav-sheets, #btn-topbar-sheets, .btn-sheets-sync');
        if (sheetsBtn) {
          e.preventDefault();
          this.openGoogleSheetsModal();
          return;
        }

        const tapBtn = e.target.closest('#btn-tap-to-enter-portal, .btn-comm-portal, #btn-enter-portal-cta');
        if (tapBtn) {
          e.preventDefault();
          const session = this.getSession();
          if (session && session.id && session.role) {
            window.CC.state.setRoleAndUser(session.role, session.id);
            this.showPortalView();
          } else {
            this.openAuthModal();
          }
          return;
        }

        const signOutBtn = e.target.closest('#btn-sign-out, #sidebar-sign-out');
        if (signOutBtn) {
          e.preventDefault();
          this.signOut();
        }

        const commHubBtn = e.target.closest('#btn-open-community-hub');
        if (commHubBtn) {
          e.preventDefault();
          this.showCommunityView();
        }
      });

      // Mobile Hamburger Navigation Drawer Toggle for Public Header
      const hamburgerBtn = document.getElementById('comm-hamburger-btn');
      const navLinks = document.getElementById('comm-nav-links');
      const navOverlay = document.getElementById('comm-nav-overlay');

      const closeMobileDrawer = () => {
        navLinks?.classList.remove('mobile-open');
        hamburgerBtn?.classList.remove('active');
        hamburgerBtn?.setAttribute('aria-expanded', 'false');
        navOverlay?.classList.remove('active');
        document.body.classList.remove('comm-drawer-open');
      };

      hamburgerBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navLinks?.classList.toggle('mobile-open');
        hamburgerBtn.classList.toggle('active', isOpen);
        hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        navOverlay?.classList.toggle('active', isOpen);
        document.body.classList.toggle('comm-drawer-open', isOpen);
      });

      // Close when clicking overlay backdrop
      navOverlay?.addEventListener('click', closeMobileDrawer);

      // Close mobile nav drawer when clicking any link
      navLinks?.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('click', closeMobileDrawer);
      });

      // Close mobile nav drawer when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.comm-navbar') && !e.target.closest('#comm-nav-links')) {
          closeMobileDrawer();
        }
      });
    },

    openAuthModal(defaultRole = 'Ambassador') {
      const ui = window.CC.ui;
      let activeRole = defaultRole;

      const modalHtml = `
        <div class="modal-backdrop">
          <div class="auth-modal-dialog">
            <div class="auth-header-stripe"></div>

            <div class="auth-modal-header">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div class="comm-brand-logo" style="width: 42px; height: 42px;">
                  <svg viewBox="0 0 32 24" width="28" height="21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 5.5L5.5 12.5" stroke="#EA4335" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5.5 12.5L12.5 19.5" stroke="#4285F4" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19.5 5.5L26.5 12.5" stroke="#34A853" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M26.5 12.5L19.5 19.5" stroke="#FBBC04" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main);">Sign in to GDGconnect</h3>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">Campus Ambassador &amp; Mentor Management Portal</span>
                </div>
              </div>
              <button class="btn-icon" data-close-modal aria-label="Close dialog">${ui.icon('x')}</button>
            </div>

            <div class="modal-body" style="padding: 1.35rem 1.75rem;">
              <!-- Role Selector Tabs -->
              <div class="auth-role-tabs">
                <button type="button" class="auth-role-tab ${activeRole === 'Ambassador' ? 'active' : ''}" id="tab-auth-ambassador">
                  🎓 Campus Ambassador
                </button>
                <button type="button" class="auth-role-tab ${activeRole === 'Mentor' ? 'active' : ''}" id="tab-auth-mentor">
                  🛡️ Senior Student Mentor
                </button>
              </div>

              <!-- Clean, Secure Sign In Form (No Exposed Passwords or Demo Values) -->
              <form id="portal-auth-form" autocomplete="on">
                <div class="form-group" style="margin-bottom: 1.15rem;">
                  <label class="form-label" for="auth-id-input" style="font-size: 0.82rem; font-weight: 600;">
                    <span id="label-id-type">${activeRole === 'Mentor' ? 'Mentor Email' : 'Ambassador Email'}</span> or Assigned ID
                  </label>
                  <input 
                    type="text" 
                    id="auth-id-input" 
                    class="form-control" 
                    placeholder="${activeRole === 'Mentor' ? 'Enter official Gmail or Mentor ID (e.g. MTR-101)' : 'Enter registered Email or Ambassador ID (e.g. AMB-201)'}"
                    value=""
                    autocomplete="username"
                    required 
                    autofocus
                  />
                </div>

                <div class="form-group" style="margin-bottom: 1.45rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                    <label class="form-label" for="auth-password-input" style="font-size: 0.82rem; font-weight: 600; margin: 0;">
                      Security Password
                    </label>
                  </div>
                  <div style="position: relative;">
                    <input 
                      type="password" 
                      id="auth-password-input" 
                      class="form-control" 
                      placeholder="Enter your security password"
                      value=""
                      autocomplete="current-password"
                      required 
                    />
                    <button type="button" id="btn-toggle-auth-pass" title="Toggle password visibility" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 0.9rem; padding: 4px;">
                      👁️
                    </button>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary btn-block" style="padding: 0.85rem; font-size: 0.95rem; font-weight: 700; width: 100%;">
                  ${ui.icon('log-in')} Sign In to ${activeRole} Dashboard
                </button>
              </form>

              <!-- Confidential Security Notice -->
              <div style="margin-top: 1.35rem; padding: 0.75rem 1rem; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 0.65rem;">
                <span style="font-size: 1rem;">🔒</span>
                <span style="font-size: 0.76rem; color: var(--text-muted); line-height: 1.4;">
                  <strong>Confidential Portal:</strong> Please sign in using the official email or issued ID provided during your appointment.
                </span>
              </div>
            </div>

            <div class="modal-footer" style="padding: 0.85rem 1.75rem; background: var(--bg-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
              <span style="font-size: 0.74rem; color: var(--text-muted);">
                GDG on Campus IIMTU &bull; IIMTBIF
              </span>
              <button class="btn btn-sm btn-outline" data-close-modal>Cancel</button>
            </div>
          </div>
        </div>
      `;

      ui.openModal(modalHtml, (modalHost) => {
        const idInput = modalHost.querySelector('#auth-id-input');
        const passInput = modalHost.querySelector('#auth-password-input');
        const labelIdType = modalHost.querySelector('#label-id-type');
        const tabAmb = modalHost.querySelector('#tab-auth-ambassador');
        const tabMtr = modalHost.querySelector('#tab-auth-mentor');
        const togglePassBtn = modalHost.querySelector('#btn-toggle-auth-pass');
        const submitBtn = modalHost.querySelector('button[type="submit"]');

        tabMtr.addEventListener('click', () => {
          activeRole = 'Mentor';
          tabMtr.classList.add('active');
          tabAmb.classList.remove('active');
          labelIdType.textContent = 'Mentor Email or Assigned ID';
          idInput.placeholder = 'Enter official Gmail or Mentor ID (e.g. MTR-101)';
          if (submitBtn) submitBtn.innerHTML = `${ui.icon('log-in')} Sign In to Mentor Dashboard`;
          idInput.focus();
        });

        tabAmb.addEventListener('click', () => {
          activeRole = 'Ambassador';
          tabAmb.classList.add('active');
          tabMtr.classList.remove('active');
          labelIdType.textContent = 'Ambassador Email or Assigned ID';
          idInput.placeholder = 'Enter registered Email or Ambassador ID (e.g. AMB-201)';
          if (submitBtn) submitBtn.innerHTML = `${ui.icon('log-in')} Sign In to Ambassador Dashboard`;
          idInput.focus();
        });

        togglePassBtn?.addEventListener('click', () => {
          const isPass = passInput.type === 'password';
          passInput.type = isPass ? 'text' : 'password';
          togglePassBtn.textContent = isPass ? '🔒' : '👁️';
        });

        // Form Submission with Strict Authentication
        const form = modalHost.querySelector('#portal-auth-form');
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const rawId = idInput.value.trim();
          const rawPass = passInput.value.trim();

          if (!rawId || !rawPass) {
            ui.showToast("Please enter both your Email/ID and Password.", "error", "Input Required");
            return;
          }

          const authResult = window.CC.db.authenticateUser(rawId, rawPass);

          if (!authResult.success) {
            ui.showToast(authResult.reason || "Invalid credentials. Please verify your Email/ID and Password.", "error", "Access Denied");
            return;
          }

          // Complete login
          CommunityManager.setSession(authResult.user, authResult.role);
          ui.closeModal();
          ui.showToast(`Authenticated as ${authResult.user.name}!`, "success", `Welcome to ${authResult.role} Command Center`);
          CommunityManager.showPortalView();
        });
      });
    },

    // ------------------------------------------------------------------------
    // GOOGLE SHEETS CLOUD DATABASE (PASSWORD PROTECTED FOR ADMIN ONLY)
    // ------------------------------------------------------------------------
    openGoogleSheetsModal() {
      // Require Administrator Passcode Verification
      this.promptAdminAuth(() => {
        this.renderGoogleSheetsModal();
      });
    },

    promptAdminAuth(onSuccess) {
      const ui = window.CC.ui;
      const modalHtml = `
        <div class="modal-backdrop">
          <div class="modal-dialog modal-sm" style="max-width: 420px; border-radius: 16px;">
            <div class="modal-header">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <span style="font-size: 1.3rem;">🔐</span>
                <div>
                  <h3 class="modal-title" style="font-size: 1.05rem;">Admin Verification</h3>
                  <span style="font-size: 0.72rem; color: var(--text-muted);">Protected Google Sheets Cloud Database</span>
                </div>
              </div>
              <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
            </div>
            <div class="modal-body" style="padding: 1.25rem 1.5rem;">
              <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1.15rem;">
                Google Sheets database sync settings are protected and restricted to chapter leadership. Enter the Master Administrator Passkey to proceed:
              </p>
              <form id="form-admin-verify">
                <div class="form-group" style="margin-bottom: 1.25rem;">
                  <label class="form-label" for="input-admin-pass" style="font-size: 0.8rem; font-weight: 600;">Administrator Passkey</label>
                  <input type="password" id="input-admin-pass" class="form-control" placeholder="Enter master admin passcode" required autofocus />
                </div>
                <button type="submit" class="btn btn-primary btn-block" style="width: 100%; padding: 0.75rem;">
                  ${ui.icon('check')} Verify &amp; Open Sheets DB
                </button>
              </form>
            </div>
          </div>
        </div>
      `;

      ui.openModal(modalHtml, (modalHost) => {
        const form = modalHost.querySelector('#form-admin-verify');
        const passInput = modalHost.querySelector('#input-admin-pass');
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const pass = passInput.value.trim();
          if (window.CC.db.verifyAdminPasscode(pass)) {
            ui.closeModal();
            ui.showToast("Admin access authorized!", "success", "Unlocked");
            onSuccess();
          } else {
            ui.showToast("Invalid admin passcode. Access denied.", "error", "Unauthorized");
          }
        });
      });
    },

    renderGoogleSheetsModal() {
      const ui = window.CC.ui;
      const db = window.CC.db;
      const status = db.getGoogleSheetsSyncStatus();
      const currentUrl = status.url || '';

      const modalHtml = `
        <div class="modal-backdrop">
          <div class="modal-dialog modal-lg">
            <div class="modal-header">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(52, 168, 83, 0.15); display: flex; align-items: center; justify-content: center; color: #34A853;">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <div>
                  <h3 class="modal-title">Google Sheets Cloud Database</h3>
                  <span style="font-size: 0.78rem; color: var(--text-muted);">Real-Time Two-Way Sync for Mentors, Ambassadors, Tasks &amp; Sessions</span>
                </div>
              </div>
              <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
            </div>

            <div class="modal-body">
              <!-- Live Connection Status Banner -->
              <div style="padding: 1rem 1.25rem; background: ${status.connected ? 'rgba(52, 168, 83, 0.08)' : 'rgba(251, 188, 4, 0.08)'}; border: 1px solid ${status.connected ? 'rgba(52, 168, 83, 0.3)' : 'rgba(251, 188, 4, 0.3)'}; border-radius: var(--radius-md); margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <span style="width: 12px; height: 12px; border-radius: 50%; background: ${status.connected ? '#34A853' : '#f59e0b'}; box-shadow: 0 0 10px ${status.connected ? '#34A853' : '#f59e0b'}; display: inline-block;"></span>
                  <div>
                    <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">
                      ${status.connected ? 'Connected to Google Sheets Cloud Database' : 'Local Storage Mode (Ready to Connect Google Sheet)'}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
                      ${status.connected ? `Live endpoint: <code style="font-size: 0.75rem;">${status.url.substring(0, 50)}...</code>` : 'Deploy our 1-minute Google Apps Script to synchronize with any Google Sheet'}
                    </div>
                  </div>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-align: right;">
                  ${status.lastSync ? `Last Synced: <strong>${new Date(status.lastSync).toLocaleTimeString()}</strong>` : 'Not synced yet'}
                </div>
              </div>

              <!-- Web App URL Input Form -->
              <div style="background: var(--bg-surface); padding: 1.15rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); margin-bottom: 1.25rem;">
                <label style="font-size: 0.82rem; font-weight: 700; color: var(--text-main); display: block; margin-bottom: 0.4rem;">
                  Google Apps Script Web App URL
                </label>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                  <input type="url" id="sheets-webapp-url-input" class="form-control" placeholder="https://script.google.com/macros/s/AKfycbx.../exec" value="${currentUrl}" style="flex: 1; min-width: 280px;" />
                  <button type="button" class="btn btn-primary" id="btn-save-sheets-url">
                    ${ui.icon('check')} Save &amp; Connect
                  </button>
                  <button type="button" class="btn btn-outline" id="btn-test-sheets-ping">
                    ${ui.icon('refresh-cw')} Test Ping
                  </button>
                </div>
                <span style="font-size: 0.73rem; color: var(--text-muted); display: block; margin-top: 6px;">
                  Paste the Web App URL generated by deploying the provided Apps Script (Execute as: Me, Access: Anyone).
                </span>
              </div>

              <!-- Database Sync Operations -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <div style="font-weight: 700; font-size: 0.9rem; color: #4285F4; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.4rem;">
                    ${ui.icon('download')} Pull from Google Sheets
                  </div>
                  <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    Fetches the latest live rows from your Google Sheet tabs (Mentors, Ambassadors, Tasks, Sessions) into this portal.
                  </p>
                  <button type="button" class="btn btn-sm btn-primary" id="btn-pull-from-sheets" style="width: 100%;">
                    🔄 Pull from Sheets Now
                  </button>
                </div>

                <div style="background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <div style="font-weight: 700; font-size: 0.9rem; color: #34A853; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.4rem;">
                    ${ui.icon('upload')} Push Local Data to Google Sheets
                  </div>
                  <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    Uploads current portal records (6 Mentors, 25 Ambassadors, Tasks, Sessions) to populate or overwrite your Google Sheet.
                  </p>
                  <button type="button" class="btn btn-sm btn-outline" id="btn-push-to-sheets" style="width: 100%;">
                    ⬆️ Push All Records to Sheets
                  </button>
                </div>
              </div>

              <!-- 60-Second Setup Guide & Script Exporter -->
              <div style="border-top: 1px solid var(--border-subtle); padding-top: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
                  <strong style="font-size: 0.85rem; color: var(--text-main);">
                    📖 Quick 60-Second Google Sheets Setup Guide:
                  </strong>
                  <button type="button" class="btn btn-xs btn-outline" id="btn-copy-apps-script">
                    📋 Copy Google Apps Script Code
                  </button>
                </div>

                <ol style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.6; margin-left: 1.2rem; margin-bottom: 0;">
                  <li>Open <strong>Google Sheets</strong> and create a blank spreadsheet (e.g. <em>"GDGconnect Database"</em>).</li>
                  <li>Click <strong>Extensions &gt; Apps Script</strong> from the top menu.</li>
                  <li>Click the <strong>Copy Google Apps Script Code</strong> button above, paste it into <code>Code.gs</code>, and press <strong>Save (Ctrl+S)</strong>.</li>
                  <li>Click <strong>Deploy &gt; New Deployment &gt; Web App</strong>. Set <em>"Execute as: Me"</em> and <em>"Who has access: Anyone"</em>, then click <strong>Deploy</strong>.</li>
                  <li>Copy the deployed Web App URL, paste it into the field above, and click <strong>Save &amp; Connect</strong>!</li>
                </ol>
              </div>
            </div>

            <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; color: var(--text-muted);">
                ☁️ Data stays 100% in your Google account
              </span>
              <button class="btn btn-sm btn-outline" data-close-modal>Close</button>
            </div>
          </div>
        </div>
      `;

      ui.openModal(modalHtml, (modalHost) => {
        const urlInput = modalHost.querySelector('#sheets-webapp-url-input');

        // Save & Connect
        modalHost.querySelector('#btn-save-sheets-url')?.addEventListener('click', () => {
          const raw = urlInput.value.trim();
          db.setGoogleSheetsUrl(raw);
          ui.showToast(raw ? "Google Sheets URL saved! Connecting..." : "Google Sheets URL removed. Reverted to Local Storage.", "info", "Database Configuration");
          // Update status indicator dots
          document.querySelectorAll('#sheets-topbar-status-dot, .sheets-live-dot').forEach(d => {
            d.classList.toggle('connected', db.isGoogleSheetsConnected());
          });
          ui.closeModal();
          this.openGoogleSheetsModal();
        });

        // Test Ping
        modalHost.querySelector('#btn-test-sheets-ping')?.addEventListener('click', async () => {
          const raw = urlInput.value.trim();
          if (!raw) {
            ui.showToast("Please enter a Google Apps Script Web App URL first.", "error", "Input Required");
            return;
          }
          ui.showToast("Pinging Google Sheets Web App endpoint...", "info", "Testing Connection");
          try {
            const target = raw.includes('?') ? `${raw}&action=ping` : `${raw}?action=ping`;
            const res = await fetch(target, { method: 'GET' });
            if (res.ok) {
              const data = await res.json();
              ui.showToast(`Connection Verified! ${data.message || 'Ready'}`, "success", "Google Sheets Online");
            } else {
              ui.showToast(`Server returned HTTP ${res.status}`, "warning", "Connection Issue");
            }
          } catch (e) {
            ui.showToast(`Could not reach endpoint: ${e.message}`, "error", "Connection Error");
          }
        });

        // Pull from Sheets
        modalHost.querySelector('#btn-pull-from-sheets')?.addEventListener('click', async () => {
          ui.showToast("Pulling latest records from Google Sheets tabs...", "info", "Synchronizing");
          const res = await db.syncFromGoogleSheets();
          if (res.success) {
            ui.showToast("All mentors, ambassadors, tasks, and sessions synced from Google Sheets!", "success", "Sync Complete");
            ui.closeModal();
            // Refresh view
            if (window.CC && window.CC.app && window.CC.app.renderCurrentSection) {
              window.CC.app.renderCurrentSection();
            }
          } else {
            ui.showToast(res.error || "Failed to pull from Google Sheets", "error", "Sync Error");
          }
        });

        // Push to Sheets
        modalHost.querySelector('#btn-push-to-sheets')?.addEventListener('click', async () => {
          ui.showToast("Uploading portal database to Google Sheets...", "info", "Uploading");
          const res = await db.pushToGoogleSheets();
          if (res.success) {
            ui.showToast("Local database pushed to Google Sheets successfully!", "success", "Upload Complete");
          } else {
            ui.showToast(res.error || "Failed to push to Google Sheets", "error", "Upload Error");
          }
        });

        // Copy Apps Script code
        modalHost.querySelector('#btn-copy-apps-script')?.addEventListener('click', async () => {
          try {
            const res = await fetch('google-apps-script.js');
            const code = await res.text();
            await navigator.clipboard.writeText(code);
            ui.showToast("Google Apps Script code copied to clipboard! Paste into Extensions > Apps Script in your Google Sheet.", "success", "Copied to Clipboard");
          } catch (e) {
            ui.showToast("Could not copy automatically. You can copy google-apps-script.js from the project folder.", "info", "Code Location");
          }
        });
      });
    }
  };

  window.CC = window.CC || {};
  window.CC.community = CommunityManager;
  window.CC.openGoogleSheetsModal = () => CommunityManager.openGoogleSheetsModal();

  document.addEventListener('DOMContentLoaded', () => {
    CommunityManager.init();
  });
})();
