// App Logic for Antigravity Floating Ecosystem

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  initZeroGravityPhysics();
  initCableConnections();
  initModalSystem();
  initAvatarHudModal();
});

// ==========================================
// 1. BACKGROUND CANVAS (Matrix Cyber Rain)
// ==========================================
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  
  window.addEventListener('resize', () => {
    width = (canvas.width = window.innerWidth);
    height = (canvas.height = window.innerHeight);
  });
  
  // Matrix character set
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/\\';
  const fontSize = 14;
  const columns = Math.floor(width / fontSize);
  const drops = Array(columns).fill(1);
  
  function draw() {
    ctx.fillStyle = 'rgba(5, 6, 11, 0.08)'; // Semi-transparent black to create trailing effect
    ctx.fillRect(0, 0, width, height);
    
    // Cyberpunk themed drop colors (Cyan & Violet hues)
    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      
      // Randomize color per stream (mostly crimson, some gold/white)
      const rand = Math.random();
      if (rand < 0.75) {
        ctx.fillStyle = '#b91c1c'; // crimson
      } else if (rand < 0.95) {
        ctx.fillStyle = '#d4af37'; // gold
      } else {
        ctx.fillStyle = '#ffffff'; // white
      }
      
      ctx.font = `${fontSize}px monospace`;
      ctx.fillText(char, x, y);
      
      if (y > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }
  
  // Throttle to 30 FPS to reduce CPU consumption
  setInterval(draw, 33);
}

// ==========================================
// 2. ZERO-GRAVITY PHYSICS & PARALLAX
// ==========================================
let modules = [];

function initZeroGravityPhysics() {
  const container = document.getElementById('ecosystem');
  const rawModules = document.querySelectorAll('.floating-module');
  
  let mouseX = 0;
  let mouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;
  const lerpFactor = 0.05; // Smoothing factor for inertia
  
  // Track mouse movement
  window.addEventListener('mousemove', (e) => {
    // Normalize coordinates around center: -0.5 to 0.5
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  });
  
  // Populate physics objects
  rawModules.forEach((el, index) => {
    // Give each module a unique drift velocity, amplitude and offsets
    modules.push({
      el: el,
      x: 0, // dynamic offsets
      y: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      // Phase shifts so they drift independently
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      phaseZ: Math.random() * Math.PI * 2,
      // Frequency (speed)
      freqX: 0.001 + Math.random() * 0.0015,
      freqY: 0.0008 + Math.random() * 0.0012,
      freqZ: 0.0005 + Math.random() * 0.0008,
      // Drift amplitude (pixels)
      ampX: 8 + Math.random() * 12,
      ampY: 10 + Math.random() * 15,
      ampZ: 2 + Math.random() * 4,
      // Parallax depth scaling (Z-depth simulation)
      depth: el.classList.contains('central-core') ? 0.3 : (0.5 + Math.random() * 0.8)
    });
  });
  
  // Specific settings for child nodes inside the linked cluster
  const techCluster = document.getElementById('node-techcluster');
  const nodes = techCluster.querySelectorAll('.tech-node');
  
  nodes.forEach((node, idx) => {
    // Add micro floating inside cluster
    modules.push({
      el: node,
      x: 0,
      y: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      phaseZ: Math.random() * Math.PI * 2,
      freqX: 0.002 + Math.random() * 0.002,
      freqY: 0.002 + Math.random() * 0.002,
      freqZ: 0.001,
      ampX: 4 + Math.random() * 4,
      ampY: 5 + Math.random() * 5,
      ampZ: 1,
      depth: 1.1
    });
  });

  const timeStart = Date.now();
  
  function updatePhysics() {
    const time = Date.now() - timeStart;
    
    // Lerp mouse offsets for inertial scrolling
    currentMouseX += (mouseX - currentMouseX) * lerpFactor;
    currentMouseY += (mouseY - currentMouseY) * lerpFactor;
    
    // Disable float physics if screen is small (mobile layouts become vertical stack)
    const isMobile = window.innerWidth <= 1100;
    
    modules.forEach((mod) => {
      if (isMobile) {
        // Clear transforms on mobile
        mod.el.style.transform = '';
        return;
      }
      
      // Calculate zero-gravity float
      const driftX = Math.sin(time * mod.freqX + mod.phaseX) * mod.ampX;
      const driftY = Math.cos(time * mod.freqY + mod.phaseY) * mod.ampY;
      const driftZ = Math.sin(time * mod.freqZ + mod.phaseZ) * mod.ampZ;
      const driftRotZ = Math.sin(time * mod.freqZ + mod.phaseZ) * 2; // small drift rotation
      
      // Calculate parallax mouse shift (deeper elements shift more)
      const parallaxX = currentMouseX * 120 * mod.depth;
      const parallaxY = currentMouseY * 80 * mod.depth;
      
      // Calculate 3D mouse rotation (hover tilt look-at effect)
      let tiltX = -currentMouseY * 18 * mod.depth;
      let tiltY = currentMouseX * 24 * mod.depth;
      
      // Combine drift + parallax
      mod.x = driftX + parallaxX;
      mod.y = driftY + parallaxY;
      mod.rotX = tiltX;
      mod.rotY = tiltY;
      mod.rotZ = driftRotZ;
      
      // Apply CSS styles
      if (mod.el.classList.contains('tech-node')) {
        // Tech nodes inherit from parent coordinates, so shift local styles
        mod.el.style.transform = `translate3d(${mod.x}px, ${mod.y}px, ${driftZ}px) rotateZ(${mod.rotZ}deg)`;
      } else {
        mod.el.style.transform = `translate3d(${mod.x}px, ${mod.y}px, ${driftZ}px) rotateX(${mod.rotX}deg) rotateY(${mod.rotY}deg) rotateZ(${mod.rotZ}deg)`;
      }
    });
    
    requestAnimationFrame(updatePhysics);
  }
  
  requestAnimationFrame(updatePhysics);
}

