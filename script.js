const IMG_W = 1024;
const IMG_H = 1536;

const SEAL = { cx: 0.515, cy: 0.583, w: 0.08, h: 0.055 };
const TEXT = { cx: 0.50,  cy: 0.798, w: 0.16, h: 0.025 };

let isTransitioning = false;

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

  // Step 1 (0 ms): seal scales up, glows, fades
  seal.classList.add('seal-pulse');

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

    isTransitioning = false;
  }, 1450);
}

// ── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  const img = document.querySelector('.image-container img');

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
});
