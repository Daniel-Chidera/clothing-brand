document.querySelector('.contact-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('.form-submit');
  btn.textContent = 'Sending...';
  btn.style.opacity = '0.7';
  setTimeout(() => {
    form.style.display = 'none';
    document.querySelector('.form-success').style.display = 'block';
  }, 1200);
});

document.querySelector('.contact-nl-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const btn = e.target.querySelector('button');
  if (!input.value.trim()) return;
  btn.textContent = 'Subscribed!';
  btn.style.opacity = '0.7';
  input.value = '';
  setTimeout(() => { btn.textContent = 'Subscribe'; btn.style.opacity = ''; }, 3000);
});
