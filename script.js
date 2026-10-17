let cart = [];
const PHONE_WHATSAPP = "56971504474";

document.addEventListener("DOMContentLoaded", () => {
  renderProducts("todos");
  setupFilters();
  setupCartModal();
});

function renderProducts(filterCategory) {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = "";

  const filtered = filterCategory === "todos" 
    ? productsData 
    : productsData.filter(p => p.categoria === filterCategory);

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <span class="product-badge">${p.estado}</span>
      <img src="${p.imagen}" alt="${p.titulo}" class="product-img" onclick="openProductModal('${p.id}')" onerror="this.src='https://via.placeholder.com/300x240/222222/b3b233?text=Rubenice.Dendro'">
      <div class="product-info">
        <h3 class="product-title">${p.titulo}</h3>
        <div class="product-price">Desde $${p.precioBase.toLocaleString("es-CL")} CLP</div>
        <p class="product-desc-short">${p.descripcion.substring(0, 80)}...</p>
        <div class="product-actions">
          <button class="btn-card" onclick="openProductModal('${p.id}')">Ver Opciones / Agregar</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function setupFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderProducts(btn.dataset.filter);
    });
  });
}

function openProductModal(productId) {
  const p = productsData.find(item => item.id === productId);
  if (!p) return;

  const modal = document.getElementById("product-modal");
  const modalBody = document.getElementById("modal-product-body");

  let optionsHTML = p.variantes.map((v, index) => `
    <label style="display:block; margin: 10px 0;">
      <input type="radio" name="variant-choice" value="${index}" ${index === 0 ? "checked" : ""}>
      ${v.nombre} - <strong>$${v.precio.toLocaleString("es-CL")} CLP</strong>
    </label>
  `).join("");

  modalBody.innerHTML = `
    <h2>${p.titulo}</h2>
    <span class="product-badge" style="position:static; display:inline-block; margin:10px 0;">${p.estado}</span>
    <p style="color:var(--text-muted); margin: 15px 0;">${p.descripcion}</p>
    
    <div style="background:#161616; padding:15px; border-radius:10px; margin: 15px 0;">
      <h4 style="color:#fff;">Selecciona tu opción:</h4>
      ${optionsHTML}
    </div>

    <button class="btn btn-primary" style="width:100%; margin-top:10px;" onclick="addToCartFromModal('${p.id}')">
      🛒 Agregar al Carrito
    </button>
  `;

  modal.classList.add("open");
}

document.getElementById("close-product-modal").addEventListener("click", () => {
  document.getElementById("product-modal").classList.remove("open");
});

function addToCartFromModal(productId) {
  const p = productsData.find(item => item.id === productId);
  const selectedIndex = document.querySelector('input[name="variant-choice"]:checked').value;
  const selectedVariant = p.variantes[selectedIndex];

  cart.push({
    productId: p.id,
    titulo: p.titulo,
    variante: selectedVariant.nombre,
    precio: selectedVariant.precio
  });

  updateCartUI();
  document.getElementById("product-modal").classList.remove("open");
}

function updateCartUI() {
  document.getElementById("cart-count").innerText = cart.length;
  
  const container = document.getElementById("cart-items-container");
  container.innerHTML = "";
  
  let total = 0;
  let tutores60cmCount = 0;

  cart.forEach((item, index) => {
    total += item.precio;
    if (item.productId.includes("60")) tutores60cmCount++;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div>
        <div class="cart-item-title">${item.titulo}</div>
        <div class="cart-item-sub">${item.variante} - $${item.precio.toLocaleString("es-CL")} CLP</div>
      </div>
      <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#ff5555; cursor:pointer;">✕</button>
    `;
    container.appendChild(div);
  });

  document.getElementById("cart-total").innerText = `$${total.toLocaleString("es-CL")} CLP`;

  const promoBanner = document.getElementById("promo-notice");
  if (tutores60cmCount >= 2) {
    promoBanner.style.display = "block";
  } else {
    promoBanner.style.display = "none";
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function setupCartModal() {
  const modal = document.getElementById("cart-modal");
  document.getElementById("open-cart-btn").addEventListener("click", () => modal.classList.add("open"));
  document.getElementById("close-cart-modal").addEventListener("click", () => modal.classList.remove("open"));

  document.getElementById("checkout-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    const name = document.getElementById("cust-name").value;
    const city = document.getElementById("cust-city").value;
    const delivery = document.getElementById("cust-delivery").value;
    const notes = document.getElementById("cust-notes").value;

    let itemsText = cart.map(i => `• ${i.titulo} (${i.variante}) - $${i.precio.toLocaleString("es-CL")} CLP`).join("\n");
    let total = cart.reduce((sum, i) => sum + i.precio, 0);

    let msg = `*¡Hola Rubén! Quisiera realizar el siguiente pedido desde la web (Rubenice.Dendro):*\n\n`;
    msg += `*Productos:*\n${itemsText}\n\n`;
    msg += `*Total estimado:* $${total.toLocaleString("es-CL")} CLP\n\n`;
    msg += `*Datos del Cliente:*\n`;
    msg += `• Nombre: ${name}\n`;
    msg += `• Comuna/Ciudad: ${city}\n`;
    msg += `• Método de entrega: ${delivery}\n`;
    if (notes) msg += `• Notas: ${notes}\n`;

    const encodedURL = `https://wa.me/${PHONE_WHATSAPP}?text=${encodeURIComponent(msg)}`;
    window.open(encodedURL, "_blank");
  });
}