// ==========================================
// 3. DYNAMIC SVG CABLES CONNECTION
// ==========================================
function initCableConnections() {
  const cables = [
    { from: 'port-leetcode', to: 'port-core-left-top', core: 'cable-lc-core', bg: 'cable-lc-bg' },
    { from: 'port-gfg', to: 'port-core-left-mid', core: 'cable-gfg-core', bg: 'cable-gfg-bg' },
    { from: 'port-interns', to: 'port-core-left-bot', core: 'cable-interns-core', bg: 'cable-interns-bg' },
    { from: 'port-topcenter', to: 'port-core-top', core: 'cable-topcenter-core', bg: 'cable-topcenter-bg' },
    { from: 'port-codec', to: 'port-core-bottom', core: 'cable-codec-core', bg: 'cable-codec-bg' },
    { from: 'port-righttop', to: 'port-core-right-top', core: 'cable-rt-core', bg: 'cable-rt-bg' },
    { from: 'port-techcluster', to: 'port-core-right-mid', core: 'cable-nodes-core', bg: 'cable-nodes-bg' },
    { from: 'port-rightbottom', to: 'port-core-right-bot', core: 'cable-rb-core', bg: 'cable-rb-bg' }
  ];
  
  const svg = document.getElementById('cables-svg');
  
  function updateCables() {
    if (window.innerWidth <= 1100) {
      // Hide cables on mobile viewports
      cables.forEach(c => {
        document.getElementById(c.core).setAttribute('d', '');
        document.getElementById(c.bg).setAttribute('d', '');
      });
      return;
    }
    
    const svgRect = svg.getBoundingClientRect();
    
    cables.forEach((c) => {
      const fromEl = document.getElementById(c.from);
      const toEl = document.getElementById(c.to);
      const corePath = document.getElementById(c.core);
      const bgPath = document.getElementById(c.bg);
      
      if (!fromEl || !toEl || !corePath || !bgPath) return;
      
      const rFrom = fromEl.getBoundingClientRect();
      const rTo = toEl.getBoundingClientRect();
      
      // Find center coordinate relative to SVG container
      const x1 = rFrom.left + rFrom.width / 2 - svgRect.left;
      const y1 = rFrom.top + rFrom.height / 2 - svgRect.top;
      
      const x2 = rTo.left + rTo.width / 2 - svgRect.left;
      const y2 = rTo.top + rTo.height / 2 - svgRect.top;
      
      // Organic conduit logic (smooth S-curve bezier layout)
      const dx = Math.abs(x2 - x1);
      const cp1_x = x1 + (x2 > x1 ? dx * 0.4 : -dx * 0.4);
      const cp1_y = y1;
      const cp2_x = x2 + (x2 > x1 ? -dx * 0.4 : dx * 0.4);
      const cp2_y = y2;
      
      const pathData = `M ${x1} ${y1} C ${cp1_x} ${cp1_y}, ${cp2_x} ${cp2_y}, ${x2} ${y2}`;
      
      corePath.setAttribute('d', pathData);
      bgPath.setAttribute('d', pathData);
      
      // Ensure ports show as connected
      fromEl.classList.add('connected');
      toEl.classList.add('connected');
    });
  }
  
  // Synchronize with render frame to avoid stuttering
  function cableLoop() {
    updateCables();
    requestAnimationFrame(cableLoop);
  }
  
  requestAnimationFrame(cableLoop);
}

