// IA#2: scripts.js
// Purpose: form validation, cart logic, event handlers

/* CONSTANTS */
const TAX_RATE = 0.15;
const cart = {};

// ===== UTILITY =====
function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

function round(v) {
  return Math.round(v * 100) / 100;
}

// ===== CART CALCULATIONS =====
function computeCartTotals(cartObj) {
  let subtotal = 0;

  Object.values(cartObj).forEach(item => {
    subtotal += item.price * item.qty;
  });

  let discount = subtotal >= 100 ? subtotal * 0.10 : 0;
  let taxable = subtotal - discount;
  let tax = taxable * TAX_RATE;
  let total = taxable + tax;

  return {
    subtotal: round(subtotal),
    discount: round(discount),
    tax: round(tax),
    total: round(total)
  };
}

// ===== CART COUNTER =====
function updateCartCounter() {
  const counter = document.getElementById("cart-count");
  if (!counter) return;

  let totalQty = 0;
  Object.values(cart).forEach(i => totalQty += i.qty);

  counter.textContent = totalQty;
}

// ===== RENDER CART PAGE =====
function renderCartPage() {
  const tbody = document.getElementById('cart-items');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (Object.keys(cart).length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Your cart is empty</td></tr>';
  } else {
    Object.values(cart).forEach(it => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(it.title)}</td>
        <td>$${it.price.toFixed(2)}</td>
        <td><input class="cart-qty" data-id="${it.id}" type="number" min="1" value="${it.qty}" style="width: 60px;"></td>
        <td>$${(it.price * it.qty).toFixed(2)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  const totals = computeCartTotals(cart);
  document.getElementById('cart-subtotal').textContent = totals.subtotal.toFixed(2);
  document.getElementById('cart-discount').textContent = totals.discount.toFixed(2);
  document.getElementById('cart-tax').textContent = totals.tax.toFixed(2);
  document.getElementById('cart-total').textContent = totals.total.toFixed(2);

  updateCartCounter();

  // Qty change listener
  document.querySelectorAll('.cart-qty').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const newQty = parseInt(e.target.value) || 1;
      
      if (newQty <= 0) {
        delete cart[id];
      } else {
        cart[id].qty = newQty;
      }
      
      saveCart();
      renderCartPage();
    });
  });

  // Clear cart button
  const clearBtn = document.getElementById('clear-cart');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all items from cart?')) {
        for (const k in cart) delete cart[k];
        saveCart();
        renderCartPage();
      }
    });
  }

  // Checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (Object.keys(cart).length === 0) {
        alert('Your cart is empty!');
        return;
      }
      window.location.href = 'checkout.html';
    });
  }
}

// ===== ADD TO CART =====
function setupAddToCartButtons() {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', e => {
      const card = e.target.closest('.product');
      if (!card) return;

      const id = card.dataset.id;
      const title = card.querySelector('.product-title').textContent.trim();
      const price = parseFloat(card.querySelector('.product-price').dataset.price);
      const qty = parseInt(card.querySelector('.qty').value) || 1;

      if (!cart[id]) {
        cart[id] = { id, title, price, qty };
      } else {
        cart[id].qty += qty;
      }

      saveCart();
      updateCartCounter();
      alert(`${qty} × ${title} added to cart!`);
    });
  });
}

// ===== LOGIN =====
function setupLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const usernameError = document.getElementById('login-username-error');
    const passwordError = document.getElementById('login-password-error');
    const msg = document.getElementById('login-msg');

    // Clear errors
    if (usernameError) usernameError.textContent = '';
    if (passwordError) passwordError.textContent = '';
    if (msg) msg.textContent = '';

    let hasError = false;

    if (!username) {
      if (usernameError) usernameError.textContent = 'Username is required';
      hasError = true;
    }

    if (password.length < 6) {
      if (passwordError) passwordError.textContent = 'Password must be at least 6 characters';
      hasError = true;
    }

    if (hasError) return;

    // Demo login - accept any non-empty username/valid password
    localStorage.setItem('loggedInUser', username);
    
    if (msg) msg.textContent = 'Login successful! Redirecting...';
    
    setTimeout(() => {
      updateProfileDisplay();
      window.location.href = 'index.html';
    }, 1000);
  });
}

// ===== REGISTRATION =====
function setupRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  const lettersOnly = /^[A-Za-z\s]+$/;
  const validEmail = em => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('reg-fullname').value.trim();
    const dob = document.getElementById('reg-dob').value;
    const email = document.getElementById('reg-email').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;

    // Clear errors
    document.getElementById('reg-fullname-error').textContent = '';
    document.getElementById('reg-dob-error').textContent = '';
    document.getElementById('reg-email-error').textContent = '';
    document.getElementById('reg-username-error').textContent = '';
    document.getElementById('reg-password-error').textContent = '';

    let hasError = false;

    if (!name) {
      document.getElementById('reg-fullname-error').textContent = 'Full name is required';
      hasError = true;
    } else if (!lettersOnly.test(name)) {
      document.getElementById('reg-fullname-error').textContent = 'Name must contain letters only';
      hasError = true;
    }

    if (!dob) {
      document.getElementById('reg-dob-error').textContent = 'Date of birth is required';
      hasError = true;
    }

    if (!email) {
      document.getElementById('reg-email-error').textContent = 'Email is required';
      hasError = true;
    } else if (!validEmail(email)) {
      document.getElementById('reg-email-error').textContent = 'Invalid email format';
      hasError = true;
    }

    if (!username) {
      document.getElementById('reg-username-error').textContent = 'Username is required';
      hasError = true;
    }

    if (!password) {
      document.getElementById('reg-password-error').textContent = 'Password is required';
      hasError = true;
    } else if (password.length < 6) {
      document.getElementById('reg-password-error').textContent = 'Password must be 6+ characters';
      hasError = true;
    }

    if (hasError) return;

    // Save user data (demo)
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[username] = { name, dob, email, password };
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registration complete! Redirecting to login...');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  });
}

