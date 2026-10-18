let cart = [];

document.addEventListener("DOMContentLoaded", () => {
  if (typeof productsData !== 'undefined') {
    renderProducts("todos");
  }

  // Filtros
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      filterButtons.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      const category = e.target.getAttribute("data-filter");
      renderProducts(category);
    });
  });

  // Modales
  const cartModal = document.getElementById("cart-modal");
  const openCartBtn = document.getElementById("open-cart-btn");
  const closeCartBtn = document.getElementById("close-cart-modal");

  if (openCartBtn && cartModal) {
    openCartBtn.addEventListener("click", () => cartModal.classList.add("open"));
  }
  if (closeCartBtn && cartModal) {
    closeCartBtn.addEventListener("click", () => cartModal.classList.remove("open"));
  }

  const productModal = document.getElementById("product-modal");
  const closeProductModal = document.getElementById("close-product-modal");
  if (closeProductModal && productModal) {
    closeProductModal.addEventListener("click", () => productModal.classList.remove("open"));
  }

  // Envío de Pedido por WhatsApp
  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
      }

      const name = document.getElementById("cust-name").value.trim();
      const city = document.getElementById("cust-city").value.trim();
      const delivery = document.getElementById("cust-delivery").value;
      const notes = document.getElementById("cust-notes").value.trim();

      let total = 0;
      let itemsText = cart.map(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        return `- ${item.cantidad}x ${item.titulo} (${item.variante}) : $${subtotal.toLocaleString('es-CL')} CLP`;
      }).join("\n");

      let promoText = "";
      const tutoresCount = cart.filter(i => i.id.includes("tutor")).reduce((acc, i) => acc + i.cantidad, 0);
      if (tutoresCount >= 2) {
        promoText = "\n🎁 *¡Aplica Promoción Especial de Tutores!*";
      }

      const message = `🌿 *¡Hola Rubenice.Dendro!* Me gustaría hacer el siguiente pedido:\n\n${itemsText}\n\n*Total estimado:* $${total.toLocaleString('es-CL')} CLP${promoText}\n\n📋 *Datos de Entrega:*\n• *Nombre:* ${name}\n• *Comuna/Ciudad:* ${city}\n• *Método:* ${delivery}\n${notes ? `• *Notas:* ${notes}` : ""}`;

      // Reemplaza con tu número de WhatsApp real (ej: 56912345678)
      const phone = "56971504474"; 
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      
      window.open(url, '_blank');
    });
  }
});

