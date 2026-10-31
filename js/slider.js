/**
 * GDGoC Campus Ambassador & Mentor Directory Slider
 * Fully responsive, touch-friendly JavaScript carousel (1 on mobile, 2 on tablet, 3 on desktop)
 */

(function () {
  'use strict';

  const DIRECTORY_DATA = [
    {
      name: 'Vansh',
      role: 'Campus Ambassador Lead',
      dept: 'CSE • AI & Cloud',
      mentor: 'Dr. Vaibhav Sharma',
      mentorRole: 'Faculty Advisor',
      color: '#4285F4', // Google Blue
      initials: 'VN',
      bio: 'Leading developer initiatives, Google Cloud study jams, and university-wide hackathon coordination.'
    },
    {
      name: 'Prateek KV',
      role: 'Technical Ambassador',
      dept: 'IT • Full-Stack Web',
      mentor: 'Dr. Akshay Raj',
      mentorRole: 'Technical Mentor',
      color: '#34A853', // Google Green
      initials: 'PK',
      bio: 'Specializing in modern web technologies, open-source evangelism, and peer coding sprint sessions.'
    },
    {
      name: 'Chhabee Rajput',
      role: 'Outreach Ambassador',
      dept: 'BCA • UI/UX & Mobile',
      mentor: 'Disha Agarwal',
      mentorRole: 'Student Mentor',
      color: '#EA4335', // Google Red
      initials: 'CR',
      bio: 'Championing cross-department outreach, design-thinking workshops, and female developer inclusion.'
    },
    {
      name: 'Aarav Sharma',
      role: 'DevOps Ambassador',
      dept: 'CSE • Cloud & Security',
      mentor: 'Dr. Vaibhav Sharma',
      mentorRole: 'Faculty Advisor',
      color: '#FBBC04', // Google Yellow
      initials: 'AS',
      bio: 'Guiding students in Docker, Linux foundations, CI/CD pipelines, and secure code architecture.'
    },
    {
      name: 'Riya Verma',
      role: 'AI & Data Ambassador',
      dept: 'Data Science • ML',
      mentor: 'Aarushi Singh',
      mentorRole: 'Student Mentor',
      color: '#4285F4', // Google Blue
      initials: 'RV',
      bio: 'Organizing Gemini AI labs, Python data visualization bootcamps, and Kaggle team sprints.'
    },
    {
      name: 'Kavya Gupta',
      role: 'Community Ambassador',
      dept: 'CSE • Open Source',
      mentor: 'Akshita Tyagi',
      mentorRole: 'Student Mentor',
      color: '#34A853', // Google Green
      initials: 'KG',
      bio: 'Fostering git & GitHub onboarding for juniors, community meetups, and Solution Challenge brainstorming.'
    },
    {
      name: 'Harsh Vardhan',
      role: 'Android Ambassador',
      dept: 'IT • Mobile Systems',
      mentor: 'Arsh Zehra',
      mentorRole: 'Student Mentor',
      color: '#EA4335', // Google Red
      initials: 'HV',
      bio: 'Conducting Kotlin fundamentals workshops, Jetpack Compose labs, and Android app build sprints.'
    },
    {
      name: 'Ananya Sen',
      role: 'Cloud Ambassador',
      dept: 'ECE • Cloud IoT',
      mentor: 'Khyati',
      mentorRole: 'Student Mentor',
      color: '#FBBC04', // Google Yellow
      initials: 'AN',
      bio: 'Bridging embedded hardware with Google Cloud Functions, Firebase real-time data, and IoT devices.'
    }
  ];

  class DirectorySlider {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;

      this.track = this.container.querySelector('.slider-track');
      this.prevBtn = this.container.querySelector('.slider-prev');
      this.nextBtn = this.container.querySelector('.slider-next');
      this.dotsContainer = this.container.querySelector('.slider-dots');

      this.currentIndex = 0;
      this.itemsPerView = 3;
      this.totalItems = DIRECTORY_DATA.length;
      this.touchStartX = 0;
      this.touchEndX = 0;

      this.init();
    }

    init() {
      this.renderCards();
      this.updateItemsPerView();
      this.renderDots();
      this.bindEvents();
      this.updateSlider();
    }

    renderCards() {
      this.track.innerHTML = DIRECTORY_DATA.map((item, idx) => `
        <div class="slider-slide flex-shrink-0 px-3 select-none" data-index="${idx}">
          <div class="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col h-full text-center items-center group">
            
            <!-- Circular Avatar with Brand Accent -->
            <div class="relative mb-4">
              <div class="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md transition-transform duration-300 group-hover:scale-105" style="background-color: ${item.color};">
                ${item.initials}
              </div>
              <span class="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-sm">
                <span class="w-3 h-3 rounded-full" style="background-color: ${item.color};"></span>
              </span>
            </div>

            <!-- CA Name & Role -->
            <h3 class="text-xl font-bold text-slate-900 tracking-tight mb-1 font-display">${item.name}</h3>
            <p class="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">${item.role}</p>
            <p class="text-xs text-slate-500 font-medium mb-4">${item.dept}</p>

            <!-- Short Bio Description -->
            <p class="text-xs text-slate-600 leading-relaxed mb-6 flex-grow">${item.bio}</p>

            <!-- Distinct Mentor Tag (User Requirement) -->
            <div class="w-full pt-4 border-t border-slate-100 flex items-center justify-between">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Assigned Mentor</span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                ${item.mentor}
              </span>
            </div>
          </div>
        </div>
      `).join('');
    }

    updateItemsPerView() {
      const width = window.innerWidth;
      if (width < 640) {
        this.itemsPerView = 1; // Mobile: 1 item
      } else if (width < 1024) {
        this.itemsPerView = 2; // Tablet: 2 items
      } else {
        this.itemsPerView = 3; // Desktop: 3 items
      }

      // Update slide widths dynamically
      const slides = this.track.querySelectorAll('.slider-slide');
      const percentage = 100 / this.itemsPerView;
      slides.forEach(slide => {
        slide.style.width = `${percentage}%`;
      });

      this.maxIndex = Math.max(0, this.totalItems - this.itemsPerView);
      if (this.currentIndex > this.maxIndex) {
        this.currentIndex = this.maxIndex;
      }
    }

    renderDots() {
      if (!this.dotsContainer) return;
      const count = this.maxIndex + 1;
      this.dotsContainer.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === this.currentIndex ? 'bg-blue-600 w-7' : 'bg-slate-300 hover:bg-slate-400'}`;
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => {
          this.currentIndex = i;
          this.updateSlider();
        });
        this.dotsContainer.appendChild(dot);
      }
    }

    bindEvents() {
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => this.prev());
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.next());
      }

      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          this.updateItemsPerView();
          this.renderDots();
          this.updateSlider();
        }, 150);
      });

      // Touch / Swipe support
      this.track.addEventListener('touchstart', (e) => {
        this.touchStartX = e.touches[0].clientX;
      }, { passive: true });

      this.track.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].clientX;
        this.handleSwipe();
      }, { passive: true });
    }

    handleSwipe() {
      const diff = this.touchStartX - this.touchEndX;
      const threshold = 40;
      if (diff > threshold) {
        this.next();
      } else if (diff < -threshold) {
        this.prev();
      }
    }

    prev() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.updateSlider();
      } else {
        // Wrap to end
        this.currentIndex = this.maxIndex;
        this.updateSlider();
      }
    }

    next() {
      if (this.currentIndex < this.maxIndex) {
        this.currentIndex++;
        this.updateSlider();
      } else {
        // Wrap to start
        this.currentIndex = 0;
        this.updateSlider();
      }
    }

    updateSlider() {
      const slideWidthPercent = 100 / this.itemsPerView;
      const offset = this.currentIndex * slideWidthPercent;
      this.track.style.transform = `translateX(-${offset}%)`;

      // Update dot active state
      if (this.dotsContainer) {
        const dots = this.dotsContainer.querySelectorAll('button');
        dots.forEach((dot, idx) => {
          if (idx === this.currentIndex) {
            dot.className = 'w-7 h-2.5 rounded-full bg-blue-600 transition-all duration-300';
          } else {
            dot.className = 'w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-all duration-300';
          }
        });
      }
    }
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    new DirectorySlider('ca-slider-container');
  });

  window.GDGSlider = DirectorySlider;
})();
