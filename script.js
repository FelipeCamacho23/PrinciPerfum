document.addEventListener('DOMContentLoaded', () => {
  const cartBtn = document.getElementById('cart-btn');
  const cartCountSpan = document.querySelector('.cart-count');
  const miniCart = document.querySelector('.mini-cart');
  const closeCartBtn = document.getElementById('close-cart');
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartTotalEl = document.getElementById('cart-total');
  const pagarBtn = document.querySelector('.pagar-btn');

  const searchBtn = document.getElementById('search-btn');
  const searchBar = document.getElementById('search-bar');
  const searchInput = document.getElementById('search-input');

  const genderFilter = document.getElementById('filter-gender');
  const familyFilter = document.getElementById('filter-family');
  const priceFilter = document.getElementById('filter-price');

  const modal = document.getElementById('quick-modal');
  const modalImg = modal.querySelector('.modal-img');
  const modalTitle = modal.querySelector('.modal-title');
  const modalBrand = modal.querySelector('.modal-brand');
  const modalPrice = modal.querySelector('.modal-price');
  const modalQty = modal.querySelector('#modal-qty');
  const modalAddBtn = modal.querySelector('.modal-add');
  const modalCloseBtn = modal.querySelector('.close-modal');

  let cartItems = []; 

  const formatPrice = (num) => {
    try {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(num);
    } catch (e) {
      return 'COP $' + num;
    }
  };

  function openCart() { miniCart.classList.add('open'); }
  function closeCart() { miniCart.classList.remove('open'); }

  cartBtn.addEventListener('click', () => {
  
    updateCart(); 
    openCart();
  });
  closeCartBtn.addEventListener('click', closeCart);

  function setupAddButtons() {
    document.querySelectorAll('.add-cart').forEach(btn => {
      btn.removeEventListener('click', onAddClick);
      btn.addEventListener('click', onAddClick);
    });
  }

  function onAddClick(e) {
    const card = e.currentTarget.closest('.product-card');
    if (!card) return;
    const id = card.id || card.getAttribute('data-id') || card.querySelector('h3').textContent.replace(/\s+/g,'-').toLowerCase();
    const name = card.querySelector('h3').textContent.trim();
    const price = parseInt(card.dataset.price, 10) || 0;
    const img = card.querySelector('img') ? card.querySelector('img').src : '';

    const existing = cartItems.find(x => x.id === id);
    if (existing) {
      existing.qty += 1;
      existing.total = existing.qty * existing.price;
    } else {
      cartItems.push({ id, name, price, qty: 1, total: price, img });
    }
    updateCart();

  }

  function updateCart(){
    cartItemsContainer.innerHTML = '';
    let grandTotal = 0;
    let totalUnits = 0;

    if (cartItems.length === 0) {
      const li = document.createElement('li');
      li.className = 'cart-empty';
      li.textContent = 'Tu carrito está vacío';
      cartItemsContainer.appendChild(li);
    } else {
      cartItems.forEach(item => {
        grandTotal += item.total;
        totalUnits += item.qty;

        const li = document.createElement('li');
        li.className = 'cart-item';
        li.dataset.id = item.id;

        li.innerHTML = `
          <div class="cart-item-left">
            <span class="cart-item-qty">${item.qty}x</span>
            <a class="cart-item-link" href="#${item.id}">${escapeHtml(item.name)}</a>
          </div>
          <div class="cart-item-right">
            <span class="cart-item-price">${formatPrice(item.total)}</span>
            <button class="cart-item-remove" aria-label="Eliminar ${escapeHtml(item.name)}">✖</button>
          </div>
        `;
        cartItemsContainer.appendChild(li);
      });
    }

    cartCountSpan.textContent = totalUnits;

    cartTotalEl.textContent = formatPrice(grandTotal);
  }

  function removeItemById(id) {
    cartItems = cartItems.filter(i => i.id !== id);
    updateCart();
  }

  cartItemsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.cart-item-remove');
    if (btn) {
      const li = btn.closest('.cart-item');
      const id = li ? li.dataset.id : null;
      if (id) removeItemById(id);
      return;
    }

    const link = e.target.closest('.cart-item-link');
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('href');
      const id = href && href.startsWith('#') ? href.slice(1) : null;
      if (id) {
   
        closeCart();
        const target = document.getElementById(id);
        if (target) {
  
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
 
            target.classList.add('flash');
            setTimeout(() => target.classList.remove('flash'), 1600);
          }, 260);
        }
      }
    }
  });


  function applyFilters(){
    const gender = genderFilter.value;
    const family = familyFilter.value;
    const maxPrice = parseInt(priceFilter.value, 10) || null;

    document.querySelectorAll('.product-card').forEach(card => {
      const matchesGender = !gender || card.dataset.gender === gender;
      const matchesFamily = !family || card.dataset.family === family;
      const matchesPrice = !maxPrice || (parseInt(card.dataset.price,10) <= maxPrice);
      card.style.display = (matchesGender && matchesFamily && matchesPrice) ? '' : 'none';
    });
  }
  [genderFilter, familyFilter, priceFilter].forEach(el => el.addEventListener('change', applyFilters));

  searchBtn.addEventListener('click', () => {
    if (searchBar.style.display === 'block') {
      searchBar.style.display = 'none';
    } else {
      searchBar.style.display = 'block';
      searchInput.focus();
    }
  });
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.trim().toLowerCase();
    document.querySelectorAll('.product-card').forEach(card => {
      const name = card.querySelector('h3').textContent.toLowerCase();
      card.style.display = name.includes(term) ? '' : 'none';
    });
  });

  function setupQuickView(){
    document.querySelectorAll('.quick-view').forEach(btn => {
      btn.removeEventListener('click', onQuickViewClick);
      btn.addEventListener('click', onQuickViewClick);
    });
  }
  function onQuickViewClick(e){
    const card = e.currentTarget.closest('.product-card');
    if (!card) return;
    const name = card.querySelector('h3').textContent;
    const brand = card.querySelector('.brand') ? card.querySelector('.brand').textContent : '';
    const priceText = card.querySelector('.price') ? card.querySelector('.price').textContent : '';
    const img = card.querySelector('img') ? card.querySelector('img').src : '';

    modalImg.src = img;
    modalTitle.textContent = name;

    if (modalBrand) modalBrand.textContent = brand;
    if (modalPrice) modalPrice.textContent = priceText;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');

    modalAddBtn.onclick = () => {
      const qty = Math.max(1, parseInt(modalQty.value,10) || 1);
      const id = card.id || name.replace(/\s+/g,'-').toLowerCase();
      const price = parseInt(card.dataset.price,10) || 0;
      const existing = cartItems.find(x => x.id === id);
      if (existing) {
        existing.qty += qty;
        existing.total = existing.qty * existing.price;
      } else {
        cartItems.push({ id, name, price, qty, total: price * qty, img });
      }
      updateCart();
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden','true');
    };
  }
  modalCloseBtn.addEventListener('click', () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
  });

  pagarBtn.addEventListener('click', () => {

    if (cartItems.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }
    const total = cartItems.reduce((s, i) => s + i.total, 0);
    alert('Total a pagar: ' + formatPrice(total) + '\n(Implementar flujo de pago más adelante)');
  });

  function escapeHtml(unsafe) {
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  const style = document.createElement('style');
  style.innerHTML = `.flash{outline:4px solid rgba(179,139,89,0.18);box-shadow:0 8px 30px rgba(0,0,0,0.08);transition:all .3s ease}`;
  document.head.appendChild(style);

  setupAddButtons();
  setupQuickView();
  updateCart();
 
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal.classList.contains('open')) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden','true');
      } else if (miniCart.classList.contains('open')) {
        closeCart();
      }
    }
  });
});



