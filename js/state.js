/**
 * GDGconnect - App State & Event Dispatcher
 * Manages active role, active user, active view, and cross-component reactivity
 */

(function () {
  'use strict';

  const THEME_KEY = 'campusconnect_theme';
  const CURRENT_USER_KEY = 'campusconnect_active_user';

  class StateManager {
    constructor() {
      this.listeners = {};
      this.role = 'Mentor'; // 'Mentor' or 'Ambassador'
      this.currentUser = null;
      this.activeSection = 'dashboard';
      this.theme = 'light';
      this.activeFilters = {};
      this.init();
    }

    init() {
      // Load theme - default to dark (E-Cell CA tech theme)
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) {
        this.theme = savedTheme;
      } else {
        this.theme = 'dark';
      }
      this.applyTheme();

      // Check URL search parameters for direct ID access (e.g. ?user=MTR-101, ?id=AMB-201, or ?role=ambassador)
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const userQuery = urlParams.get('user') || urlParams.get('id');
        const roleQuery = urlParams.get('role');

        if (userQuery) {
          const upper = userQuery.toUpperCase().trim();
          const mentor = window.CC.db.getMentorById(upper);
          if (mentor) {
            this.setRoleAndUser('Mentor', mentor.id);
            return;
          }
          const ambassador = window.CC.db.getAmbassadorById(upper);
          if (ambassador) {
            this.setRoleAndUser('Ambassador', ambassador.id);
            return;
          }
          // Also check by email
          const mentorByEmail = window.CC.db.getMentors().find(m => m.email.toLowerCase() === userQuery.toLowerCase());
          if (mentorByEmail) {
            this.setRoleAndUser('Mentor', mentorByEmail.id);
            return;
          }
          const ambByEmail = window.CC.db.getAmbassadors().find(a => a.email.toLowerCase() === userQuery.toLowerCase());
          if (ambByEmail) {
            this.setRoleAndUser('Ambassador', ambByEmail.id);
            return;
          }
        }

        if (roleQuery) {
          const lower = roleQuery.toLowerCase().trim();
          if (lower === 'mentor') {
            const m = window.CC.db.getMentors()[0];
            this.setRoleAndUser('Mentor', m.id);
            return;
          } else if (lower === 'ambassador') {
            const a = window.CC.db.getAmbassadors()[0];
            this.setRoleAndUser('Ambassador', a.id);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not parse URL query parameters:", err);
      }

      // Load or default user
      const savedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.id) {
            // Verify user still exists in DB
            const userInDb = parsed.role === 'Mentor'
              ? window.CC.db.getMentorById(parsed.id)
              : window.CC.db.getAmbassadorById(parsed.id);

            if (userInDb) {
              this.currentUser = userInDb;
              this.role = parsed.role;
            }
          }
        } catch (e) {
          console.warn("Could not parse saved user:", e);
        }
      }

      if (!this.currentUser) {
        // Default to Dr. Evelyn Vance (Mentor)
        this.setRoleAndUser('Mentor', 'MTR-101');
      }
    }

    setRoleAndUser(role, userId) {
      this.role = role;
      if (role === 'Mentor') {
        this.currentUser = window.CC.db.getMentorById(userId) || window.CC.db.getMentors()[0];
      } else {
        this.currentUser = window.CC.db.getAmbassadorById(userId) || window.CC.db.getAmbassadors()[0];
      }

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        id: this.currentUser.id,
        role: this.role
      }));

      this.emit('userChanged', { user: this.currentUser, role: this.role });
      this.emit('stateChanged', { type: 'user' });
    }

    switchRole(newRole) {
      if (newRole === 'Mentor') {
        const defaultMentor = window.CC.db.getMentors()[0];
        this.setRoleAndUser('Mentor', defaultMentor.id);
      } else {
        const defaultAmbassador = window.CC.db.getAmbassadors()[0];
        this.setRoleAndUser('Ambassador', defaultAmbassador.id);
      }
    }

    setSection(sectionId, extraParams = null) {
      this.activeSection = sectionId;
      this.emit('sectionChanged', { section: sectionId, params: extraParams });
    }

    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_KEY, this.theme);
      this.applyTheme();
      this.emit('themeChanged', { theme: this.theme });
    }

    applyTheme() {
      if (this.theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }

    // Event Bus
    on(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
    }

    off(event, callback) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(cb => {
          try {
            cb(data);
          } catch (err) {
            console.error(`Error in listener for event ${event}:`, err);
          }
        });
      }
    }

    refreshCurrentUserData() {
      if (!this.currentUser) return;
      const refreshed = this.role === 'Mentor'
        ? window.CC.db.getMentorById(this.currentUser.id)
        : window.CC.db.getAmbassadorById(this.currentUser.id);

      if (refreshed) {
        this.currentUser = refreshed;
        this.emit('userUpdated', this.currentUser);
      }
    }
  }

  window.CC = window.CC || {};
  window.CC.state = new StateManager();
})();
