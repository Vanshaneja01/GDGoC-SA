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
      // Load theme
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) {
        this.theme = savedTheme;
      } else {
        // default to light
        this.theme = 'light';
      }
      this.applyTheme();

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
