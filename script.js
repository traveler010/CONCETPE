/**
 * CONCEPTPE — Interactive Client-Side JavaScript
 * Tagline: "Unlock Your Potential"
 * Phase 1: Pure Vanilla JS (UI/UX, Navigation, Dark Mode, Filters, Modals, Forms)
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // API base URL configuration:
  // - When served by the backend (port 5000) or Vite dev server (5173): uses relative path (same-origin)
  // - When opened from Live Server (5500), file://, or other dev tools: falls back to localhost:5000
  // - For production: relative paths ensure the frontend talks to the same host it's served from
  const API_BASE = (() => {
    const proto = window.location.protocol;
    const port = window.location.port;
    // If served from backend or Vite (proxied), use relative path
    if ((proto === 'http:' || proto === 'https:') && (port === '5000' || port === '5173' || port === '')) {
      return '';
    }
    // Local development fallback
    return 'http://localhost:5000';
  })();

  // Timeout wrapper for fetch — handles slow mobile networks gracefully
  function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal })
      .finally(() => clearTimeout(timeoutId));
  }


  /* ==========================================================================
     1. THEME MANAGEMENT (Light / Dark Theme with localStorage)
     ========================================================================== */
  const themeToggle = document.getElementById('themeToggle');
  const htmlRoot = document.documentElement;

  // Retrieve saved theme or evaluate system preference
  function getPreferredTheme() {
    const saved = localStorage.getItem('conceptpe_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('conceptpe_theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
  }

  // Initialize theme
  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlRoot.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  // Listen to OS theme changes if user has not manually set a preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('conceptpe_theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  /* ==========================================================================
     2. MOBILE NAVIGATION DRAWER
     ========================================================================== */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openDrawer() {
    if (!mobileDrawer || !drawerOverlay) return;
    mobileDrawer.classList.add('active');
    drawerOverlay.classList.add('active');
    hamburgerBtn?.classList.add('active');
    hamburgerBtn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!mobileDrawer || !drawerOverlay) return;
    mobileDrawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
    hamburgerBtn?.classList.remove('active');
    hamburgerBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      if (mobileDrawer?.classList.contains('active')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });

  // Close drawer on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer?.classList.contains('active')) {
      closeDrawer();
    }
  });

  /* ==========================================================================
     3. ACTIVE NAVIGATION LINK ON SCROLL (IntersectionObserver)
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-menu .nav-link');

  const navObserverOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        updateActiveNav(id);
      }
    });
  }, navObserverOptions);

  sections.forEach((section) => navObserver.observe(section));

  function updateActiveNav(activeId) {
    desktopNavLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    mobileNavLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Subtle sticky navbar shadow effect on scroll
  const navbar = document.getElementById('navbar');
  function handleNavbarScroll() {
    if (window.scrollY > 20) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // Smooth scroll handler for navigation menu items
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElem = document.querySelector(targetId);
        if (targetElem) {
          e.preventDefault();
          targetElem.scrollIntoView({ behavior: 'smooth' });
          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
          if (mobileDrawer?.classList.contains('active')) {
            closeDrawer();
          }
        }
      }
    });
  });

  /* ==========================================================================
     4. COURSES / SUBJECTS (BACKEND API INTEGRATION & FILTERING)
     ========================================================================== */
  const courseCardsContainer = document.getElementById('courseCardsContainer');
  const courseFilterBtns = document.querySelectorAll('[data-filter]');
  let allCourses = [];
  let currentCourseFilter = 'all';

  function renderCourseSkeletons() {
    if (!courseCardsContainer) return;
    let skeletonHtml = '';
    for (let i = 0; i < 6; i++) {
      skeletonHtml += `
        <div class="course-skeleton-card" aria-hidden="true">
          <div class="skeleton-line short"></div>
          <div class="skeleton-icon-box"></div>
          <div class="skeleton-line full" style="height: 20px;"></div>
          <div class="skeleton-line full"></div>
          <div class="skeleton-line medium"></div>
          <div class="skeleton-button"></div>
        </div>
      `;
    }
    courseCardsContainer.innerHTML = skeletonHtml;
  }

  function getCourseBadgeClass(category) {
    switch (category) {
      case 'math': return 'badge-navy';
      case 'physics-chemistry':
      case 'general-studies': return 'badge-amber';
      case 'biology': return 'badge-green';
      case 'gk': return 'badge-blue';
      case 'exam': return 'badge-navy';
      case 'revision': return 'badge-amber';
      default: return 'badge-navy';
    }
  }

  function getCourseAccentClass(category) {
    switch (category) {
      case 'math': return 'math-accent';
      case 'physics-chemistry':
      case 'general-studies': return 'pc-accent';
      case 'biology': return 'biology-accent';
      case 'gk': return 'gk-accent';
      case 'exam': return 'exam-accent';
      case 'revision': return 'revision-accent';
      default: return 'math-accent';
    }
  }

  function getCourseIconSvg(category) {
    switch (category) {
      case 'math':
        return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 5-7 7-7-7"/><path d="m19 19-7-7-7 7"/></svg>`;
      case 'physics-chemistry':
        return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v7.31L4.1 19.34A2 2 0 0 0 5.82 22h12.36a2 2 0 0 0 1.72-2.66L14 9.31V2"/><line x1="8.5" y1="2" x2="15.5" y2="2"/><line x1="6.8" y1="15" x2="17.2" y2="15"/></svg>`;
      case 'general-studies':
        return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`;
      case 'biology':
        return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`;
      case 'gk':
        return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;
      case 'exam':
        return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`;
      case 'revision':
        return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
      default:
        return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
  }

  function renderCourseCards(coursesToRender) {
    if (!courseCardsContainer) return;

    if (!coursesToRender || coursesToRender.length === 0) {
      courseCardsContainer.innerHTML = `
        <div class="content-status-box" role="status">
          <div class="content-status-icon icon-navy-subtle">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          </div>
          <h3 class="content-status-title">No Courses Found</h3>
          <p class="content-status-desc">No academic modules currently match the selected filter. Try selecting 'All Subjects'.</p>
          <button type="button" class="btn btn-outline-primary btn-sm" id="resetCourseFilterBtn">View All Subjects</button>
        </div>
      `;
      document.getElementById('resetCourseFilterBtn')?.addEventListener('click', () => {
        applyCourseFilter('all');
      });
      return;
    }

    let html = '';
    coursesToRender.forEach((c) => {
      const badgeCls = getCourseBadgeClass(c.category);
      const accentCls = getCourseAccentClass(c.category);
      const iconSvg = getCourseIconSvg(c.category);
      const highlightsHtml = (c.highlights || []).map(h => `<li>${escapeHtml(h)}</li>`).join('');

      html += `
        <article class="course-card" data-category="${escapeHtml(c.category)}" style="animation: fadeIn 0.3s ease forwards;">
          <div class="course-card-badge-row">
            <span class="badge ${badgeCls}">${escapeHtml(c.categoryLabel || c.category)}</span>
            <span class="badge badge-light">${escapeHtml(c.badge || c.level || 'Academic')}</span>
          </div>
          <div class="course-icon-banner ${accentCls}">
            ${iconSvg}
          </div>
          <h3 class="course-title">${escapeHtml(c.title)}</h3>
          <p class="course-desc">${escapeHtml(c.description)}</p>
          <ul class="course-highlights-list">
            ${highlightsHtml}
          </ul>
          <div class="course-card-footer">
            <span class="course-meta-tag">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${escapeHtml(c.level || 'Concept First')}
            </span>
            <button type="button" class="btn btn-outline-primary btn-sm view-syllabus-btn" data-course-id="${escapeHtml(c.id)}" data-course="${escapeHtml(c.categoryLabel || c.title)}" aria-label="Explore ${escapeHtml(c.title)}">
              Explore
            </button>
          </div>
        </article>
      `;
    });

    courseCardsContainer.innerHTML = html;
    bindSyllabusButtons();
  }

  function applyCourseFilter(filter) {
    currentCourseFilter = filter;
    courseFilterBtns.forEach((btn) => {
      const isMatch = btn.getAttribute('data-filter') === filter;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    if (filter === 'all') {
      renderCourseCards(allCourses);
    } else {
      const filtered = allCourses.filter(c => 
        (c.category && c.category.toLowerCase() === filter.toLowerCase()) ||
        (c.slug && c.slug.toLowerCase() === filter.toLowerCase())
      );
      renderCourseCards(filtered);
    }
  }

  async function loadCourses() {
    renderCourseSkeletons();
    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/courses`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && Array.isArray(data.data)) {
        allCourses = data.data;
        applyCourseFilter(currentCourseFilter);
      } else {
        renderCoursesError(data.error || 'Failed to retrieve curriculum pathways from server.');
      }
    } catch (err) {
      console.error('[Courses API Error]:', err);
      const msg = err.name === 'AbortError'
        ? 'Request timed out. Please check your connection and try again.'
        : 'Something went wrong. Please try again.';
      renderCoursesError(msg);
    }
  }

  function renderCoursesError(msg) {
    if (!courseCardsContainer) return;
    courseCardsContainer.innerHTML = `
      <div class="content-status-box" role="status">
        <div class="content-status-icon icon-red-subtle">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3 class="content-status-title">Unable to Load Courses</h3>
        <p class="content-status-desc">${escapeHtml(msg)}</p>
        <button type="button" class="btn btn-primary btn-sm" id="retryCoursesBtn">Try Again</button>
      </div>
    `;
    document.getElementById('retryCoursesBtn')?.addEventListener('click', loadCourses);
  }

  courseFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      applyCourseFilter(filter);
    });
  });

  /* ==========================================================================
     5. YOUTUBE VIDEO INTEGRATION & FILTERING
     ========================================================================== */
  const videoGridContainer = document.getElementById('videoGridContainer');
  const videoFilterBtns = document.querySelectorAll('[data-video-filter]');

  function formatPublishDate(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  }

  function renderVideoSkeletons() {
    if (!videoGridContainer) return;
    let skeletonHtml = '';
    for (let i = 0; i < 6; i++) {
      skeletonHtml += `
        <div class="video-skeleton-card" aria-hidden="true">
          <div class="skeleton-thumbnail"></div>
          <div class="skeleton-content">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line full"></div>
            <div class="skeleton-line medium"></div>
            <div class="skeleton-button"></div>
          </div>
        </div>
      `;
    }
    videoGridContainer.innerHTML = skeletonHtml;
  }

  function renderErrorState(customError) {
    if (!videoGridContainer) return;
    videoGridContainer.innerHTML = `
      <div class="video-status-box" role="status">
        <div class="video-status-icon">
          <svg class="icon-youtube" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
        <h3 class="video-status-title">Unable to load videos right now. Visit CONCEPTPE on YouTube.</h3>
        <p class="video-status-desc">${escapeHtml(customError || 'Explore all concept lectures, video tutorials, and exam strategy walkthroughs directly on our channel.')}</p>
        <a href="https://www.youtube.com/@Conceptpe" target="_blank" rel="noopener noreferrer" class="btn btn-youtube-solid">
          <svg class="icon-youtube" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          <span>Open YouTube Channel</span>
        </a>
      </div>
    `;
  }

  function renderEmptyState() {
    if (!videoGridContainer) return;
    videoGridContainer.innerHTML = `
      <div class="video-status-box" role="status">
        <div class="video-status-icon">
          <svg class="icon-youtube" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
        <h3 class="video-status-title">No videos found.</h3>
        <p class="video-status-desc">New concept lessons are regularly published to the CONCEPTPE YouTube channel.</p>
        <a href="https://www.youtube.com/@Conceptpe" target="_blank" rel="noopener noreferrer" class="btn btn-youtube-solid">
          <svg class="icon-youtube" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          <span>Open YouTube Channel</span>
        </a>
      </div>
    `;
  }

  function renderVideoCards(videos) {
    if (!videoGridContainer) return;
    if (!videos || videos.length === 0) {
      renderEmptyState();
      return;
    }

    let html = '';

    videos.forEach((v) => {
      const pubDate = formatPublishDate(v.publishedAt);
      const categoryTag = detectCategory(v.title, v.description, v.category);

      html += `
        <article class="video-card" data-video-category="${categoryTag}" style="animation: fadeIn 0.3s ease forwards;">
          <div class="video-thumbnail-box">
            ${v.thumbnail ? `
              <img src="${v.thumbnail}" alt="${escapeHtml(v.title)}" class="video-real-thumb" loading="lazy">
            ` : `
              <div class="thumbnail-placeholder math-thumb">
                <div class="thumb-graphics">
                  <span class="thumb-symbol">${escapeHtml(v.thumbnailFormula || '∫ f(x) dx')}</span>
                  <span class="thumb-topic">${escapeHtml(v.thumbnailTopic || 'Concept Lecture')}</span>
                </div>
              </div>
            `}
            ${v.duration ? `<div class="video-duration-badge">${escapeHtml(v.duration)}</div>` : ''}
            <a href="${v.videoUrl}" target="_blank" rel="noopener noreferrer" class="video-play-overlay" aria-label="Watch ${escapeHtml(v.title)} on YouTube">
              <div class="play-icon-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </a>
          </div>
          <div class="video-content">
            <div class="video-meta-row">
              <span class="badge badge-navy">${categoryLabel(categoryTag)}</span>
              ${pubDate ? `<span class="video-date">${pubDate}</span>` : `<span class="video-level">${escapeHtml(v.level || 'CONCEPTPE')}</span>`}
            </div>
            <h3 class="video-card-title">${escapeHtml(v.title)}</h3>
            <p class="video-card-desc">${escapeHtml(truncate(v.description || 'Watch the complete conceptual breakdown on YouTube.', 120))}</p>
            <div class="video-card-footer">
              <a href="${v.videoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-youtube-sm w-full">
                <svg class="icon-youtube" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                <span>Watch Video</span>
              </a>
            </div>
          </div>
        </article>
      `;
    });

    videoGridContainer.innerHTML = html;
  }

  function detectCategory(title = '', desc = '', fallback = 'all') {
    const text = `${title} ${desc}`.toLowerCase();
    if (text.includes('math') || text.includes('calculus') || text.includes('algebra') || text.includes('geometry') || text.includes('derivative') || text.includes('integral')) return 'math';
    if (text.includes('physics') || text.includes('chemistry') || text.includes('science') || text.includes('newton') || text.includes('thermodynamics')) return 'science';
    if (text.includes('code') || text.includes('algorithm') || text.includes('search') || text.includes('data structure') || text.includes('binary') || text.includes('cs') || text.includes('dsa')) return 'cs';
    if (text.includes('exam') || text.includes('test') || text.includes('strategy') || text.includes('score') || text.includes('marks') || text.includes('technique')) return 'strategy';
    return fallback || 'all';
  }

  function categoryLabel(cat) {
    switch (cat) {
      case 'math': return 'Mathematics';
      case 'science': return 'Science';
      case 'cs': return 'Computer Science';
      case 'strategy': return 'Exam Strategy';
      default: return 'Educational';
    }
  }

  function truncate(str, max) {
    if (!str || str.length <= max) return str;
    return str.slice(0, max) + '...';
  }

  async function loadVideos() {
    renderVideoSkeletons();

    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/youtube/videos`);
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && Array.isArray(data.videos)) {
        if (data.videos.length > 0) {
          renderVideoCards(data.videos);
        } else {
          renderEmptyState();
        }
      } else {
        renderErrorState(data.error);
      }
    } catch (err) {
      console.error('[YouTube API Error]:', err);
      const msg = err.name === 'AbortError'
        ? 'Request timed out. Please check your connection.'
        : undefined;
      renderErrorState(msg);
    }
  }

  // Filter button handlers
  videoFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      videoFilterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-video-filter');
      const cards = document.querySelectorAll('.video-card');

      cards.forEach((card) => {
        const cat = card.getAttribute('data-video-category');
        if (filter === 'all' || cat === filter || cat === 'all') {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });


  /* ==========================================================================
     6. STUDY RESOURCES (BACKEND API INTEGRATION & FILTERING)
     ========================================================================== */
  const resourceCardsContainer = document.getElementById('resourceCardsContainer');
  const resourceFilterBtns = document.querySelectorAll('[data-resource-filter]');
  let allResources = [];
  let currentResourceFilter = 'all';

  function renderResourceSkeletons() {
    if (!resourceCardsContainer) return;
    let skeletonHtml = '';
    for (let i = 0; i < 5; i++) {
      skeletonHtml += `
        <div class="resource-skeleton-card" aria-hidden="true">
          <div class="skeleton-icon-box"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line full" style="height: 20px;"></div>
          <div class="skeleton-line full"></div>
          <div class="skeleton-button"></div>
        </div>
      `;
    }
    resourceCardsContainer.innerHTML = skeletonHtml;
  }

  function getResourceIconClass(cat) {
    switch (cat) {
      case 'notes': return 'icon-navy';
      case 'practice': return 'icon-green';
      case 'revision': return 'icon-amber';
      case 'concepts': return 'icon-blue';
      case 'exam': return 'icon-navy';
      default: return 'icon-navy';
    }
  }

  function getResourceBadgeClass(cat) {
    switch (cat) {
      case 'notes': return 'badge-navy';
      case 'practice': return 'badge-green';
      case 'revision': return 'badge-amber';
      case 'concepts': return 'badge-blue';
      case 'exam': return 'badge-navy';
      default: return 'badge-navy';
    }
  }

  function renderResourceCards(resourcesToRender) {
    if (!resourceCardsContainer) return;

    if (!resourcesToRender || resourcesToRender.length === 0) {
      resourceCardsContainer.innerHTML = `
        <div class="content-status-box" role="status">
          <div class="content-status-icon icon-navy-subtle">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          </div>
          <h3 class="content-status-title">No Resources Found</h3>
          <p class="content-status-desc">There are no study materials currently listed in this category.</p>
          <button type="button" class="btn btn-outline-primary btn-sm" id="resetResourceFilterBtn">View All Resources</button>
        </div>
      `;
      document.getElementById('resetResourceFilterBtn')?.addEventListener('click', () => {
        applyResourceFilter('all');
      });
      return;
    }

    let html = '';
    resourcesToRender.forEach((r) => {
      const iconWrapClass = getResourceIconClass(r.category);
      const badgeClass = getResourceBadgeClass(r.category);
      const tagsHtml = (r.tags || []).map(t => `<span class="resource-tag">${escapeHtml(t)}</span>`).join('');

      html += `
        <article class="resource-card" data-resource-type="${escapeHtml(r.category)}" style="animation: fadeIn 0.3s ease forwards;">
          <div class="resource-icon-wrap ${iconWrapClass}">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div class="resource-card-meta">
            <span class="badge ${badgeClass}">${escapeHtml(r.categoryLabel || r.category)}</span>
            <span class="resource-format">${escapeHtml(r.type || 'Structured PDF')}</span>
          </div>
          <h3 class="resource-title">${escapeHtml(r.title)}</h3>
          <p class="resource-desc">${escapeHtml(r.description)}</p>
          <div class="resource-details">
            ${tagsHtml}
          </div>
          <button type="button" class="btn btn-outline-primary btn-sm w-full resource-action-btn" data-resource-id="${escapeHtml(r.id)}" data-resource-name="${escapeHtml(r.title)}">
            Access Resource
          </button>
        </article>
      `;
    });

    resourceCardsContainer.innerHTML = html;
    bindResourceButtons();
  }

  function applyResourceFilter(filter) {
    currentResourceFilter = filter;
    resourceFilterBtns.forEach((btn) => {
      const isMatch = btn.getAttribute('data-resource-filter') === filter;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    if (filter === 'all') {
      renderResourceCards(allResources);
    } else {
      const filtered = allResources.filter(r => r.category && r.category.toLowerCase() === filter.toLowerCase());
      renderResourceCards(filtered);
    }
  }

  async function loadResources() {
    renderResourceSkeletons();
    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/resources`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && Array.isArray(data.data)) {
        allResources = data.data;
        applyResourceFilter(currentResourceFilter);
      } else {
        renderResourcesError(data.error || 'Failed to retrieve study materials.');
      }
    } catch (err) {
      console.error('[Resources API Error]:', err);
      const msg = err.name === 'AbortError'
        ? 'Request timed out. Please check your connection and try again.'
        : 'Something went wrong. Please try again.';
      renderResourcesError(msg);
    }
  }

  function renderResourcesError(msg) {
    if (!resourceCardsContainer) return;
    resourceCardsContainer.innerHTML = `
      <div class="content-status-box" role="status">
        <div class="content-status-icon icon-red-subtle">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h3 class="content-status-title">Unable to Load Resources</h3>
        <p class="content-status-desc">${escapeHtml(msg)}</p>
        <button type="button" class="btn btn-primary btn-sm" id="retryResourcesBtn">Try Again</button>
      </div>
    `;
    document.getElementById('retryResourcesBtn')?.addEventListener('click', loadResources);
  }

  resourceFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-resource-filter');
      applyResourceFilter(filter);
    });
  });

  /* ==========================================================================
     7. INTERACTIVE SYLLABUS & RESOURCE PREVIEW MODAL
     ========================================================================== */
  const previewModal = document.getElementById('previewModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalCloseActionBtn = document.getElementById('modalCloseActionBtn');

  function openModal(title, html) {
    if (!previewModal) return;
    modalTitle.textContent = title;
    modalContent.innerHTML = html;
    previewModal.classList.add('active');
    previewModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!previewModal) return;
    previewModal.classList.remove('active');
    previewModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function bindSyllabusButtons() {
    document.querySelectorAll('.view-syllabus-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const courseId = btn.getAttribute('data-course-id');
        const courseName = btn.getAttribute('data-course');
        const course = allCourses.find(c => c.id === courseId || c.categoryLabel === courseName);

        if (course) {
          if (course.modules && course.modules.length > 0) {
            let modulesHtml = `<div class="modal-topic-list">`;
            course.modules.forEach((mod, idx) => {
              modulesHtml += `
                <div class="modal-topic-item">
                  <div>
                    <strong>${idx + 1}. ${escapeHtml(mod.name)}</strong>
                    <p style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 2px;">${escapeHtml(mod.details)}</p>
                  </div>
                </div>
              `;
            });
            modulesHtml += `</div>`;

            const fullHtml = `
              <p style="font-size: 0.875rem; color: var(--brand-green); font-weight: 600; margin-bottom: 0.5rem;">${escapeHtml(course.badge || course.level || 'Academic Track')}</p>
              <p style="margin-bottom: 1.25rem;">${escapeHtml(course.description)}</p>
              <h4 class="modal-section-title">Core Curriculum Modules:</h4>
              ${modulesHtml}
              <div style="margin-top: 1.25rem; padding: 0.875rem; background-color: var(--bg-tertiary); border-radius: var(--radius-sm); font-size: 0.8125rem; color: var(--text-secondary);">
                <strong>Note:</strong> Video lectures for this track are regularly published on the official <strong>@Conceptpe</strong> YouTube channel.
              </div>
            `;
            openModal(course.title, fullHtml);
          } else {
            // Category in preparation - show a clean "Coming Soon" modal!
            const topics = course.topics || [];
            let topicsHtml = '';
            if (topics.length > 0) {
              topicsHtml = `<div class="modal-topic-list">`;
              topics.forEach((t) => {
                topicsHtml += `
                  <div class="modal-topic-item">
                    <span>${escapeHtml(t)}</span>
                    <span class="badge badge-light">In Preparation</span>
                  </div>
                `;
              });
              topicsHtml += `</div>`;
            }

            const comingSoonHtml = `
              <div style="margin-bottom: 1.25rem;">
                <span class="badge badge-amber" style="margin-bottom: 0.75rem; display: inline-block;">Curriculum In Preparation</span>
                <p style="font-size: 0.9375rem; color: var(--text-primary); margin-bottom: 0.5rem;"><strong>${escapeHtml(course.description)}</strong></p>
                <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6;">Detailed conceptual lessons, lecture notes, and structured study modules for this track are currently being organized by the CONCEPTPE academic team.</p>
              </div>
              ${topics.length > 0 ? `
                <h4 class="modal-section-title">Planned Learning Topics:</h4>
                ${topicsHtml}
              ` : ''}
              <div style="margin-top: 1.25rem; padding: 1rem; background-color: var(--bg-tertiary); border-radius: var(--radius-sm); font-size: 0.8125rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.75rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-amber)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span><strong>Coming Soon:</strong> New lessons and topic breakdowns are being scheduled for the CONCEPTPE YouTube channel.</span>
              </div>
            `;
            openModal(`${course.title} — Coming Soon`, comingSoonHtml);
          }
        }
      });
    });
  }

  function bindResourceButtons() {
    document.querySelectorAll('.resource-action-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const resId = btn.getAttribute('data-resource-id');
        const resName = btn.getAttribute('data-resource-name') || 'Study Resource';
        const resource = allResources.find(r => r.id === resId);

        const resourceHtml = `
          <p style="margin-bottom: 1.25rem;">
            ${escapeHtml(resource?.description || 'CONCEPTPE provides structured, concept-first study materials designed to streamline student revision and retention.')}
          </p>
          <h4 class="modal-section-title">Included Components:</h4>
          <div class="modal-topic-list">
            <div class="modal-topic-item">
              <span>Structured Chapter Summary & Core Definitions</span>
              <span class="badge badge-light">PDF Ready</span>
            </div>
            <div class="modal-topic-item">
              <span>Visual Concept Roadmaps & Flowcharts</span>
              <span class="badge badge-light">Graphic Digest</span>
            </div>
            <div class="modal-topic-item">
              <span>Graded Practice Examples with Complete Solutions</span>
              <span class="badge badge-light">Interactive</span>
            </div>
            <div class="modal-topic-item">
              <span>Curriculum Checklist & Formula Cheat-Sheets</span>
              <span class="badge badge-light">Quick Recall</span>
            </div>
          </div>
          <div style="margin-top: 1.25rem; padding: 0.875rem; background-color: var(--bg-tertiary); border-radius: var(--radius-sm); font-size: 0.8125rem; color: var(--text-secondary);">
            <strong>Status:</strong> ${escapeHtml(resource?.status === 'available' ? 'Available for registered learners' : 'In Preparation')} &bull; Format: ${escapeHtml(resource?.type || 'PDF')}
          </div>
        `;
        openModal(resource?.title || resName, resourceHtml);
      });
    });
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalCloseActionBtn) modalCloseActionBtn.addEventListener('click', closeModal);

  if (previewModal) {
    previewModal.addEventListener('click', (e) => {
      if (e.target === previewModal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && previewModal?.classList.contains('active')) {
      closeModal();
    }
  });

  /* ==========================================================================
     8. CONTACT FORM (BACKEND POST /api/contact & VALIDATION)
     ========================================================================== */
  const contactForm = document.getElementById('contactForm');
  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const messageInput = document.getElementById('contactMessage');
  const charCounter = document.getElementById('charCounter');
  const formStatusAlert = document.getElementById('formStatusAlert');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');

  // Live character counter for message
  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      const len = messageInput.value.length;
      charCounter.textContent = `${len} / 500`;
      if (len > 500) {
        charCounter.style.color = 'var(--color-red-500)';
      } else {
        charCounter.style.color = 'var(--text-muted)';
      }
    });
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  // Clear validation indicators on input
  [nameInput, emailInput, messageInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', () => {
        inp.classList.remove('is-invalid');
        inp.removeAttribute('aria-invalid');
      });
    }
  });

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let isValid = true;

      // Reset previous error messages
      if (nameError) nameError.textContent = '';
      if (emailError) emailError.textContent = '';
      if (messageError) messageError.textContent = '';
      nameInput?.classList.remove('is-invalid');
      emailInput?.classList.remove('is-invalid');
      messageInput?.classList.remove('is-invalid');
      if (formStatusAlert) formStatusAlert.style.display = 'none';

      // Name Validation
      const nameVal = nameInput ? nameInput.value.trim() : '';
      if (!nameVal || nameVal.length < 2) {
        if (nameError) nameError.textContent = 'Please enter your full name (at least 2 characters).';
        nameInput?.classList.add('is-invalid');
        nameInput?.setAttribute('aria-invalid', 'true');
        isValid = false;
      }

      // Email Validation
      const emailVal = emailInput ? emailInput.value.trim() : '';
      if (!emailVal || !validateEmail(emailVal)) {
        if (emailError) emailError.textContent = 'Please enter a valid email address.';
        emailInput?.classList.add('is-invalid');
        emailInput?.setAttribute('aria-invalid', 'true');
        isValid = false;
      }

      // Message Validation
      const msgVal = messageInput ? messageInput.value.trim() : '';
      if (!msgVal || msgVal.length < 10) {
        if (messageError) messageError.textContent = 'Please enter a message of at least 10 characters.';
        messageInput?.classList.add('is-invalid');
        messageInput?.setAttribute('aria-invalid', 'true');
        isValid = false;
      } else if (msgVal.length > 500) {
        if (messageError) messageError.textContent = 'Your message exceeds the 500 character limit.';
        messageInput?.classList.add('is-invalid');
        messageInput?.setAttribute('aria-invalid', 'true');
        isValid = false;
      }

      if (isValid) {
        const subjectSelect = document.getElementById('contactSubject');
        const subjectVal = subjectSelect ? subjectSelect.value : 'general';
        const submitBtn = document.getElementById('contactSubmitBtn');
        const originalBtnContent = submitBtn ? submitBtn.innerHTML : 'Send Message';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `
            <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
            <span>Sending...</span>
          `;
        }

        try {
          const res = await fetchWithTimeout(`${API_BASE}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: nameVal,
              email: emailVal,
              subject: subjectVal,
              message: msgVal
            })
          }, 20000);

          const data = await res.json().catch(() => ({}));

          if (res.ok && data.success) {
            if (formStatusAlert) {
              formStatusAlert.className = 'form-status-alert alert-success';
              formStatusAlert.innerHTML = `
                <strong>Success!</strong> ${escapeHtml(data.message || 'Your message has been sent successfully.')}
              `;
              formStatusAlert.style.display = 'block';
            }
            contactForm.reset();
            if (charCounter) charCounter.textContent = '0 / 500';
          } else {
            // Backend validation error or server failure - DO NOT pretend submission succeeded!
            let errorMsg = data.error || 'Server rejected the submission.';
            if (Array.isArray(data.details) && data.details.length > 0) {
              errorMsg = data.details.map(d => d.message).join(' ');
            }
            if (formStatusAlert) {
              formStatusAlert.className = 'form-status-alert alert-error';
              formStatusAlert.innerHTML = `
                <strong>Message Not Sent:</strong> ${escapeHtml(errorMsg)}
              `;
              formStatusAlert.style.display = 'block';
            }
          }
        } catch (err) {
          console.error('[Contact Form Error]:', err);
          if (formStatusAlert) {
            const errorMsg = err.name === 'AbortError'
              ? 'Request timed out. Please check your internet connection and try again.'
              : 'Unable to send your message right now. Please try again.';
            formStatusAlert.className = 'form-status-alert alert-error';
            formStatusAlert.innerHTML = `
              <strong>Error:</strong> ${errorMsg}
            `;
            formStatusAlert.style.display = 'block';
          }
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
          }
        }
      }
    });
  }

  // Concurrent Initial Load of Backend Endpoints
  loadCourses();
  loadVideos();
  loadResources();

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* ==========================================================================
     9. BACK TO TOP BUTTON
     ========================================================================== */
  const backToTopBtn = document.getElementById('backToTopBtn');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn?.classList.add('visible');
    } else {
      backToTopBtn?.classList.remove('visible');
    }
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* ==========================================================================
     10. DYNAMIC YEAR
     ========================================================================== */
  const currentYearSpan = document.getElementById('currentYear');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }
});