// ===== CHECKOUT =====
function setupCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  const totals = computeCartTotals(cart);
  const checkoutTotal = document.getElementById('checkout-total');
  if (checkoutTotal) {
    checkoutTotal.textContent = totals.total.toFixed(2);
  }

  // Cancel checkout
  const cancelBtn = document.getElementById('cancel-checkout');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.location.href = 'cart.html';
    });
  }

  // Clear cart from checkout
  const clearCartBtn = document.getElementById('clear-cart-btn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      if (confirm('Clear all items?')) {
        for (const k in cart) delete cart[k];
        saveCart();
        location.reload();
      }
    });
  }

  // Confirm checkout
  const confirmBtn = document.getElementById('confirm-checkout');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      form.dispatchEvent(new Event('submit'));
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('ship-name').value.trim();
    const address = document.getElementById('ship-address').value.trim();
    const amount = parseFloat(document.getElementById('ship-amount').value);

    const lettersOnly = /^[A-Za-z\s]+$/;

    if (!lettersOnly.test(name)) {
      alert('Name must contain letters only.');
      return;
    }

    if (!address) {
      alert('Please enter a shipping address');
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    const currentTotals = computeCartTotals(cart);

    if (amount !== currentTotals.total) {
      alert(
        `Payment amount must exactly match the total: $${currentTotals.total.toFixed(2)}\n\n` +
        `You entered: $${amount.toFixed(2)}`
      );
      return;
    }

    // Save invoice data and clear cart
    const invoiceData = {
      name,
      address,
      items: Object.values(cart),
      totals: currentTotals,
      date: new Date().toLocaleDateString()
    };

    localStorage.setItem('lastInvoice', JSON.stringify(invoiceData));

    // Clear cart
    for (const k in cart) delete cart[k];
    saveCart();

    alert('Payment received! Your invoice has been generated.');
    window.location.href = 'Invoice.html';
  });
}

// ===== INVOICE PAGE =====
function renderInvoice() {
  const container = document.getElementById('invoice-data');
  if (!container) return;

  const invoiceData = JSON.parse(localStorage.getItem('lastInvoice') || 'null');

  if (!invoiceData) {
    container.innerHTML = '<p>No invoice data found. <a href="index.html">Return to home</a></p>';
    return;
  }

  let itemsHtml = invoiceData.items
    .map(
      item =>
        `<tr>
        <td>${escapeHtml(item.title)}</td>
        <td>${item.qty}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${(item.qty * item.price).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  container.innerHTML = `
    <div class="invoice-info">
      <p><strong>Invoice Date:</strong> ${invoiceData.date}</p>
      <p><strong>Customer Name:</strong> ${escapeHtml(invoiceData.name)}</p>
      <p><strong>Shipping Address:</strong> ${escapeHtml(invoiceData.address)}</p>
    </div>

    <table class="invoice-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="margin-top: 20px; text-align: right;">
      <p>Subtotal: <strong>$${invoiceData.totals.subtotal.toFixed(2)}</strong></p>
      ${invoiceData.totals.discount > 0 ? `<p>Discount (10%): <strong>-$${invoiceData.totals.discount.toFixed(2)}</strong></p>` : ''}
      <p>Tax (15%): <strong>$${invoiceData.totals.tax.toFixed(2)}</strong></p>
      <p style="font-size: 1.2rem; color: var(--emerald);"><strong>Total: $${invoiceData.totals.total.toFixed(2)}</strong></p>
    </div>

    <div style="margin-top: 20px; text-align: center;">
      <p><a href="index.html">Return to Home</a></p>
    </div>
  `;
}

// ===== PROFILE DISPLAY =====
function updateProfileDisplay() {
  const box = document.getElementById('profile-status');
  const logoutBtn = document.getElementById('logout-btn');
  if (!box) return;

  const user = localStorage.getItem('loggedInUser');
  
  if (user) {
    box.textContent = `Logged in as ${user}`;
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
  } else {
    box.textContent = 'Not logged in';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

// ===== LOCAL STORAGE =====
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
  const data = localStorage.getItem('cart');
  if (data) {
    try {
      Object.assign(cart, JSON.parse(data));
    } catch (e) {
      console.error('Error loading cart:', e);
    }
  }
}

// ===== SCROLL REVEAL ANIMATION =====
function setupScrollReveal() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
  });
}

// ===== LOGOUT =====
function setupLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('loggedInUser');
        updateProfileDisplay();
        window.location.href = 'index.html';
      }
    });
  }
}

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  updateCartCounter();
  updateProfileDisplay();

  setupAddToCartButtons();
  setupLoginForm();
  setupRegisterForm();
  setupCheckoutForm();
  setupLogout();
  setupScrollReveal();
  renderCartPage();
  renderInvoice();
});

window.addEventListener('beforeunload', saveCart);