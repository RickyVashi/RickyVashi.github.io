/* ===========================
   RICKY VASHI — PORTFOLIO JS
   =========================== */

// ===== THEME TOGGLE =====
(function initTheme() {
  const saved = localStorage.getItem('rv-theme') || 'dark';
  if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
})();

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('rv-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('rv-theme', 'light');
    }
  });
});

// ===== LOADER =====
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const fill = document.querySelector('.loader-fill');
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18 + 8;
    if (progress >= 100) { progress = 100; clearInterval(interval); }
    fill.style.width = progress + '%';
    if (progress === 100) {
      setTimeout(() => {
        loader.classList.add('hidden');
        initHeroAnimations();
      }, 350);
    }
  }, 80);
});

// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursor-follower');
let fX = 0, fY = 0, cX = window.innerWidth / 2, cY = window.innerHeight / 2;

document.addEventListener('mousemove', e => {
  cX = e.clientX; cY = e.clientY;
  cursor.style.left = cX + 'px';
  cursor.style.top = cY + 'px';
});

function animateCursor() {
  fX += (cX - fX) * 0.1;
  fY += (cY - fY) * 0.1;
  cursorFollower.style.left = fX + 'px';
  cursorFollower.style.top = fY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .proj-card, .skills-cat, .social-btn, .soc-link, .back-top, .edu-card, .tl-card, .theme-toggle').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ===== THREE.JS HERO BACKGROUND =====
function initHero3D() {
  const canvas = document.getElementById('heroCanvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  camera.position.z = 22;

  // Floating dots
  const N = 110;
  const ptPos = new Float32Array(N * 3);
  const vel   = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    ptPos[i*3]   = (Math.random() - 0.5) * 46;
    ptPos[i*3+1] = (Math.random() - 0.5) * 28;
    ptPos[i*3+2] = (Math.random() - 0.5) * 6;
    vel[i*3]     = (Math.random() - 0.5) * 0.006;
    vel[i*3+1]   = (Math.random() - 0.5) * 0.004;
  }
  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPos, 3));
  scene.add(new THREE.Points(ptGeo, new THREE.PointsMaterial({
    size: 0.08, color: 0x7c6fff, transparent: true, opacity: 0.55
  })));

  // Constellation lines between nearby dots
  const maxPairs = N * (N - 1) / 2;
  const linePos  = new Float32Array(maxPairs * 6);
  const lineGeo  = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  const lineSegs = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
    color: 0x7c6fff, transparent: true, opacity: 0.1
  }));
  scene.add(lineSegs);

  // Subtle wireframe icosahedron in background
  const sphere = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(11, 1)),
    new THREE.LineBasicMaterial({ color: 0x7c6fff, transparent: true, opacity: 0.03 })
  );
  scene.add(sphere);

  let mX = 0, mY = 0;
  window.addEventListener('mousemove', e => {
    mX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mY = (e.clientY / window.innerHeight - 0.5) * 1.2;
  });

  let t = 0;
  const DIST2 = 81; // connect dots within 9 units
  function animate() {
    requestAnimationFrame(animate);
    t += 0.003;

    for (let i = 0; i < N; i++) {
      ptPos[i*3]   += vel[i*3];
      ptPos[i*3+1] += vel[i*3+1];
      if (ptPos[i*3]   >  23 || ptPos[i*3]   < -23) vel[i*3]   *= -1;
      if (ptPos[i*3+1] >  14 || ptPos[i*3+1] < -14) vel[i*3+1] *= -1;
    }
    ptGeo.attributes.position.needsUpdate = true;

    let li = 0;
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = ptPos[i*3] - ptPos[j*3];
        const dy = ptPos[i*3+1] - ptPos[j*3+1];
        if (dx*dx + dy*dy < DIST2) {
          linePos[li*6]   = ptPos[i*3];   linePos[li*6+1] = ptPos[i*3+1]; linePos[li*6+2] = 0;
          linePos[li*6+3] = ptPos[j*3];   linePos[li*6+4] = ptPos[j*3+1]; linePos[li*6+5] = 0;
          li++;
        }
      }
    }
    lineGeo.setDrawRange(0, li * 2);
    lineGeo.attributes.position.needsUpdate = true;

    sphere.rotation.x = t * 0.04;
    sphere.rotation.y = t * 0.07;

    camera.position.x += (mX * 1.8 - camera.position.x) * 0.04;
    camera.position.y += (-mY * 1.2 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const hero = document.getElementById('hero');
    camera.aspect = hero.offsetWidth / hero.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(hero.offsetWidth, hero.offsetHeight);
  });
}
initHero3D();

