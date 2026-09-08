const SHIPPING_FLAT = 4.99;
const FREE_SHIPPING_THRESHOLD = 75;

let cart = loadCart();
let activeCategory = "all";
let searchTerm = "";

const productGrid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const cartCount = document.getElementById("cartCount");
const cartItemsEl = document.getElementById("cartItems");
const cartSubtotalEl = document.getElementById("cartSubtotal");
const checkoutBtn = document.getElementById("checkoutBtn");

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("nimbus_cart")) || [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem("nimbus_cart", JSON.stringify(cart));
}

function formatMoney(n) {
  return "$" + n.toFixed(2);
}

const CATEGORY_LABELS = {
  clothing: "Clothing",
  electronics: "Electronics",
  home: "Home",
  sports: "Sports",
  fruits: "Fruits",
  groceries: "Groceries",
  misc: "Miscellaneous",
};

function renderProducts() {
  const filtered = PRODUCTS.filter(p => {
    const matchesCat = activeCategory === "all" || p.cat === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  productGrid.innerHTML = filtered.map(p => `
    <div class="product-card" id="product-${p.id}" data-testid="product-card-${p.id}" data-product-id="${p.id}" data-product-category="${p.cat}">
      <div class="product-image">${p.emoji}</div>
      <div class="product-info">
        <span class="product-cat">${CATEGORY_LABELS[p.cat] || p.cat}</span>
        <h3 class="product-name" data-testid="product-name-${p.id}">${p.name}</h3>
        <p class="product-desc">${p.desc}</p>
        <div class="product-bottom">
          <span class="product-price" data-testid="product-price-${p.id}">${formatMoney(p.price)}</span>
          <button class="btn btn-primary" id="addToCart-${p.id}" data-add="${p.id}" data-testid="add-to-cart-${p.id}">Add</button>
        </div>
      </div>
    </div>
  `).join("");

  emptyState.hidden = filtered.length !== 0;
}

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji, qty: 1 });
  }
  saveCart();
  renderCart();
  showToast(`${product.name} added to cart`);
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function getSubtotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function renderCart() {
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  cartCount.textContent = totalQty;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="cart-empty">Your cart is empty</p>`;
    checkoutBtn.disabled = true;
  } else {
    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-item" id="cartItem-${item.id}" data-testid="cart-item-${item.id}" data-product-id="${item.id}">
        <div class="cart-item-emoji">${item.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name" data-testid="cart-item-name-${item.id}">${item.name}</div>
          <div class="cart-item-price">${formatMoney(item.price)} each</div>
          <div class="qty-controls">
            <button class="qty-btn" data-qty-minus="${item.id}" data-testid="cart-item-decrease-${item.id}">−</button>
            <span data-testid="cart-item-qty-${item.id}">${item.qty}</span>
            <button class="qty-btn" data-qty-plus="${item.id}" data-testid="cart-item-increase-${item.id}">+</button>
          </div>
        </div>
        <button class="remove-btn" data-remove="${item.id}" data-testid="cart-item-remove-${item.id}">Remove</button>
      </div>
    `).join("");
    checkoutBtn.disabled = false;
  }

  cartSubtotalEl.textContent = formatMoney(getSubtotal());
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.hidden = true; }, 2200);
}

// Cart drawer open/close
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");

function openCartDrawer() {
  cartDrawer.hidden = false;
  cartOverlay.hidden = false;
}
function closeCartDrawer() {
  cartDrawer.hidden = true;
  cartOverlay.hidden = true;
}

document.getElementById("openCart").addEventListener("click", openCartDrawer);
document.getElementById("closeCart").addEventListener("click", closeCartDrawer);
cartOverlay.addEventListener("click", closeCartDrawer);

// Category filter
document.getElementById("catNav").addEventListener("click", (e) => {
  const btn = e.target.closest(".cat-btn");
  if (!btn) return;
  document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  activeCategory = btn.dataset.cat;
  renderProducts();
});

// Search
document.getElementById("searchInput").addEventListener("input", (e) => {
  searchTerm = e.target.value;
  renderProducts();
});

// Product grid delegation (add to cart)
productGrid.addEventListener("click", (e) => {
  const addBtn = e.target.closest("[data-add]");
  if (addBtn) addToCart(Number(addBtn.dataset.add));
});

// Cart items delegation
cartItemsEl.addEventListener("click", (e) => {
  const plus = e.target.closest("[data-qty-plus]");
  const minus = e.target.closest("[data-qty-minus]");
  const remove = e.target.closest("[data-remove]");
  if (plus) updateQty(Number(plus.dataset.qtyPlus), 1);
  if (minus) updateQty(Number(minus.dataset.qtyMinus), -1);
  if (remove) removeFromCart(Number(remove.dataset.remove));
});

// Checkout modal
const checkoutOverlay = document.getElementById("checkoutOverlay");
const checkoutModal = document.getElementById("checkoutModal");
const checkoutStepForm = document.getElementById("checkoutStepForm");
const checkoutStepSuccess = document.getElementById("checkoutStepSuccess");

function openCheckout() {
  closeCartDrawer();
  renderSummary();
  checkoutStepForm.hidden = false;
  checkoutStepSuccess.hidden = true;
  checkoutOverlay.hidden = false;
  checkoutModal.hidden = false;
}

function closeCheckout() {
  checkoutOverlay.hidden = true;
  checkoutModal.hidden = true;
}

document.getElementById("checkoutBtn").addEventListener("click", openCheckout);
document.getElementById("closeCheckout").addEventListener("click", closeCheckout);
checkoutOverlay.addEventListener("click", closeCheckout);

function renderSummary() {
  const summaryItems = document.getElementById("summaryItems");
  summaryItems.innerHTML = cart.map(i => `
    <div class="summary-item">
      <span>${i.qty} × ${i.name}</span>
      <span>${formatMoney(i.price * i.qty)}</span>
    </div>
  `).join("");

  const subtotal = getSubtotal();
  const shipping = cart.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  document.getElementById("sumSubtotal").textContent = formatMoney(subtotal);
  document.getElementById("sumShipping").textContent = shipping === 0 ? "Free" : formatMoney(shipping);
  document.getElementById("sumTotal").textContent = formatMoney(total);
}

// Fake card number formatting
const cardInput = document.querySelector('input[name="card"]');
cardInput.addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "").slice(0, 16);
  e.target.value = v.replace(/(.{4})/g, "$1 ").trim();
});

const expiryInput = document.querySelector('input[name="expiry"]');
expiryInput.addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "").slice(0, 4);
  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
  e.target.value = v;
});

// Checkout submit (simulated — no real payment is processed)
document.getElementById("checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  const name = form.fullname.value.trim();
  const orderId = "NM-" + Math.floor(100000 + Math.random() * 900000);

  document.getElementById("successName").textContent = name;
  document.getElementById("successOrderId").textContent = "#" + orderId;

  checkoutStepForm.hidden = true;
  checkoutStepSuccess.hidden = false;

  cart = [];
  saveCart();
  renderCart();
  form.reset();
});

document.getElementById("continueShopping").addEventListener("click", closeCheckout);

// Session (simulated)
const welcomeMsg = document.getElementById("welcomeMsg");
const currentUser = sessionStorage.getItem("nimbus_username");
if (currentUser) {
  welcomeMsg.textContent = `Hi, ${currentUser}`;
  welcomeMsg.hidden = false;
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("nimbus_auth");
  sessionStorage.removeItem("nimbus_username");
  window.location.href = "login.html";
});

// Init
renderProducts();
renderCart();
