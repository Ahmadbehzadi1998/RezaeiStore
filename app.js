(() => {
  const grid = document.getElementById('products');
  const search = document.getElementById('search');
  const filters = document.getElementById('filters');
  const count = document.getElementById('count-label');
  const notice = document.getElementById('notice');
  let allProducts = [];
  let activeCategory = 'همه';
  document.getElementById('year').textContent = new Date().getFullYear();
  const safe = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function renderFilters() {
    const categories = ['همه', ...new Set(allProducts.map(p => p.category).filter(Boolean))];
    filters.innerHTML = categories.map(c => '<button class="filter '+(activeCategory===c?'active':'')+'" type="button" data-category="'+safe(c)+'">'+safe(c)+'</button>').join('');
    filters.querySelectorAll('button').forEach(button => button.addEventListener('click', () => { activeCategory = button.dataset.category; renderFilters(); renderProducts(); }));
    filters.hidden = categories.length <= 2;
  }
  function renderProducts() {
    const term = search.value.trim().toLocaleLowerCase();
    const visible = allProducts.filter(p => {
      const haystack = [p.nameFa,p.nameEn,p.category,p.description].filter(Boolean).join(' ').toLocaleLowerCase();
      return (activeCategory==='همه'||p.category===activeCategory) && haystack.includes(term);
    });
    count.textContent = allProducts.length ? visible.length+' محصول از '+allProducts.length+' محصول' : 'هنوز محصولی اضافه نشده است';
    if (!visible.length) {
      const isEmpty = !allProducts.length;
      grid.innerHTML = '<div class="empty"><div class="empty-icon">✳</div><h3>'+(isEmpty?'هنوز پوستری بارگذاری نشده است':'محصولی پیدا نشد')+'</h3><p>'+(isEmpty?'برای افزودن محصولات، تصاویر را در پوشهٔ posters در GitHub بارگذاری کنید و سپس اطلاعات آن‌ها را در products.json ثبت کنید. راهنمای کامل در فایل README.md موجود است.':'عبارت جست‌وجو یا دسته‌بندی را تغییر دهید.')+'</p><a href="https://github.com/Ahmadbehzadi1998/RezaeiStore" target="_blank" rel="noopener noreferrer">رفتن به مخزن GitHub</a></div>';
      return;
    }
    grid.innerHTML = visible.map((p,i) => {
      const productName = p.nameFa || p.nameEn || 'محصول';
      const orderMessage = 'سلام، برای سفارش این محصول از فروشگاه رضایی راهنمایی می‌خواهم: ' + productName + (p.nameEn && p.nameFa ? ' (' + p.nameEn + ')' : '');
      const orderUrl = 'https://wa.me/989356315397?text=' + encodeURIComponent(orderMessage);
      return '<article class="product product-delay-'+Math.min(i,7)+'"><div class="poster">'+(p.image?'<img src="'+safe(p.image)+'" alt="'+safe(p.alt||p.nameFa||p.nameEn||'تصویر محصول')+'" loading="lazy" decoding="async">':'<div class="placeholder"><span>▧</span><small>تصویر محصول اضافه نشده</small></div>')+'</div><div class="product-info"><h3>'+safe(productName)+'</h3>'+(p.nameEn?'<p class="product-name-en" dir="ltr">'+safe(p.nameEn)+'</p>':'')+(p.description?'<p>'+safe(p.description)+'</p>':'')+(p.category?'<span class="product-tag">'+safe(p.category)+'</span>':'')+'<a class="order-btn" href="'+orderUrl+'" target="_blank" rel="noopener noreferrer" aria-label="سفارش '+safe(productName)+' از طریق واتساپ"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.7A8.5 8.5 0 1 1 20.5 11.5Z"/><path d="M8.5 8.2c.3-.6.6-.6.9-.6h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.6.7c-.2.2-.2.4 0 .6.5.9 1.3 1.6 2.2 2.1.2.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.5 0 .4-.2 1.1-.7 1.5-.5.5-1.2.7-2 .5-1-.2-2.2-.8-3.5-1.9-1.1-1-1.9-2.3-2.1-3.3-.2-.7 0-1.5.3-2Z"/></svg><span>سفارش از واتساپ</span></a></div></article>';
    }).join('');
    grid.querySelectorAll('.poster img').forEach(img => img.addEventListener('error', () => {
      const fallback = document.createElement('div');
      fallback.className = 'placeholder';
      const symbol = document.createElement('span'); symbol.textContent = '▧';
      const label = document.createElement('small'); label.textContent = 'تصویر در دسترس نیست';
      fallback.append(symbol, label); img.replaceWith(fallback);
    }, { once: true }));
  }
  search.addEventListener('input',renderProducts);
  fetch('./products.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('products.json unavailable');return r.json()}).then(data=>{
    if(!Array.isArray(data))throw new Error('Invalid products format');
    allProducts=data.filter(p=>p&&typeof p==='object');
    renderFilters();renderProducts();
  }).catch(()=>{
    count.textContent='فهرست محصولات بارگذاری نشد';
    notice.textContent='فایل products.json در دسترس نیست یا قالب آن معتبر نیست. مخزن GitHub را بررسی کنید.';
    notice.classList.add('show');
    grid.innerHTML='<div class="empty"><div class="empty-icon">!</div><h3>بارگذاری فهرست با خطا روبه‌رو شد</h3><p>مطمئن شوید فایل products.json در ریشهٔ پروژه وجود دارد و شامل یک آرایهٔ JSON معتبر است.</p></div>';
  });
})();
