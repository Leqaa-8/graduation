const IMG_W = 1024;
const IMG_H = 1536;

const SEAL = { cx: 0.515, cy: 0.583, w: 0.08, h: 0.055 };
const TEXT = { cx: 0.50,  cy: 0.798, w: 0.16, h: 0.025 };

let isTransitioning = false;
let bgMusic         = null;
let soundBtn        = null;
let musicStarted    = false;

// ── Audio ─────────────────────────────────────────────────────────────────────

function startMusic() {
  if (musicStarted || !bgMusic) return;
  musicStarted = true;
  bgMusic.volume = 0.45;
  bgMusic.play().catch(function (err) {
    console.warn('Audio playback could not start:', err);
  });
}

// ── Overlay positioning ──────────────────────────────────────────────────────

function positionOverlays() {
  const container = document.querySelector('.image-container');
  if (!container) return;

  const cw = container.clientWidth;
  const ch = container.clientHeight;

  const scale = Math.max(cw / IMG_W, ch / IMG_H);
  const dispW  = IMG_W * scale;
  const dispH  = IMG_H * scale;
  const cropX  = (dispW - cw) / 2;
  const cropY  = (dispH - ch) / 2;

  function place(el, item, offsetY = 0) {
    const cx = item.cx * IMG_W * scale - cropX;
    const cy = item.cy * IMG_H * scale - cropY;
    const w  = item.w  * IMG_W * scale;
    const h  = item.h  * IMG_H * scale;

    el.style.left   = (cx - w / 2) + 'px';
    el.style.top    = (cy - h / 2 + offsetY) + 'px';
    el.style.width  = w + 'px';
    el.style.height = h + 'px';
  }

  place(document.getElementById('sealArea'), SEAL, -32);
  place(document.getElementById('textArea'), TEXT);
}

// ── Transition ───────────────────────────────────────────────────────────────

function openInvitation() {
  if (isTransitioning) return;
  isTransitioning = true;

  const seal  = document.getElementById('sealArea');
  const page1 = document.getElementById('page1');
  const page2 = document.getElementById('page2');

  // Step 1 (0 ms): seal scales up, glows, fades; music starts
  seal.classList.add('seal-pulse');
  startMusic();

  // Step 2 (150 ms): page 1 zooms and blurs out
  setTimeout(() => {
    page1.classList.add('page-exit');
  }, 150);

  // Step 3 (720 ms): page 2 rises and fades in; text stagger begins
  setTimeout(() => {
    page2.classList.add('page-enter-active', 'text-revealed');
  }, 720);

  // Step 4 (1450 ms): settle final states, re-enable interaction
  setTimeout(() => {
    // Tear down page 1
    page1.classList.remove('active', 'page-exit');
    seal.classList.remove('seal-pulse');

    // Activate page 2 (opacity:1, pointer-events:all via .active)
    page2.classList.remove('page-enter-active');
    page2.classList.add('active');

    // Unlock scrolling so the user can reach the date section
    document.body.classList.add('unlocked');

    // Reveal sound button now that the transition has settled
    if (soundBtn) soundBtn.classList.add('visible');

    isTransitioning = false;
  }, 1450);
}

// ── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  const img = document.querySelector('.image-container img');
  const video = document.querySelector('.page2-video');
  video.playbackRate = 0.65;

  if (img.complete) {
    positionOverlays();
  } else {
    img.addEventListener('load', positionOverlays);
  }

  window.addEventListener('resize', positionOverlays);
  window.addEventListener('orientationchange', positionOverlays);

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', positionOverlays);
  }

  document.getElementById('sealArea').addEventListener('click', openInvitation);
  document.getElementById('textArea').addEventListener('click', openInvitation);

  // Date section entrance — runs once when the section enters the viewport
  const dateSection = document.getElementById('date-section');
  if (dateSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          dateSection.classList.add('in-view');
          observer.unobserve(dateSection);
        }
      });
    }, { threshold: 0.15 });
    observer.observe(dateSection);
  }

  // ── Countdown ────────────────────────────────────────────────────────────────

  const GRADUATION_TARGET = new Date('2026-08-20T00:00:00');
  let cdInterval = null;

  function cdPad(n) {
    return String(Math.max(0, Math.floor(n))).padStart(2, '0');
  }

  function flipNum(el, newStr) {
    if (!el || el.textContent === newStr) return;

    // Slide current number up and out
    el.classList.remove('num-in');
    el.classList.add('num-out');

    setTimeout(function () {
      el.textContent = newStr;
      el.classList.remove('num-out');
      el.classList.add('num-in');
      setTimeout(function () { el.classList.remove('num-in'); }, 240);
    }, 165);
  }

  function cdTick() {
    const diff = GRADUATION_TARGET.getTime() - Date.now();

    if (diff <= 0) {
      ['cd-days', 'cd-hours', 'cd-minutes', 'cd-seconds'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '00';
      });
      clearInterval(cdInterval);
      return;
    }

    flipNum(document.getElementById('cd-days'),    cdPad(Math.floor(diff / 86400000)));
    flipNum(document.getElementById('cd-hours'),   cdPad(Math.floor((diff % 86400000) / 3600000)));
    flipNum(document.getElementById('cd-minutes'), cdPad(Math.floor((diff % 3600000)  / 60000)));
    flipNum(document.getElementById('cd-seconds'), cdPad(Math.floor((diff % 60000)    / 1000)));
  }

  // Entrance observer for countdown section
  const cdSection = document.getElementById('countdown-section');
  if (cdSection && 'IntersectionObserver' in window) {
    const cdObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        cdSection.classList.add('in-view');
        cdObs.unobserve(cdSection);
      }
    }, { threshold: 0.1 });
    cdObs.observe(cdSection);
  }

  // Start the countdown immediately so numbers show from first render
  cdTick();
  cdInterval = setInterval(cdTick, 1000);

  // ── Venue Section entrance ───────────────────────────────────────────────────

  const venueSection = document.getElementById('venue-section');
  if (venueSection && 'IntersectionObserver' in window) {
    const venueObs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        venueSection.classList.add('in-view');
        venueObs.unobserve(venueSection);
      }
    }, { threshold: 0.1 });
    venueObs.observe(venueSection);
  }

  // ── Scroll Indicators ────────────────────────────────────────────────────────

  const siPage2     = document.getElementById('page2');
  const siDate      = document.getElementById('date-section');
  const siCountdown = document.getElementById('countdown-section');

  // Sections managed by IntersectionObserver (date + countdown).
  // Page2 is handled separately because its indicator must wait for the unlock.
  const siObservedSections = [siDate, siCountdown].filter(Boolean);

  // Track the currently-in-view set and scrolling state.
  const siInView = new Set();
  let siIsScrolling = false;
  let siScrollTimer;

  function siShow(section) {
    const ind = section && section.querySelector('.scroll-indicator');
    if (ind) ind.classList.add('si-visible');
  }

  function siHide(section) {
    const ind = section && section.querySelector('.scroll-indicator');
    if (ind) ind.classList.remove('si-visible');
  }

  function siHideAll() {
    [siPage2, siDate, siCountdown].forEach(siHide);
  }

  // Intersection observer for date + countdown sections.
  const siObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        siInView.add(entry.target);
        if (!siIsScrolling) siShow(entry.target);
      } else {
        siInView.delete(entry.target);
        siHide(entry.target);
      }
    });
  }, { threshold: 0.75 });

  siObservedSections.forEach(function (s) { siObs.observe(s); });

  // Page2 indicator appears only after the invitation opens.
  // Watch for `body.unlocked` being added, then check visibility.
  const siUnlockObs = new MutationObserver(function () {
    if (!document.body.classList.contains('unlocked')) return;
    siUnlockObs.disconnect();
    // Page2 is in view right after unlock; show after transition settles.
    if (siPage2) {
      siInView.add(siPage2);
      setTimeout(function () {
        if (!siIsScrolling) siShow(siPage2);
      }, 480);
    }
  });
  siUnlockObs.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  // ── Audio & Sound Toggle ──────────────────────────────────────────────────

  bgMusic  = document.getElementById('backgroundMusic');
  soundBtn = document.getElementById('soundToggle');

  function updateSoundIcon() {
    var iconOn  = soundBtn.querySelector('.icon-sound-on');
    var iconOff = soundBtn.querySelector('.icon-sound-off');
    if (bgMusic.muted) {
      iconOn.style.display  = 'none';
      iconOff.style.display = '';
      soundBtn.setAttribute('aria-label', 'تشغيل الموسيقى');
    } else {
      iconOn.style.display  = '';
      iconOff.style.display = 'none';
      soundBtn.setAttribute('aria-label', 'كتم الموسيقى');
    }
  }

  soundBtn.addEventListener('click', function () {
    bgMusic.muted = !bgMusic.muted;
    updateSoundIcon();
  });

  // Resume if mobile Safari auto-paused the track when tab was backgrounded
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && musicStarted && bgMusic.paused) {
      bgMusic.play().catch(function (err) {
        console.warn('Audio resume failed:', err);
      });
    }
  });

  // Hide all indicators the moment the user scrolls; restore after they stop.
  window.addEventListener('scroll', function () {
    siIsScrolling = true;
    siHideAll();
    clearTimeout(siScrollTimer);
    siScrollTimer = setTimeout(function () {
      siIsScrolling = false;
      siInView.forEach(function (s) { siShow(s); });
    }, 200);
  }, { passive: true });
});
