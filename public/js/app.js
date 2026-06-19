document.addEventListener('DOMContentLoaded', () => {
  // Global States
  let projectsData = [];
  let skillsData = [];
  
  // DOM Elements
  const header = document.querySelector('.header');
  const scrollProgress = document.getElementById('scroll-progress');
  const themeToggle = document.getElementById('theme-toggle');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Profile elements
  const profileNameTitle = document.getElementById('profile-name-title');
  const profileBioHero = document.getElementById('profile-bio-hero');
  const profileAvatar = document.getElementById('profile-avatar');
  const profileBioFull = document.getElementById('profile-bio-full');
  const profileResume = document.getElementById('profile-resume');
  const contactDetailEmail = document.getElementById('contact-detail-email');
  
  // Social links
  const socialGithub = document.getElementById('social-github');
  const socialLinkedin = document.getElementById('social-linkedin');
  const socialLeetcode = document.getElementById('social-leetcode');
  const socialTwitter = document.getElementById('social-twitter');
  const socialEmail = document.getElementById('social-email');

  // Skills & Projects Containers
  const skillsContainer = document.getElementById('skills-container');
  const skillsTabs = document.getElementById('skills-tabs');
  const projectsContainer = document.getElementById('projects-container');
  const projectsTabs = document.getElementById('projects-tabs');
  const projectSearch = document.getElementById('project-search');

  // Contact Form
  const contactForm = document.getElementById('contact-form');
  const contactFormWrapper = document.querySelector('.contact-form-wrapper');
  const submitBtn = document.getElementById('submit-btn');
  const formStatus = document.getElementById('form-status');
  const statusIcon = document.getElementById('status-icon');
  const statusTitle = document.getElementById('status-title');
  const statusDesc = document.getElementById('status-desc');
  const statusResetBtn = document.getElementById('status-reset-btn');
  const emailTestLinkWrap = document.getElementById('email-test-link-wrap');
  const emailTestLink = document.getElementById('email-test-link');

  /* ==========================================================================
     THEME TOGGLER (DARK / LIGHT)
     ========================================================================== */
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  /* ==========================================================================
     MOBILE NAVIGATION MENU
     ========================================================================== */
  mobileToggle.addEventListener('click', () => {
    const isOpen = mobileToggle.classList.toggle('open');
    mobileToggle.setAttribute('aria-expanded', isOpen);
    navMenu.classList.toggle('open');
  });

  // Close mobile menu when clicking a nav link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('open');
      mobileToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('open');
    });
  });

  /* ==========================================================================
     SCROLL EFFECTS & ACTIVE LINKS
     ========================================================================== */
  window.addEventListener('scroll', () => {
    // 1. Header scroll state
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // 2. Reading progress bar
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    scrollProgress.style.width = scrolled + '%';

    // 3. Highlight active nav links on scroll
    const scrollPosition = window.scrollY + 200;
    const sections = ['home', 'about', 'skills', 'projects', 'contact'];
    
    sections.forEach(secId => {
      const el = document.getElementById(secId);
      if (el) {
        const top = el.offsetTop;
        const h = el.offsetHeight;
        
        if (scrollPosition >= top && scrollPosition < top + h) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-sec') === secId || (secId === 'home' && link.getAttribute('data-sec') === 'hero')) {
              link.classList.add('active');
            }
          });
        }
      }
    });
  });

  /* ==========================================================================
     TYPING ANIMATION
     ========================================================================== */
  const words = ['Full-Stack Software Engineer', 'Problem Solver', 'UI/UX Enthusiast', 'Node.js Developer'];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typedSpan = document.getElementById('typed-text');

  function typeEffect() {
    if (!typedSpan) return;
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      typedSpan.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typedSpan.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = isDeleting ? 40 : 100;

    if (!isDeleting && charIndex === currentWord.length) {
      typeSpeed = 1500; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 400; // Pause before typing next word
    }

    setTimeout(typeEffect, typeSpeed);
  }
  
  typeEffect();

  /* ==========================================================================
     FETCH PORTFOLIO DATA FROM BACKEND APIs
     ========================================================================== */
  const fetchPortfolioData = async () => {
    try {
      // 1. Fetch Profile Data
      const profileRes = await fetch('/api/profile');
      const profileJson = await profileRes.json();
      if (profileJson.success && profileJson.data.name) {
        renderProfile(profileJson.data);
      }

      // 2. Fetch Skills Data
      const skillsRes = await fetch('/api/skills');
      const skillsJson = await skillsRes.json();
      if (skillsJson.success) {
        skillsData = skillsJson.data;
        renderSkills(skillsData);
      }

      // 3. Fetch Projects Data
      const projectsRes = await fetch('/api/projects');
      const projectsJson = await projectsRes.json();
      if (projectsJson.success) {
        projectsData = projectsJson.data;
        renderProjects(projectsData);
      }
    } catch (err) {
      console.error('Error fetching data from API endpoints:', err);
      // Populate placeholder errors in DOM containers
      skillsContainer.innerHTML = `<div class="loading-state"><i class="fas fa-exclamation-triangle" style="color: var(--error)"></i> Failed to load skills. Please check backend.</div>`;
      projectsContainer.innerHTML = `<div class="loading-state"><i class="fas fa-exclamation-triangle" style="color: var(--error)"></i> Failed to load projects. Please check backend.</div>`;
    }
  };

  /* ==========================================================================
     DOM RENDERING HELPER METHODS
     ========================================================================== */
  const renderProfile = (profile) => {
    profileNameTitle.textContent = profile.name;
    profileBioHero.textContent = profile.bio;
    profileBioFull.textContent = profile.bio;
    profileAvatar.src = profile.avatar;
    profileAvatar.alt = profile.name;
    profileResume.href = profile.resumeUrl || '#';
    contactDetailEmail.textContent = profile.socialLinks?.email || '';
    
    // Setup social link anchors
    if (profile.socialLinks) {
      socialGithub.href = profile.socialLinks.github || '#';
      socialLinkedin.href = profile.socialLinks.linkedin || '#';
      if (socialLeetcode) {
        socialLeetcode.href = profile.socialLinks.leetcode || '#';
      }
      socialTwitter.href = profile.socialLinks.twitter || '#';
      socialEmail.href = `mailto:${profile.socialLinks.email || ''}`;
    }
  };

  const renderSkills = (skills) => {
    if (skills.length === 0) {
      skillsContainer.innerHTML = '<p class="loading-state">No skills available.</p>';
      return;
    }

    skillsContainer.innerHTML = '';
    skills.forEach(skill => {
      const card = document.createElement('div');
      card.className = 'skill-card glass scroll-reveal';
      card.setAttribute('data-category', skill.category);
      
      card.innerHTML = `
        <div class="skill-icon-wrap">
          <i class="${skill.icon || 'fas fa-code'}"></i>
        </div>
        <h4 class="skill-name">${skill.name}</h4>
        <div class="skill-progress-bar">
          <div class="skill-progress-fill" data-level="${skill.level}"></div>
        </div>
        <span class="skill-level-text">${skill.level}%</span>
      `;
      skillsContainer.appendChild(card);
    });

    // Re-trigger scroll reveal for skills and fill bars
    triggerScrollReveal();
  };

  const renderProjects = (projects) => {
    if (projects.length === 0) {
      projectsContainer.innerHTML = '<p class="loading-state">No projects found.</p>';
      return;
    }

    projectsContainer.innerHTML = '';
    projects.forEach(project => {
      const card = document.createElement('article');
      card.className = 'project-card glass scroll-reveal';
      
      const tagsHtml = project.tags.map(t => `<span class="tag-badge">${t}</span>`).join('');
      const featuredBadge = project.featured ? `<span class="project-featured-badge">Featured</span>` : '';

      card.innerHTML = `
        <div class="project-image-wrap">
          <img src="${project.imageUrl || 'https://via.placeholder.com/400x250'}" alt="${project.title}" class="project-img">
          ${featuredBadge}
        </div>
        <div class="project-details-wrap">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-desc">${project.description}</p>
          <div class="project-tags">
            ${tagsHtml}
          </div>
          <div class="project-links">
            ${project.githubLink ? `<a href="${project.githubLink}" target="_blank" class="project-link"><i class="fab fa-github"></i> Source</a>` : ''}
            ${project.liveLink ? `<a href="${project.liveLink}" target="_blank" class="project-link"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
          </div>
        </div>
      `;
      projectsContainer.appendChild(card);
    });

    // Re-trigger scroll reveal
    triggerScrollReveal();
  };

  /* ==========================================================================
     FILTER & SEARCH LOGIC
     ========================================================================== */
  
  // Skills Tab Filtering
  skillsTabs.addEventListener('click', (e) => {
    if (!e.target.classList.contains('tab-btn')) return;
    
    // Toggle active classes on tab buttons
    skillsTabs.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    const filterVal = e.target.getAttribute('data-filter');
    const skillCards = skillsContainer.querySelectorAll('.skill-card');

    skillCards.forEach(card => {
      const cat = card.getAttribute('data-category');
      if (filterVal === 'all' || cat === filterVal) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });

  // Projects Filtering & Live Searching
  const filterAndSearchProjects = () => {
    const activeTab = projectsTabs.querySelector('.tab-btn.active').getAttribute('data-filter');
    const query = projectSearch.value.toLowerCase().trim();

    let filtered = projectsData;

    // Filter by Tab (Featured)
    if (activeTab === 'featured') {
      filtered = filtered.filter(p => p.featured);
    }

    // Filter by search query (match title, desc, or tags)
    if (query) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) || 
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    renderProjects(filtered);
  };

  // Projects Tab Filter
  projectsTabs.addEventListener('click', (e) => {
    if (!e.target.classList.contains('tab-btn')) return;
    projectsTabs.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    filterAndSearchProjects();
  });

  // Project Live Search (with debounce)
  let searchDebounceTimeout;
  projectSearch.addEventListener('input', () => {
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(filterAndSearchProjects, 250);
  });

  /* ==========================================================================
     SCROLL REVEAL & SKILLS PROGRESS ANIMATION
     ========================================================================== */
  const triggerScrollReveal = () => {
    const reveals = document.querySelectorAll('.scroll-reveal');
    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          
          // If this is a skill card, trigger progress bar fill animation
          const progressFill = entry.target.querySelector('.skill-progress-fill');
          if (progressFill) {
            const level = progressFill.getAttribute('data-level');
            progressFill.style.width = level + '%';
          }
          
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    reveals.forEach(rev => {
      revealObserver.observe(rev);
    });
  };

  /* ==========================================================================
     CONTACT FORM CLIENT-SIDE VALIDATION & AJAX SUBMIT
     ========================================================================== */
  const validateField = (input, errorSpan, validationFn) => {
    const errorMsg = validationFn(input.value);
    if (errorMsg) {
      input.classList.add('invalid');
      errorSpan.textContent = errorMsg;
      return false;
    } else {
      input.classList.remove('invalid');
      errorSpan.textContent = '';
      return true;
    }
  };

  // Form Field Validation Rules
  const validators = {
    name: (val) => {
      if (!val.trim()) return 'Name is required.';
      if (val.trim().length < 2) return 'Name must be at least 2 characters.';
      return '';
    },
    email: (val) => {
      if (!val.trim()) return 'Email is required.';
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(val.trim())) return 'Please enter a valid email address.';
      return '';
    },
    subject: (val) => {
      if (val.trim().length > 200) return 'Subject cannot exceed 200 characters.';
      return '';
    },
    message: (val) => {
      if (!val.trim()) return 'Message content is required.';
      if (val.trim().length < 10) return 'Message must be at least 10 characters.';
      return '';
    }
  };

  // Real-time blur validation listener
  const fields = ['name', 'email', 'subject', 'message'];
  fields.forEach(field => {
    const input = document.getElementById(`form-${field}`);
    const errorSpan = document.getElementById(`${field}-error`);
    if (input && errorSpan) {
      input.addEventListener('blur', () => {
        validateField(input, errorSpan, validators[field]);
      });
      // Clear error as user types
      input.addEventListener('input', () => {
        if (input.classList.contains('invalid')) {
          validateField(input, errorSpan, validators[field]);
        }
      });
    }
  });

  // Submit contact form via fetch API
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let isValid = true;
    fields.forEach(field => {
      const input = document.getElementById(`form-${field}`);
      const errorSpan = document.getElementById(`${field}-error`);
      if (input && errorSpan) {
        const fieldValid = validateField(input, errorSpan, validators[field]);
        if (!fieldValid) isValid = false;
      }
    });

    if (!isValid) return;

    // Trigger loading state on form wrapper
    contactFormWrapper.classList.add('submitting');
    submitBtn.setAttribute('disabled', 'true');

    const formData = {
      name: document.getElementById('form-name').value,
      email: document.getElementById('form-email').value,
      subject: document.getElementById('form-subject').value,
      message: document.getElementById('form-message').value
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const json = await response.json();

      if (response.ok && json.success) {
        // Success State
        formStatus.className = 'form-status-overlay active success-state';
        statusIcon.innerHTML = '<i class="fas fa-check"></i>';
        statusTitle.textContent = 'Message Sent!';
        statusDesc.textContent = json.message || "Thank you. Your message has been saved and sent.";
        
        // Show test email urls if returned by Ethereal development SMTP transporter
        if (json.data && json.data.emailUrls && json.data.emailUrls.ownerNotification) {
          emailTestLink.href = json.data.emailUrls.ownerNotification;
          emailTestLinkWrap.style.display = 'block';
        } else {
          emailTestLinkWrap.style.display = 'none';
        }
        
        contactForm.reset();
      } else {
        // Server validation error state
        formStatus.className = 'form-status-overlay active error-state';
        statusIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        statusTitle.textContent = 'Submission Failed';
        
        if (json.errors && Array.isArray(json.errors)) {
          // Display specific field errors under inputs instead of dialog overlay
          json.errors.forEach(err => {
            const input = document.getElementById(`form-${err.field}`);
            const errorSpan = document.getElementById(`${err.field}-error`);
            if (input && errorSpan) {
              input.classList.add('invalid');
              errorSpan.textContent = err.message;
            }
          });
          statusDesc.textContent = "Please correct the highlighted inputs and try again.";
        } else {
          statusDesc.textContent = json.error?.message || "An unexpected validation issue occurred on the server.";
        }
        emailTestLinkWrap.style.display = 'none';
      }
    } catch (err) {
      // Network/Server down error state
      formStatus.className = 'form-status-overlay active error-state';
      statusIcon.innerHTML = '<i class="fas fa-wifi"></i>';
      statusTitle.textContent = 'Connection Error';
      statusDesc.textContent = 'Could not contact the server. Please check your internet connection or try again later.';
      emailTestLinkWrap.style.display = 'none';
    } finally {
      // Remove loading state
      contactFormWrapper.classList.remove('submitting');
      submitBtn.removeAttribute('disabled');
    }
  });

  // Reset status modal
  statusResetBtn.addEventListener('click', () => {
    formStatus.classList.remove('active');
  });

  /* ==========================================================================
     APP INITIALIZATION
     ========================================================================== */
  fetchPortfolioData();
});