// // ==========================================
// 4. INTERACTIVE INFO MODAL SYSTEM
// ==========================================
const SECTION_DATA = {
  about: {
    title: 'SYS//EVALUATION: STUDENT DOSSIER',
    html: `
      <h4 class="modal-section-title">Cognitive S-System Evaluation</h4>
      <div class="parameter-eval-group">
        <div class="parameter-row">
          <span class="parameter-name">Algorithmic Aptitude (学力)</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="95"></div></div>
          <span class="parameter-grade">A</span>
        </div>
        <div class="parameter-row">
          <span class="parameter-name">System Adaptability (判断力)</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="92"></div></div>
          <span class="parameter-grade">A</span>
        </div>
        <div class="parameter-row">
          <span class="parameter-name">Execution Efficiency (身体能力)</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="96"></div></div>
          <span class="parameter-grade">A+</span>
        </div>
        <div class="parameter-row">
          <span class="parameter-name">Team Coordination (協調性)</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="84"></div></div>
          <span class="parameter-grade">B+</span>
        </div>
        <div class="parameter-row">
          <span class="parameter-name">Social Contribution (社会貢献性)</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="90"></div></div>
          <span class="parameter-grade">A</span>
        </div>
      </div>
      
      <h4 class="modal-section-title">Strategic Objective</h4>
      <p class="modal-text">"Driven by absolute algorithmic precision and high structural efficiency. Engineering premium full-stack architectures and mastering logical pathways under execution speed limits."</p>
      
      <div class="detail-card-cyber">
        <div class="detail-card-title">Full-Stack Architect</div>
        <p class="detail-card-desc">Constructing modular frontend systems using high-fidelity styling frameworks while establishing secure, decoupled backend server pipelines.</p>
      </div>
      <div class="detail-card-cyber">
        <div class="detail-card-title">Competitive Solver</div>
        <p class="detail-card-desc">Elite logical performance under extreme runtime constraints, specializing in complex DP traversals, graph trees, and computational math.</p>
      </div>
    `
  },
  leetcode: {
    title: 'SYS//EVALUATION: ALGORITHMIC APTITUDE',
    html: `
      <h4 class="modal-section-title">Algorithmic Performance</h4>
      <div class="parameter-eval-group">
        <div class="parameter-row">
          <span class="parameter-name">Logic Execution Speed</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="98"></div></div>
          <span class="parameter-grade">A+</span>
        </div>
        <div class="parameter-row">
          <span class="parameter-name">Global Contest Ranking</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="91"></div></div>
          <span class="parameter-grade">A</span>
        </div>
        <div class="parameter-row">
          <span class="parameter-name">Consistency Stream</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="84"></div></div>
          <span class="parameter-grade">B+</span>
        </div>
      </div>

      <h4 class="modal-section-title">LeetCode Archive &amp; Knight Status</h4>
      <p class="modal-text">Positioned among elite competitive programmers on LeetCode's active evaluation stream, testing logic structures against weekly global challenges.</p>
      
      <div class="detail-card-cyber">
        <div class="detail-card-title">0ms Latency Performance</div>
        <p class="detail-card-desc">Bypassing compiler standard overhead using tailored I/O setups to execute solutions at absolute hardware speed limits.</p>
        <div class="code-block-cyber">
          <span class="code-lang-label">C++</span>
          <span class="color-cpp-comment">// Advanced compiler binding optimize</span><br>
          <span class="color-cpp-keyword">auto</span> init = []() {<br>
          &nbsp;&nbsp;&nbsp;&nbsp;ios_base::<span class="color-cpp-type">sync_with_stdio</span>(<span class="color-cpp-val">false</span>);<br>
          &nbsp;&nbsp;&nbsp;&nbsp;cin.<span class="color-cpp-type">tie</span>(<span class="color-cpp-val">nullptr</span>);<br>
          &nbsp;&nbsp;&nbsp;&nbsp;<span class="color-cpp-keyword">return</span> <span class="color-cpp-val">0</span>;<br>
          }();
        </div>
      </div>
    `
  },
  gfg: {
    title: 'SYS//EVALUATION: LOGICAL CONSISTENCY',
    html: `
      <h4 class="modal-section-title">Rigor Evaluation</h4>
      <div class="parameter-eval-group">
        <div class="parameter-row">
          <span class="parameter-name">Independent Problem Solving</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="95"></div></div>
          <span class="parameter-grade">A</span>
        </div>
        <div class="parameter-row">
          <span class="parameter-name">Consistency Index</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="93"></div></div>
          <span class="parameter-grade">A</span>
        </div>
      </div>

      <h4 class="modal-section-title">GeeksforGeeks Metrics</h4>
      <p class="modal-text">Maintaining consistent execution metrics via self-driven logical pathways. Over 26 days of continuous daily algorithms logged without support interfaces.</p>
      
      <div class="detail-card-cyber">
        <div class="detail-card-title">Algorithmic Focus</div>
        <p class="detail-card-desc">Focusing on raw memory layouts, cache locality, traversal logic, recursion parameters, and custom pointer evaluations.</p>
      </div>
    `
  },
  internships: {
    title: 'SYS//EVALUATION: APPLIED ADAPTABILITY',
    html: `
      <h4 class="modal-section-title">Professional Parameters</h4>
      <div class="parameter-eval-group">
        <div class="parameter-row">
          <span class="parameter-name">Frontend Engineering Precision</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="94"></div></div>
          <span class="parameter-grade">A</span>
        </div>
        <div class="parameter-row">
          <span class="parameter-name">Backend API Integrity</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="88"></div></div>
          <span class="parameter-grade">A-</span>
        </div>
      </div>

      <h4 class="modal-section-title">Professional Operations Timeline</h4>
      
      <div class="detail-card-cyber">
        <div class="detail-card-title">CodeAlpha | Frontend Developer Intern</div>
        <p class="detail-card-desc">Crafted high-fidelity graphical user layouts, CSS rendering mechanics, and JS interaction threads to eliminate screen stuttering.</p>
        <div class="detail-card-meta">Stack: HTML5, CSS3, JS (ES6), Transform Mechanics</div>
      </div>
      
      <div class="detail-card-cyber">
        <div class="detail-card-title">InternBoot | Full-Stack Virtual Intern</div>
        <p class="detail-card-desc">Architected robust, relational backends and linked visual layout inputs to clean REST API routing endpoints.</p>
        <div class="detail-card-meta">Stack: Node.js, Express, Relational Schemas, Integrations</div>
      </div>
    `
  },
  challenge: {
    title: 'SYS//CALENDAR: S-SYSTEM METRICS',
    html: `
      <h4 class="modal-section-title">Continuous Optimization Tracker</h4>
      <p class="modal-text">Monitoring daily submission metrics across active development pipelines. Submissions synchronize and trace automatically.</p>
      
      <div class="challenge-grid-cyber">
        <div class="challenge-day completed"><div class="day-num">D1</div><div class="day-status">0ms</div></div>
        <div class="challenge-day completed"><div class="day-num">D2</div><div class="day-status">0ms</div></div>
        <div class="challenge-day completed"><div class="day-num">D3</div><div class="day-status">0ms</div></div>
        <div class="challenge-day completed"><div class="day-num">D4</div><div class="day-status">0ms</div></div>
        <div class="challenge-day completed"><div class="day-num">D5</div><div class="day-status">0ms</div></div>
        <div class="challenge-day completed"><div class="day-num">D6</div><div class="day-status">0ms</div></div>
        <div class="challenge-day completed"><div class="day-num">D7</div><div class="day-status">0ms</div></div>
        <div class="challenge-day completed"><div class="day-num">D8</div><div class="day-status">0ms</div></div>
        <div class="challenge-day completed"><div class="day-num">D9</div><div class="day-status">0ms</div></div>
        <div class="challenge-day completed"><div class="day-num">D10</div><div class="day-status">0ms</div></div>
        <div class="challenge-day completed"><div class="day-num">D11</div><div class="day-status">0ms</div></div>
        <div class="challenge-day completed"><div class="day-num">D12</div><div class="day-status">0ms</div></div>
      </div>
      
      <p class="modal-text" style="margin-top: 15px; font-size: 10px; color: var(--text-muted);">* Logged and verified by Tokyo Metropolitan Advanced Nurturing Database API.</p>
    `
  },
  codec: {
    title: 'SYS//EVALUATION: TACTICAL OPERATION',
    html: `
      <h4 class="modal-section-title">Collaboration Parameters</h4>
      <div class="parameter-eval-group">
        <div class="parameter-row">
          <span class="parameter-name">System Stability Control</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="92"></div></div>
          <span class="parameter-grade">A</span>
        </div>
        <div class="parameter-row">
          <span class="parameter-name">Version Control Compliance</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="94"></div></div>
          <span class="parameter-grade">A</span>
        </div>
      </div>

      <h4 class="modal-section-title">Codec Technology Virtual Internship</h4>
      <div class="detail-card-cyber">
        <div class="detail-card-title">Enterprise-Level Solutions</div>
        <p class="detail-card-desc">Collaborated on simulated production cycles, training under standard version-control branching protocols, code audits, and responsive visual layout integration.</p>
        <div class="detail-card-meta">Focus: Collaborative Integration, UI Refinements &amp; Code Quality</div>
      </div>
    `
  },
  idportfolio: {
    title: 'SYS//PROJECT: DIGITAL STUDENT CARD',
    html: `
      <h4 class="modal-section-title">Applied Parameters</h4>
      <div class="parameter-eval-group">
        <div class="parameter-row">
          <span class="parameter-name">3D CSS Matrix Calculations</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="98"></div></div>
          <span class="parameter-grade">A+</span>
        </div>
        <div class="parameter-row">
          <span class="parameter-name">Viewport Rendering Speed</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="94"></div></div>
          <span class="parameter-grade">A</span>
        </div>
      </div>

      <h4 class="modal-section-title">Interactive ID Portfolio Architecture</h4>
      <p class="modal-text">A custom digital representation of student ID cards using 3D perspective transforms, dynamic shadows, and scanlines to mimic tactile physical objects.</p>
      
      <div class="detail-card-cyber">
        <div class="detail-card-title">Aesthetic Engineering</div>
        <p class="detail-card-desc">Responsive layouts with zero visual shift under resize events, leveraging fluid viewport mechanics and hardware-accelerated CSS rendering.</p>
      </div>
    `
  },
  projects: {
    title: 'SYS//PROJECTS: FEATURED SYSTEMS',
    html: `
      <h4 class="modal-section-title">Systems Engineering Dossier</h4>
      
      <div class="detail-card-cyber">
        <div class="detail-card-title">1. Advanced Nurturing Evaluation Database (COE)</div>
        <p class="detail-card-desc">The active dashboard: integrating zero-gravity physics, 3D pointer tilts, custom matrix canvas particle rain, and text decryption models.</p>
        <div class="detail-card-meta">Stack: HTML5, CSS3, JavaScript, SVG Paths, Canvas API</div>
      </div>
      
      <div class="detail-card-cyber">
        <div class="detail-card-title">2. Multi-Step Diagnostic Quiz Engine</div>
        <p class="detail-card-desc">Constructed state tracking engines that monitor student parameters through branching validation pathways with custom interactive results charts.</p>
        <div class="detail-card-meta">Stack: JS (ES6 State Machine), CSS Transitions, HTML5</div>
      </div>
    `
  },
  
  // Tech Nodes cluster information
  languages: {
    title: 'SYS//SKILLS: COMPILER FLUENCY',
    html: `
      <h4 class="modal-section-title">Language Fluency Evaluation</h4>
      <div class="parameter-eval-group">
        <div class="parameter-row">
          <span class="parameter-name">C / C++ (High Performance)</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="96"></div></div>
          <span class="parameter-grade">A+</span>
        </div>
        <div class="parameter-row">
          <span class="parameter-name">Java (OOP Architecture)</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="91"></div></div>
          <span class="parameter-grade">A</span>
        </div>
        <div class="parameter-row">
          <span class="parameter-name">JavaScript (Web Interactions)</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="93"></div></div>
          <span class="parameter-grade">A</span>
        </div>
      </div>
      
      <p class="modal-text">Operating directly with pointer mechanics and fast data structures in C++ while designing modular applications with Java and Javascript.</p>
    `
  },
  dsa1: {
    title: 'SYS//SKILLS: DATA STRUCTURES',
    html: `
      <h4 class="modal-section-title">Data Storage Competency</h4>
      <div class="parameter-eval-group">
        <div class="parameter-row">
          <span class="parameter-name">Linear (Vectors, Stack, Queue)</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="95"></div></div>
          <span class="parameter-grade">A+</span>
        </div>
        <div class="parameter-row">
          <span class="parameter-name">Non-Linear (BST, Heap, Trie)</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="90"></div></div>
          <span class="parameter-grade">A</span>
        </div>
      </div>
      <p class="modal-text">Managing operational complexity through logical mapping. Resolving lookup parameters using self-balancing trees and optimized hashing tables.</p>
    `
  },
  dsa2: {
    title: 'SYS//SKILLS: STRATEGY & ALGORITHMS',
    html: `
      <h4 class="modal-section-title">Optimisation Metrics</h4>
      <div class="parameter-eval-group">
        <div class="parameter-row">
          <span class="parameter-name">Dynamic Programming (DP)</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="92"></div></div>
          <span class="parameter-grade">A</span>
        </div>
        <div class="parameter-row">
          <span class="parameter-name">Graph Algorithms (Tarjan, SPF)</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="94"></div></div>
          <span class="parameter-grade">A</span>
        </div>
      </div>
      <p class="modal-text">Resolving multi-decision optimization grids and routing parameters under minimal time scaling factors.</p>
    `
  },
  ml: {
    title: 'SYS//SKILLS: APPLIED MACHINE LEARNING',
    html: `
      <h4 class="modal-section-title">Statistical Capability</h4>
      <div class="parameter-eval-group">
        <div class="parameter-row">
          <span class="parameter-name">Supervised Classifiers</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="87"></div></div>
          <span class="parameter-grade">B+</span>
        </div>
        <div class="parameter-row">
          <span class="parameter-name">Data Pipeline Preprocessing</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="85"></div></div>
          <span class="parameter-grade">B+</span>
        </div>
      </div>
      <p class="modal-text">Constructing statistical decision trees, regression logic, features dimensionality reductions, and classification engines.</p>
    `
  },
  jlpt: {
    title: 'SYS//SKILLS: GLOBAL SYNERGY',
    html: `
      <h4 class="modal-section-title">Language Fluency (JLPT N5)</h4>
      <div class="parameter-eval-group">
        <div class="parameter-row">
          <span class="parameter-name">Japanese Kana Fluency</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="98"></div></div>
          <span class="parameter-grade">A+</span>
        </div>
        <div class="parameter-row">
          <span class="parameter-name">Kanji Vocabulary Base</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="90"></div></div>
          <span class="parameter-grade">A</span>
        </div>
        <div class="parameter-row">
          <span class="parameter-name">Grammar Particles (は, が, を)</span>
          <div class="parameter-bar-container"><div class="parameter-bar-fill" data-width="85"></div></div>
          <span class="parameter-grade">B+</span>
        </div>
      </div>
      
      <h4 class="modal-section-title">Tokyo Business Link</h4>
      <p class="modal-text">Fusing technical software architecture fluency with the Japanese business culture to bridge software collaboration channels to Tokyo and Yokohama.</p>
    `
  }
};

