let allProducts = [];
let activeTab = 'all';

const grid = document.querySelector('#shop-grid');

function fmt(n) { return '₦' + n.toLocaleString('en-NG'); }

function productCard(p) {
  const sale = p.price < p.original_price;
  return `<article class="product-card reveal" data-id="${p.id}" data-gender="${p.gender}" style="cursor:pointer">
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
      <p class="product-colors">${p.gender}</p>
      <div class="product-price-row">
        <span class="product-price">${fmt(p.price)}</span>
        ${sale ? `<span class="product-price-old">${fmt(p.original_price)}</span>` : ''}
      </div>
    </div>
  </article>`;
}

function render() {
  let list = [];
  if (activeTab === 'all') list = allProducts;
  else if (activeTab === 'new_arrivals') list = allProducts.filter(p => p.collection === 'new_arrivals');
  else if (activeTab === 'best_sellers') list = allProducts.filter(p => p.collection === 'best_sellers');
  else list = allProducts.filter(p => p.gender === activeTab);

  grid.innerHTML = list.length
    ? list.map(productCard).join('')
    : `<div class="no-results"><p>No products found</p><p>Try a different category</p></div>`;

  grid.querySelectorAll('.reveal').forEach(el => requestAnimationFrame(() => el.classList.add('in-view')));
}

async function init() {
  const res = await fetch('assets/shop-products.json');
  const data = await res.json();

  const tag = (arr, col) => arr.map(p => ({ ...p, collection: col }));
  allProducts = [
    ...tag(data.new_arrivals, 'new_arrivals'),
    ...tag(data.best_sellers, 'best_sellers'),
    ...tag(data.mens_wear, 'mens_wear'),
    ...tag(data.womens_wear, 'womens_wear'),
    ...tag(data.childrens_wear, 'childrens_wear')
  ];

  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab');
  if (tabParam) {
    activeTab = tabParam;
    document.querySelectorAll('.shop-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabParam);
    });
  }

  render();
}

document.addEventListener('click', e => {
  const tab = e.target.closest('.shop-tab');
  if (tab) {
    document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeTab = tab.dataset.tab;
    render();
    return;
  }

  const card = e.target.closest('.product-card[data-id]');
  const isBtn = e.target.closest('.add-to-bag-btn') || e.target.closest('.wishlist-btn');
  if (card && !isBtn) {
    const id = card.dataset.id;
    const gender = card.dataset.gender;
    window.location.href = `product.html?id=${id}&gender=${encodeURIComponent(gender)}`;
  }
});

document.querySelector('.shop-nl-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const btn = e.target.querySelector('button');
  if (!input.value.trim()) return;
  btn.textContent = 'Subscribed!';
  btn.style.opacity = '0.7';
  input.value = '';
  setTimeout(() => { btn.textContent = 'Subscribe'; btn.style.opacity = ''; }, 3000);
});

init();