function renderProducts(category) {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  grid.innerHTML = "";

  const filtered = category === "todos" 
    ? productsData 
    : productsData.filter(p => p.categoria === category);

  filtered.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <span class="product-badge">${product.estado}</span>
      <img src="${product.imagen}" alt="${product.titulo}" class="product-img" onclick="openProductModal('${product.id}')">
      <div class="product-info">
        <h3 class="product-title">${product.titulo}</h3>
        <div class="product-price">$${product.precioBase.toLocaleString('es-CL')} CLP</div>
        <p class="product-desc-short">${product.descripcion}</p>
        <button class="btn-card" onclick="openProductModal('${product.id}')">Ver detalles</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function openProductModal(productId) {
  const product = productsData.find(p => p.id === productId);
  if (!product) return;

  const modalBody = document.getElementById("modal-product-body");
  
  let thumbsHtml = "";
  if (product.imagenes && product.imagenes.length > 0) {
    thumbsHtml = product.imagenes.map((img, idx) => `
      <img src="${img}" alt="Thumbnail" class="modal-thumb ${idx === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)">
    `).join("");
  }

  let variantesHtml = product.variantes.map((v) => `
    <option value="${v.nombre}" data-precio="${v.precio}">${v.nombre} — $${v.precio.toLocaleString('es-CL')} CLP</option>
  `).join("");

  modalBody.innerHTML = `
    <h2 style="color:var(--c-white-warm); font-size:1.15rem; margin-bottom:10px;">${product.titulo}</h2>
    <div class="modal-gallery">
      <img src="${product.imagen}" alt="${product.titulo}" class="modal-main-img" id="main-modal-img" onclick="openLightbox(this.src)">
      <div class="modal-thumbs">${thumbsHtml}</div>
    </div>
    <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:12px;">${product.descripcion}</p>
    
    <div style="margin-bottom:12px;">
      <label style="font-size:0.8rem; color:var(--text-muted); display:block; margin-bottom:4px;">Selecciona una variante:</label>
      <select id="modal-variant-select" onchange="updateModalPrice()" style="width:100%; padding:9px; background:rgba(16, 18, 12, 0.8); border:1px solid var(--border-glass); border-radius:10px; color:var(--text-color); font-size:0.85rem;">
        ${variantesHtml}
      </select>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <span style="font-size:1.1rem; font-weight:700; color:var(--c-lime);" id="modal-price-display">
        $${product.variantes[0].precio.toLocaleString('es-CL')} CLP
      </span>
    </div>

    <button class="btn btn-primary" onclick="addToCartFromModal('${product.id}')" style="width:100%;">Añadir al Carrito</button>
  `;

  document.getElementById("product-modal").classList.add("open");
}

function changeMainImage(src, thumbElement) {
  const mainImg = document.getElementById("main-modal-img");
  if (mainImg) mainImg.src = src;

  document.querySelectorAll(".modal-thumb").forEach(t => t.classList.remove("active"));
  if (thumbElement) thumbElement.classList.add("active");
}

function updateModalPrice() {
  const select = document.getElementById("modal-variant-select");
  if (!select) return;
  const selectedOption = select.options[select.selectedIndex];
  const price = parseInt(selectedOption.getAttribute("data-precio"));
  const priceDisplay = document.getElementById("modal-price-display");
  if (priceDisplay) {
    priceDisplay.innerText = `$${price.toLocaleString('es-CL')} CLP`;
  }
}

function openLightbox(imgSrc) {
  const lightbox = document.getElementById("lightbox-modal");
  const lightboxImg = document.getElementById("lightbox-img");
  if (lightbox && lightboxImg) {
    lightboxImg.src = imgSrc;
    lightbox.classList.add("open");
  }
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox-modal");
  if (lightbox) lightbox.classList.remove("open");
}

function addToCartFromModal(productId) {
  const product = productsData.find(p => p.id === productId);
  const select = document.getElementById("modal-variant-select");
  if (!product || !select) return;

  const varianteNombre = select.value;
  const variantePrecio = parseInt(select.options[select.selectedIndex].getAttribute("data-precio"));

  const existingItem = cart.find(i => i.id === productId && i.variante === varianteNombre);
  if (existingItem) {
    existingItem.cantidad += 1;
  } else {
    cart.push({
      id: productId,
      titulo: product.titulo,
      variante: varianteNombre,
      precio: variantePrecio,
      cantidad: 1
    });
  }

  updateCartUI();
  document.getElementById("product-modal").classList.remove("open");

  // Notificación flotante con opciones de seguir comprando o ver carrito
  showToastNotification(product.titulo);
}

function showToastNotification(productTitle) {
  let existingToast = document.getElementById("cart-toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.id = "cart-toast";
  toast.innerHTML = `
    <span>🌱 <b>¡Añadido!</b> ${productTitle}</span>
    <div style="display:flex; gap:8px; margin-top:8px;">
      <button onclick="document.getElementById('cart-toast').remove()" style="background:rgba(255,255,255,0.1); border:1px solid var(--border-glass); color:var(--c-sand); padding:6px 12px; border-radius:10px; cursor:pointer; font-size:0.78rem;">Seguir comprando</button>
      <button onclick="document.getElementById('cart-toast').remove(); document.getElementById('cart-modal').classList.add('open');" style="background:var(--c-lime); border:none; color:var(--c-charcoal); padding:6px 12px; border-radius:10px; cursor:pointer; font-size:0.78rem; font-weight:700;">Ver Carrito</button>
    </div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 5000);
}

function updateCartUI() {
  const countSpan = document.getElementById("cart-count");
  const container = document.getElementById("cart-items-container");
  const totalSpan = document.getElementById("cart-total");
  const promoNotice = document.getElementById("promo-notice");

  let totalItems = 0;
  let totalPrice = 0;
  let tutoresCount = 0;

  container.innerHTML = "";

  cart.forEach((item, index) => {
    totalItems += item.cantidad;
    totalPrice += item.precio * item.cantidad;
    if (item.id.includes("tutor")) {
      tutoresCount += item.cantidad;
    }

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div>
        <div class="cart-item-title">${item.titulo}</div>
        <div class="cart-item-sub">${item.variante} ($${item.precio.toLocaleString('es-CL')})</div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:0.85rem;">x${item.cantidad}</span>
        <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#ff6b6b; cursor:pointer; font-size:0.9rem;"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    container.appendChild(div);
  });

  if (countSpan) countSpan.innerText = totalItems;
  if (totalSpan) totalSpan.innerText = `$${totalPrice.toLocaleString('es-CL')} CLP`;

  if (promoNotice) {
    if (tutoresCount >= 2) {
      promoNotice.style.display = "block";
    } else {
      promoNotice.style.display = "none";
    }
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}