// ==========================================
// Text Scramble Animation Utility
// ==========================================
class TextScrambler {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________0123456789';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameId);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameId = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

function initModalSystem() {
  const modal = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.getElementById('modal-close');
  
  // Attach event listener to all floating modules with data-section
  document.querySelectorAll('.floating-module').forEach((mod) => {
    mod.addEventListener('click', (e) => {
      // Prevent double triggers inside tech cluster
      if (mod.id === 'node-techcluster') return;
      
      const sec = mod.getAttribute('data-section');
      if (sec && SECTION_DATA[sec]) {
        openModal(sec);
      }
    });
  });
  
  // Attach event listener to individual tech capabilities inside the cluster
  document.querySelectorAll('.cap-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation(); // Stop parent node-techcluster click
      const tech = item.getAttribute('data-tech');
      if (tech && SECTION_DATA[tech]) {
        openModal(tech);
      }
    });
  });
  
  // Close buttons
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // Escape key close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
  
  function openModal(sectionKey) {
    const data = SECTION_DATA[sectionKey];
    modalBody.innerHTML = data.html;
    modal.classList.add('active');
    
    // Animate Title Decryption Scramble
    modalTitle.textContent = '';
    const scrambler = new TextScrambler(modalTitle);
    scrambler.setText(data.title);
    
    // Animate Evaluation Progress Bars with delay so they trigger smoothly
    setTimeout(() => {
      const fills = modalBody.querySelectorAll('.parameter-bar-fill');
      fills.forEach(fill => {
        const w = fill.getAttribute('data-width');
        fill.style.width = w + '%';
      });
    }, 150);
  }
  function closeModal() {
    modal.classList.remove('active');
  }
}

