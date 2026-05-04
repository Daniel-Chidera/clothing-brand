const cartStyle = document.createElement('style');
cartStyle.textContent = `.cart-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(12px);background:#111;color:#fff;padding:12px 24px;border-radius:8px;font-size:13px;font-weight:500;opacity:0;transition:opacity .3s,transform .3s;z-index:9999;white-space:nowrap}.cart-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}.wishlist-btn.wishlisted svg{fill:#ef4444;stroke:#ef4444}`;
document.head.appendChild(cartStyle);

function addToCart(name) {
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    badge.textContent = parseInt(badge.textContent || 0) + 1;
    badge.style.transform = 'scale(1.4)';
    setTimeout(() => badge.style.transform = '', 200);
  }
  const toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.textContent = `${name} added to bag`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

document.addEventListener('click', e => {
  const btn = e.target.closest('.add-to-bag-btn');
  if (btn) {
    addToCart(btn.dataset.name);
    return;
  }
  const wl = e.target.closest('.wishlist-btn');
  if (wl) wl.classList.toggle('wishlisted');
});