// ===== HERO COUNTER ANIMATIONS =====
function initHeroAnimations() {
  document.querySelectorAll('.stat-n').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const isFloat = target % 1 !== 0;
    let start = 0;
    const duration = 1800;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = isFloat ? (eased * target).toFixed(2) : Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = isFloat ? target.toFixed(2) : target;
    };
    requestAnimationFrame(step);
  });
}

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
  updateActiveNav();
}, { passive: true });

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 130) current = s.id;
  });
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.section === current);
  });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ===== HAMBURGER =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
function closeMobile() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
}

// ===== SKILL PERCENTAGE LABELS =====
document.querySelectorAll('.skill-item').forEach(item => {
  const fill = item.querySelector('.skill-fill');
  const label = item.querySelector('span');
  if (!fill || !label || label.parentElement.classList.contains('skill-item-header')) return;
  const w = fill.dataset.w;
  if (!w) return;
  const header = document.createElement('div');
  header.className = 'skill-item-header';
  const pct = document.createElement('span');
  pct.className = 'skill-pct';
  pct.textContent = w + '%';
  header.appendChild(label.cloneNode(true));
  header.appendChild(pct);
  label.replaceWith(header);
});

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

// ===== SKILL BARS =====
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach(fill => {
        setTimeout(() => { fill.style.width = fill.dataset.w + '%'; }, 180);
      });
    }
  });
}, { threshold: 0.25 });
document.querySelectorAll('.skills-cat').forEach(c => skillObserver.observe(c));

// ===== PROJECT CARD CLICKS =====
document.querySelectorAll('.proj-card[data-href]').forEach(card => {
  card.addEventListener('click', () => window.open(card.dataset.href, '_blank'));
});

// ===== CONTACT FORM =====
function handleFormSubmit(e) {
  e.preventDefault();
  const btn = document.querySelector('.form-submit');
  const note = document.getElementById('formNote');
  btn.textContent = 'Sending…';
  btn.style.opacity = '0.7';
  setTimeout(() => {
    btn.textContent = 'Message Sent ✓';
    btn.style.background = 'var(--accent2)';
    note.textContent = "Thanks! Ricky will get back to you soon.";
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      btn.style.opacity = '';
      note.textContent = '';
      e.target.reset();
    }, 4000);
  }, 1200);
}

// ===== CARD TILT ON HOVER =====
document.querySelectorAll('.proj-card, .tl-card, .edu-card, .award-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const baseY = card.classList.contains('proj-card') ? -6 : card.classList.contains('tl-card') ? 0 : -4;
    const baseX = card.classList.contains('tl-card') ? 6 : card.classList.contains('award-card') ? 4 : 0;
    if (card.classList.contains('tl-card') || card.classList.contains('award-card')) {
      card.style.transform = `translateX(${baseX}px) perspective(600px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
    } else {
      card.style.transform = `translateY(${baseY}px) perspective(600px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    }
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// ===== HERO NAME SUBTLE GLITCH =====
const heroName = document.querySelector('.hero-name');
if (heroName) {
  setInterval(() => {
    heroName.style.filter = 'blur(0.8px)';
    setTimeout(() => { heroName.style.filter = ''; }, 70);
  }, 7000);
}

// ===== FLOATING DOTS (about section) =====
(function floatingBg() {
  const about = document.getElementById('about');
  if (!about) return;
  for (let i = 0; i < 20; i++) {
    const dot = document.createElement('div');
    const size = Math.random() * 3 + 1;
    dot.style.cssText = `
      position:absolute; border-radius:50%; pointer-events:none;
      width:${size}px; height:${size}px;
      background:rgba(124,111,255,${Math.random() * 0.2 + 0.04});
      left:${Math.random() * 100}%; top:${Math.random() * 100}%;
      animation:floatDot ${Math.random() * 9 + 7}s ease-in-out ${Math.random() * 4}s infinite alternate;
    `;
    about.appendChild(dot);
  }
})();

const styleTag = document.createElement('style');
styleTag.textContent = `
@keyframes floatDot {
  from { transform: translateY(0) translateX(0); opacity: 0.3; }
  to { transform: translateY(-28px) translateX(12px); opacity: 0.85; }
}
`;
document.head.appendChild(styleTag);

// ===== TYPED ROLE EFFECT =====
const role = document.querySelector('.hero-role');
if (role) {
  const lines = [
    'Full-Stack Developer · M.Tech Gold Medalist · Surat, India',
    'React · Vue · Node.js · Blockchain Enthusiast',
    'Building scalable, elegant web applications',
    'M.Tech @ Nirma University · 2× Gold Medalist',
  ];
  let lineIdx = 0, charIdx = 0, deleting = false;
  function typeStep() {
    const current = lines[lineIdx];
    if (!deleting) {
      charIdx++;
      role.textContent = current.slice(0, charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(typeStep, 2400);
        return;
      }
    } else {
      charIdx--;
      role.textContent = current.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        lineIdx = (lineIdx + 1) % lines.length;
      }
    }
    setTimeout(typeStep, deleting ? 26 : 44);
  }
  setTimeout(typeStep, 1800);
}