// ==========================================
// 5. WEB AUDIO CYBER CLICK SYNTHESIZER
// ==========================================
let audioCtx = null;

function playClickSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Resume audio context if suspended (browser security autoplay policy)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    // 1. High-frequency switch tap transient
    const oscTap = audioCtx.createOscillator();
    const gainTap = audioCtx.createGain();
    oscTap.connect(gainTap);
    gainTap.connect(audioCtx.destination);
    
    const tapFreq = 1300 + Math.random() * 300;
    oscTap.type = 'sine';
    oscTap.frequency.setValueAtTime(tapFreq, audioCtx.currentTime);
    
    gainTap.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gainTap.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    
    oscTap.start(audioCtx.currentTime);
    oscTap.stop(audioCtx.currentTime + 0.04);
    
    // 2. Low-frequency mechanical bottom-out thump
    const oscBottom = audioCtx.createOscillator();
    const gainBottom = audioCtx.createGain();
    oscBottom.connect(gainBottom);
    gainBottom.connect(audioCtx.destination);
    
    const bottomFreq = 160 + Math.random() * 40;
    oscBottom.type = 'triangle';
    oscBottom.frequency.setValueAtTime(bottomFreq, audioCtx.currentTime);
    
    gainBottom.gain.setValueAtTime(0.07, audioCtx.currentTime);
    gainBottom.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
    
    oscBottom.start(audioCtx.currentTime);
    oscBottom.stop(audioCtx.currentTime + 0.03);
    
  } catch (err) {
    console.warn("Web Audio initialization blocked or unsupported:", err);
  }
}

