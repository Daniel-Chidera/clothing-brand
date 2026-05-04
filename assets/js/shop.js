let allProducts = [];
let activeFilters = {
  categories: [],
  collection: 'all',
  maxPrice: Infinity
};
let sortBy = 'default';

const grid = document.querySelector('#shop-grid');
const countEl = document.querySelector('#product-count');
const activeFilterWrap = document.querySelector('#active-filters');

function fmt(n) {
  return '₦' + n.toLocaleString('en-NG');
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
        <span class="product-price">${fmt(p.price)}</span>
        ${sale ? `<span class="product-price-old">${fmt(p.original_price)}</span>` : ''}
      </div>
    </div>
  </article>`;
}

function applySort(list) {
  const copy = [...list];
  if (sortBy === 'price-asc') return copy.sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') return copy.sort((a, b) => b.price - a.price);
  if (sortBy === 'name') return copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy;
}

function render() {
  let filtered = allProducts.filter(p => {
    const catOk = activeFilters.categories.length === 0 || activeFilters.categories.includes(p.category);
    const colOk = activeFilters.collection === 'all' || p.collection === activeFilters.collection;
    const priceOk = p.price <= activeFilters.maxPrice;
    return catOk && colOk && priceOk;
  });

  filtered = applySort(filtered);
  if (countEl) countEl.textContent = filtered.length;

  grid.innerHTML = filtered.length ?
    filtered.map(productCard).join('') :
    `<div class="no-results"><p>No products found</p><p>Try adjusting your filters</p></div>`;

  grid.querySelectorAll('.reveal').forEach(el => requestAnimationFrame(() => el.classList.add('in-view')));
  renderActiveTags();
}

function renderActiveTags() {
  if (!activeFilterWrap) return;
  const tags = [];
  activeFilters.categories.forEach(c => {
    tags.push(`<span class="active-filter-tag">${c}<button data-remove-cat="${c}">&#x2715;</button></span>`);
  });
  if (activeFilters.collection !== 'all') {
    const label = activeFilters.collection === 'new_arrivals' ? 'New Arrivals' : 'Best Sellers';
    tags.push(`<span class="active-filter-tag">${label}<button data-remove-col>&#x2715;</button></span>`);
  }
  activeFilterWrap.innerHTML = tags.join('');
}

async function init() {
  const res = await fetch('../shop-products.json');
  const data = await res.json();

  allProducts = [
    ...data.new_arrivals.map(p => ({
      ...p,
      collection: 'new_arrivals'
    })),
    ...data.best_sellers.map(p => ({
      ...p,
      collection: 'best_sellers'
    }))
  ];

  const maxP = Math.max(...allProducts.map(p => p.price));
  activeFilters.maxPrice = maxP;

  ['#price-range', '#price-range-mobile'].forEach(sel => {
    const input = document.querySelector(sel);
    const display = document.querySelector(sel.includes('mobile') ? '#price-max-mobile' : '#price-max');
    if (!input) return;
    input.max = maxP;
    input.value = maxP;
    if (display) display.textContent = fmt(maxP);
    input.addEventListener('input', () => {
      activeFilters.maxPrice = parseInt(input.value);
      document.querySelectorAll('#price-range, #price-range-mobile').forEach(r => r.value = input.value);
      document.querySelectorAll('#price-max, #price-max-mobile').forEach(d => d.textContent = fmt(activeFilters.maxPrice));
      render();
    });
  });

  render();
}

document.addEventListener('change', e => {
  const cb = e.target.closest('input[type="checkbox"][data-cat]');
  if (!cb) return;
  const cat = cb.dataset.cat;
  if (cb.checked) {
    if (!activeFilters.categories.includes(cat)) activeFilters.categories.push(cat);
  } else {
    activeFilters.categories = activeFilters.categories.filter(c => c !== cat);
  }
  document.querySelectorAll(`input[data-cat="${cat}"]`).forEach(el => el.checked = cb.checked);
  render();
});

document.addEventListener('click', e => {
  const tab = e.target.closest('.filter-tab');
  if (tab) {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeFilters.collection = tab.dataset.filter;
    render();
    return;
  }

  const addBtn = e.target.closest('.add-to-bag-btn');
  if (addBtn) {
    addToCart(addBtn.dataset.name);
    return;
  }

  const wl = e.target.closest('.wishlist-btn');
  if (wl) {
    wl.classList.toggle('wishlisted');
    return;
  }

  const removeTag = e.target.closest('[data-remove-cat]');
  if (removeTag) {
    activeFilters.categories = activeFilters.categories.filter(c => c !== removeTag.dataset.removeCat);
    document.querySelectorAll(`input[data-cat="${removeTag.dataset.removeCat}"]`).forEach(cb => cb.checked = false);
    render();
    return;
  }

  if (e.target.closest('[data-remove-col]')) {
    activeFilters.collection = 'all';
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.toggle('active', t.dataset.filter === 'all'));
    render();
    return;
  }

  if (e.target.closest('.clear-filters-btn')) {
    activeFilters.categories = [];
    activeFilters.collection = 'all';
    activeFilters.maxPrice = Math.max(...allProducts.map(p => p.price));
    document.querySelectorAll('input[data-cat]').forEach(cb => cb.checked = false);
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.toggle('active', t.dataset.filter === 'all'));
    document.querySelectorAll('#price-range, #price-range-mobile').forEach(r => r.value = r.max);
    document.querySelectorAll('#price-max, #price-max-mobile').forEach(d => d.textContent = fmt(activeFilters.maxPrice));
    render();
    return;
  }

  const gridBtn = e.target.closest('.grid-toggle-btn');
  if (gridBtn) {
    document.querySelectorAll('.grid-toggle-btn').forEach(b => b.classList.remove('active'));
    gridBtn.classList.add('active');
    grid.className = `shop-grid cols-${gridBtn.dataset.cols}`;
    return;
  }

  if (e.target.closest('.mobile-filter-btn')) {
    document.querySelector('.filter-drawer').classList.add('open');
    return;
  }
  if (e.target.closest('.filter-drawer-overlay') || e.target.closest('.filter-drawer-close')) {
    document.querySelector('.filter-drawer').classList.remove('open');
    return;
  }
});

document.querySelector('#sort-select')?.addEventListener('change', e => {
  sortBy = e.target.value;
  render();
});

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

const style = document.createElement('style');
style.textContent = `.cart-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(12px);background:#111;color:#fff;padding:12px 24px;border-radius:8px;font-size:13px;font-weight:500;opacity:0;transition:opacity .3s,transform .3s;z-index:9999;white-space:nowrap}.cart-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}.wishlist-btn.wishlisted svg{fill:#ef4444;stroke:#ef4444}`;
document.head.appendChild(style);

init();