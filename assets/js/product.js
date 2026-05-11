function fmt(n) { return '₦' + n.toLocaleString('en-NG'); }

const params = new URLSearchParams(window.location.search);
const productId = parseInt(params.get('id'));
const gender = params.get('gender') || '';

async function loadProduct() {
  const [r1, r2] = await Promise.all([
    fetch('assets/products.json'),
    fetch('assets/shop-products.json')
  ]);
  const d1 = await r1.json();
  const d2 = await r2.json();

  const all = [
    ...d1.new_arrivals,
    ...d1.best_sellers,
    ...d2.mens_wear,
    ...d2.womens_wear,
    ...d2.childrens_wear
  ];

  const product = all.find(p => p.id === productId);
  if (!product) return;

  document.title = `${product.name} — NEW WORLD`;

  const breadcrumbCat = document.querySelector('#breadcrumb-cat');
  const breadcrumbCatLink = document.querySelector('#breadcrumb-cat-link');
  if (breadcrumbCat) breadcrumbCat.textContent = product.gender || gender;
  if (breadcrumbCatLink) {
    const tab = encodeURIComponent(product.gender || gender);
    breadcrumbCatLink.href = `shop.html?tab=${tab}`;
  }

  const mainImg = document.querySelector('#product-main-img');
  if (mainImg) mainImg.src = product.image;

  const thumbs = [product.image, product.hover_image, product.image, product.hover_image, product.image];
  const thumbWrap = document.querySelector('#product-thumbs');
  if (thumbWrap) {
    thumbWrap.innerHTML = thumbs.map((src, i) =>
      `<div class="product-thumb ${i === 0 ? 'active' : ''}" data-src="${src}">
        <img src="${src}" alt="${product.name}">
      </div>`
    ).join('');

    thumbWrap.querySelectorAll('.product-thumb').forEach(th => {
      th.addEventListener('click', () => {
        thumbWrap.querySelectorAll('.product-thumb').forEach(t => t.classList.remove('active'));
        th.classList.add('active');
        mainImg.src = th.dataset.src;
      });
    });
  }

  const badgeEl = document.querySelector('#product-badge');
  if (badgeEl) badgeEl.textContent = product.badge;

  const titleEl = document.querySelector('#product-title');
  if (titleEl) titleEl.textContent = product.name;

  const priceEl = document.querySelector('#product-price');
  if (priceEl) priceEl.textContent = fmt(product.price);

  const strikEl = document.querySelector('#product-strike');
  if (strikEl) {
    if (product.price < product.original_price) {
      strikEl.textContent = fmt(product.original_price);
      strikEl.style.display = '';
    } else {
      strikEl.style.display = 'none';
    }
  }

  const orderBtn = document.querySelector('#order-btn');
  if (orderBtn) {
    orderBtn.addEventListener('click', () => addToCart(product.name));
  }
}

document.querySelector('.product-nl-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const btn = e.target.querySelector('button');
  if (!input.value.trim()) return;
  btn.textContent = 'Subscribed!';
  btn.style.opacity = '0.7';
  input.value = '';
  setTimeout(() => { btn.textContent = 'Subscribe'; btn.style.opacity = ''; }, 3000);
});

loadProduct();
