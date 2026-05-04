const header = document.querySelector('.site-header');
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
let cartCount = 0;

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open');
  document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
});

mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  }
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); observer.unobserve(e.target); } });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (badge) { badge.textContent = cartCount; badge.style.transform = 'scale(1.4)'; setTimeout(() => badge.style.transform = '', 200); }
}

function addToCart(name) {
  cartCount++;
  updateCartBadge();
  const toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.textContent = `${name} added to bag`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2200);
}

function productCard(p) {
  const sale = p.price < p.original_price;
  return `<article class="product-card reveal">
    <div class="product-img-wrap">
      <img class="primary-img" src="${p.image}" alt="${p.name}" loading="lazy">
      <img class="hover-img" src="${p.hover_image}" alt="${p.name}" loading="lazy">
      <span class="product-badge">${p.badge}</span>
      <div class="product-actions">
        <button class="add-to-bag-btn" data-name="${p.name}">Add to bag</button>
        <button class="wishlist-btn" aria-label="Wishlist">
          <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </button>
      </div>
    </div>
    <div class="product-info">
      <p class="product-name">${p.name}</p>
      <p class="product-colors">${p.category}</p>
      <div class="product-price-row">
        <span class="product-price">₦${p.price.toLocaleString("en-NG")}</span>
        ${sale ? `<span class="product-price-old">₦${p.original_price.toLocaleString("en-NG")}</span>` : ''}
      </div>
    </div>
  </article>`;
}

async function loadProducts() {
  const res = await fetch('assets/products.json');
  const data = await res.json();

  const newGrid = document.querySelector('#new-arrivals-grid');
  const bestGrid = document.querySelector('#best-sellers-grid');

  if (newGrid) {
    newGrid.innerHTML = data.new_arrivals.map(productCard).join('');
    newGrid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  if (bestGrid) {
    bestGrid.innerHTML = data.best_sellers.map(productCard).join('');
    bestGrid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('.add-to-bag-btn');
    if (btn) addToCart(btn.dataset.name);
    const wl = e.target.closest('.wishlist-btn');
    if (wl) wl.classList.toggle('wishlisted');
  });
}

document.querySelector('.newsletter-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const btn = e.target.querySelector('button');
  if (!input.value.trim()) return;
  btn.textContent = 'Subscribed!';
  btn.style.opacity = '0.7';
  input.value = '';
  setTimeout(() => { btn.textContent = 'Subscribe'; btn.style.opacity = ''; }, 3000);
});

const style = document.createElement('style');
style.textContent = `.cart-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(12px);background:#111;color:#fff;padding:12px 24px;border-radius:8px;font-size:13px;font-weight:500;opacity:0;transition:opacity .3s,transform .3s;z-index:9999;white-space:nowrap}.cart-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}.wishlist-btn.wishlisted svg{fill:#ef4444;stroke:#ef4444}`;
document.head.appendChild(style);

loadProducts();
