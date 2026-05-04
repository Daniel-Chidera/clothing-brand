// ── Main page product rendering ──

async function loadNewArrivals() {
  const grid = document.getElementById('new-arrivals-grid');
  if (!grid) return;

  const products = await fetchProducts();
  const arrivals = products.filter(p => p.tags.includes('new-arrival')).slice(0, 4);

  grid.innerHTML = arrivals.map((p, i) => buildProductCard(p, i + 1)).join('');
  initScrollReveal();
}

async function loadBestSellers() {
  const grid = document.getElementById('best-sellers-grid');
  if (!grid) return;

  const products = await fetchProducts();
  const sellers = products.filter(p => p.tags.includes('best-seller')).slice(0, 4);

  grid.innerHTML = sellers.map((p, i) => buildProductCard(p, i + 1)).join('');
  initScrollReveal();
}

document.addEventListener('DOMContentLoaded', () => {
  loadNewArrivals();
  loadBestSellers();
});
