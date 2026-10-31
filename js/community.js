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

          const skillsHtml = (a.skills || ['React', 'Python', 'Cloud', 'Outreach']).slice(0, 3).map(s => `
            <span class="ca-skill-pill">${s}</span>
          `).join('');

          card.innerHTML = `
            <div>
              <div class="ca-card-header">
                <div class="ca-avatar-circle">${initials}</div>
                <div class="ca-card-meta">
                  <span class="ca-card-name">${a.name}</span>
                  <span class="ca-card-dept">${a.department || 'B.Tech Computer Science'}</span>
                </div>
              </div>

              <span class="ca-card-badge">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                <span>Campus Ambassador</span>
              </span>

              <!-- Allotted Mentor Box -->
              <div class="ca-mentor-box">
                <div class="ca-mentor-avatar">${mentorInitials}</div>
                <div class="ca-mentor-info">
                  <span class="ca-mentor-tag">Allotted Student Mentor</span>
                  <span class="ca-mentor-name">${mentor.name}</span>
                  <span class="ca-mentor-dept">${mentor.department || 'Senior Student Mentor'}</span>
                </div>
              </div>

              <div class="ca-skills-row">
                ${skillsHtml}
              </div>
            </div>

            <div class="ca-card-footer">
              <span>Status: <strong style="color: #34d399;">Active</strong></span>
              <span>Year: <strong style="color: #ffffff;">${a.year ? a.year.split(' ')[0] : 'Year 3'}</strong></span>
            </div>
          `;

          track.appendChild(card);
        });

        // Recreate dots
        if (dotsContainer) {
          dotsContainer.innerHTML = '';
          const cardCount = filtered.length;
          const dotsCount = Math.min(cardCount, 6);
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
        // FAQ Accordion Toggle (E-Cell style)
        const faqHeader = e.target.closest('.comm-faq-question');
        if (faqHeader) {
          const faqItem = faqHeader.closest('.comm-faq-item');
          if (faqItem) {
            faqItem.classList.toggle('open');
            return;
          }
        }

        const switchLink = e.target.closest('#link-switch-active-account');
        if (switchLink) {
          e.preventDefault();
          this.openAuthModal();
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
                <div class="comm-brand-logo" style="width: 38px; height: 38px;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M8 7L3 12L8 17" stroke="#4285F4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 7L21 12L16 17" stroke="#EA4335" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M13.5 5L10.5 19" stroke="#34A853" stroke-width="2.5" stroke-linecap="round"/>
                    <circle cx="12" cy="12" r="1.5" fill="#FBBC04"/>
                  </svg>
                </div>
                <div>
                  <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main);">Sign in to GDGconnect</h3>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">Mentor & Student Ambassador Portal</span>
                </div>
              </div>
              <button class="btn-icon" data-close-modal>${ui.icon('x')}</button>
            </div>

            <div class="modal-body" style="padding: 1.25rem 1.75rem;">
              <!-- Role Selector Tabs -->
              <div class="auth-role-tabs">
                <button type="button" class="auth-role-tab ${activeRole === 'Ambassador' ? 'active' : ''}" id="tab-auth-ambassador">
                  🎓 Student Ambassador
                </button>
                <button type="button" class="auth-role-tab ${activeRole === 'Mentor' ? 'active' : ''}" id="tab-auth-mentor">
                  🛡️ Faculty Mentor
                </button>
              </div>

              <!-- Sign In Form -->
              <form id="portal-auth-form">
                <div class="form-group" style="margin-bottom: 1rem;">
                  <label class="form-label" for="auth-id-input" style="font-size: 0.82rem; font-weight: 600;">
                    <span id="label-id-type">Ambassador ID</span> or Official Email
                  </label>
                  <input 
                    type="text" 
                    id="auth-id-input" 
                    class="form-control" 
                    placeholder="e.g. AMB-201 or alex.rivera@student.gdgconnect.edu"
                    value="${activeRole === 'Ambassador' ? 'AMB-201' : 'MTR-101'}"
                    required 
                  />
                </div>

                <div class="form-group" style="margin-bottom: 1.25rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                    <label class="form-label" for="auth-password-input" style="font-size: 0.82rem; font-weight: 600; margin: 0;">
                      Issued Access Key / Password
                    </label>
                    <span style="font-size: 0.72rem; color: var(--color-primary); cursor: pointer;" id="btn-autofill-pass">
                      Auto-fill Key
                    </span>
                  </div>
                  <input 
                    type="password" 
                    id="auth-password-input" 
                    class="form-control" 
                    placeholder="Enter your security access key"
                    value="gdg2026"
                    required 
                  />
                </div>

                <button type="submit" class="btn btn-primary btn-block" style="padding: 0.85rem; font-size: 0.95rem; font-weight: 700;">
                  ${ui.icon('log-in')} Sign In to Dashboard
                </button>
              </form>

              <!-- One-Click Quick Credentials Helper -->
              <div class="auth-demo-box">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
                  <strong style="font-size: 0.78rem; color: var(--text-main); text-transform: uppercase; letter-spacing: 0.5px;">
                    🔑 Pre-Assigned Credentials (1-Click Access)
                  </strong>
                </div>

                <div style="display: flex; flex-direction: column; gap: 0.45rem;">
                  <!-- Mentor Demo -->
                  <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                    <div>
                      <div style="font-size: 0.8rem; font-weight: 600;">Disha Agarwal <span class="badge badge-green" style="font-size: 0.65rem;">Mentor</span></div>
                      <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-family-mono);">ID: MTR-101 • Key: mentor@gdg</div>
                    </div>
                    <button type="button" class="btn btn-xs btn-primary auth-quick-login-btn" data-quick-user="Mentor:MTR-101">
                      Sign In
                    </button>
                  </div>

                  <!-- Ambassador Demo 1 -->
                  <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                    <div>
                      <div style="font-size: 0.8rem; font-weight: 600;">Alex Rivera <span class="badge badge-olive" style="font-size: 0.65rem;">Ambassador</span></div>
                      <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-family-mono);">ID: AMB-201 • Key: ambassador@gdg</div>
                    </div>
                    <button type="button" class="btn btn-xs btn-primary auth-quick-login-btn" data-quick-user="Ambassador:AMB-201">
                      Sign In
                    </button>
                  </div>

                  <!-- Ambassador Demo 2 -->
                  <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                    <div>
                      <div style="font-size: 0.8rem; font-weight: 600;">Maya Patel <span class="badge badge-olive" style="font-size: 0.65rem;">Ambassador</span></div>
                      <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-family-mono);">ID: AMB-202 • Key: ambassador@gdg</div>
                    </div>
                    <button type="button" class="btn btn-xs btn-primary auth-quick-login-btn" data-quick-user="Ambassador:AMB-202">
                      Sign In
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <div class="modal-footer" style="padding: 0.85rem 1.75rem; background: var(--bg-subtle); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; color: var(--text-muted);">
                🔒 Protected by Campus Role-Based Authorization
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

        tabAmb.addEventListener('click', () => {
          activeRole = 'Ambassador';
          tabAmb.classList.add('active');
          tabMtr.classList.remove('active');
          labelIdType.textContent = 'Ambassador ID';
          idInput.placeholder = 'e.g. AMB-201 or alex.rivera@student.gdgconnect.edu';
          if (!idInput.value || idInput.value === 'MTR-101') idInput.value = 'AMB-201';
          passInput.value = 'ambassador@gdg';
        });

        tabMtr.addEventListener('click', () => {
          activeRole = 'Mentor';
          tabMtr.classList.add('active');
          tabAmb.classList.remove('active');
          labelIdType.textContent = 'Mentor ID';
          idInput.placeholder = 'e.g. MTR-101 or evelyn.vance@gdgconnect.edu';
          if (!idInput.value || idInput.value === 'AMB-201') idInput.value = 'MTR-101';
          passInput.value = 'mentor@gdg';
        });

        modalHost.querySelector('#btn-autofill-pass')?.addEventListener('click', () => {
          passInput.value = activeRole === 'Mentor' ? 'mentor@gdg' : 'ambassador@gdg';
        });

        // Quick sign in buttons
        modalHost.querySelectorAll('[data-quick-user]').forEach(btn => {
          btn.addEventListener('click', () => {
            const [role, id] = btn.getAttribute('data-quick-user').split(':');
            const targetUser = role === 'Mentor'
              ? window.CC.db.getMentorById(id)
              : window.CC.db.getAmbassadorById(id);

            if (targetUser) {
              CommunityManager.setSession(targetUser, role);
              ui.closeModal();
              ui.showToast(`Authenticated as ${targetUser.name} (${targetUser.id})`, "success", `Welcome to ${role} Dashboard`);
              CommunityManager.showPortalView();
            }
          });
        });

        // Form Submission
        const form = modalHost.querySelector('#portal-auth-form');
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const rawId = idInput.value.trim();
          const rawPass = passInput.value.trim();

          if (!rawId) {
            ui.showToast("Please enter your assigned ID or email.", "error", "Input Required");
            return;
          }

          const upper = rawId.toUpperCase();
          let matchedUser = null;
          let matchedRole = activeRole;

          // Check Mentor ID or Email
          const mentor = window.CC.db.getMentorById(upper) || window.CC.db.getMentors().find(m => m.email.toLowerCase() === rawId.toLowerCase());
          if (mentor) {
            matchedUser = mentor;
            matchedRole = 'Mentor';
          } else {
            // Check Ambassador ID or Email
            const ambassador = window.CC.db.getAmbassadorById(upper) || window.CC.db.getAmbassadors().find(a => a.email.toLowerCase() === rawId.toLowerCase());
            if (ambassador) {
              matchedUser = ambassador;
              matchedRole = 'Ambassador';
            }
          }

          if (!matchedUser) {
            ui.showToast(`Invalid credentials. No user found matching "${rawId}".`, "error", "Access Denied");
            return;
          }

          // Complete login
          CommunityManager.setSession(matchedUser, matchedRole);
          ui.closeModal();
          ui.showToast(`Authenticated successfully as ${matchedUser.name}!`, "success", `Welcome, ${matchedRole}`);
          CommunityManager.showPortalView();
        });
      });
    }
  };

  window.CC = window.CC || {};
  window.CC.community = CommunityManager;

  document.addEventListener('DOMContentLoaded', () => {
    CommunityManager.init();
  });
})();
