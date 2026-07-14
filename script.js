const IMG_W = 1024;
const IMG_H = 1536;

// Positions in the original image (as fractions of IMG_W / IMG_H)
const SEAL = { cx: 0.515, cy: 0.583, w: 0.08, h: 0.055 };
const TEXT = { cx: 0.50,  cy: 0.798, w: 0.16, h: 0.025 };

function positionOverlays() {
  const container = document.querySelector('.image-container');
  if (!container) return;

  const cw = container.clientWidth;
  const ch = container.clientHeight;

  // Same scale object-fit: cover uses
  const scale = Math.max(cw / IMG_W, ch / IMG_H);

  const dispW = IMG_W * scale;
  const dispH = IMG_H * scale;

  // How much of the scaled image is hidden on each side
  const cropX = (dispW - cw) / 2;
  const cropY = (dispH - ch) / 2;

  function place(el, item, offsetY = 0) {
    // Convert image-space center to screen-space center
    const cx = item.cx * IMG_W * scale - cropX;
    const cy = item.cy * IMG_H * scale - cropY;
    // Convert image-space size to screen-space size
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

function openInvitation() {
  document.getElementById('page1').classList.remove('active');
  document.getElementById('page2').classList.add('active');
}

document.addEventListener('DOMContentLoaded', function () {
  const img = document.querySelector('.image-container img');

  // Position as soon as the image is ready
  if (img.complete) {
    positionOverlays();
  } else {
    img.addEventListener('load', positionOverlays);
  }

  window.addEventListener('resize', positionOverlays);
  window.addEventListener('orientationchange', positionOverlays);
  // Safari fires this when the toolbar collapses / expands
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', positionOverlays);
  }

  document.getElementById('sealArea').addEventListener('click', openInvitation);
  document.getElementById('textArea').addEventListener('click', openInvitation);
});