// Bind audio context initiation and click playback to document events
document.addEventListener('click', playClickSound);
document.addEventListener('keydown', playClickSound);

// ==========================================
// 6. 3D ROTATING HUD AVATAR MODAL HANDLERS
// ==========================================
function initAvatarHudModal() {
  const photo = document.querySelector('.id-photo-container');
  const hudModal = document.getElementById('avatar-hud-modal');
  const hudClose = document.getElementById('hud-close-btn');
  
  if (photo && hudModal) {
    photo.addEventListener('click', (e) => {
      e.stopPropagation(); // Stop parent node-righttop card click
      hudModal.classList.add('active');
    });
  }
  
  if (hudClose && hudModal) {
    hudClose.addEventListener('click', () => {
      hudModal.classList.remove('active');
    });
    
    hudModal.addEventListener('click', (e) => {
      if (e.target === hudModal) hudModal.classList.remove('active');
    });
  }
  
  // Link 3D HUD skill panels to their respective detailed dossiers
  document.querySelectorAll('.hud-skill-panel').forEach(panel => {
    panel.addEventListener('click', (e) => {
      e.stopPropagation();
      const tech = panel.getAttribute('data-tech');
      
      // Select the global openModal function inside app.js if accessible
      // Since openModal is inside initModalSystem closure, we can trigger a click on the actual cap-item in the capabilities card!
      if (tech) {
        const targetCapItem = document.querySelector(`.cap-item[data-tech="${tech}"]`);
        if (targetCapItem) {
          hudModal.classList.remove('active');
          setTimeout(() => {
            targetCapItem.click(); // Trigger click on cap-item to open the detailed modal!
          }, 350);
        }
      }
    });
  });
}
