// ------------------ Navigation Logic ------------------

// Toggle mobile menu
function toggleMenu() {
    const nav = document.querySelector('nav');
    nav.classList.toggle('active');
}

// Highlight active navigation link
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (pageYOffset >= sectionTop - sectionHeight / 3) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
});

// Back to Top Button
const backToTopButton = document.querySelector('.back-to-top');
window.addEventListener('scroll', () => {
    backToTopButton.classList.toggle('visible', window.pageYOffset > 300);
});
backToTopButton.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Product Image Carousel
document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.product-image-carousel');

    carousels.forEach(carousel => {
        const images = carousel.querySelectorAll('.carousel-img');
        let index = 0;

        setInterval(() => {
            images[index].classList.remove('active');
            index = (index + 1) % images.length;
            images[index].classList.add('active');
        }, 3000);
    });
});

// ------------------ Cart Functionality ------------------

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Utility: Save and Update Local Storage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Utility: Extract numeric price from a string like "₱90/pc · ₱275 (3) · ₱550 (6)"
function extractPrice(priceText) {
    const match = priceText.match(/₱\d+/);
    return match ? parseInt(match[0].replace('₱', ''), 10) : 0;
}

// Add to cart logic
function addToCart(productName, price) {
  const existingItem = cart.find(item => item.name === productName && item.price === price);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name: productName, price: price, quantity: 1 });
  }

  saveCart();
  alert(`Added "${productName}" to cart!`);
  renderCartIcon();
}


// Hooking into all Add to Cart buttons
document.addEventListener('DOMContentLoaded', () => {
  const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');

  addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      const productCard = button.closest('.product-card');
      const productName = productCard.querySelector('.product-name').textContent.trim();

      // Check for <select class="price-option">
      const select = productCard.querySelector('.price-option');
      let price = 0;
      let sizeLabel = '';

      if (select) {
        price = parseInt(select.value, 10);
        sizeLabel = select.options[select.selectedIndex].text.split('-')[1]?.trim() || '';
      } else {
        const priceText = productCard.querySelector('.product-price').textContent.trim();
        price = extractPrice(priceText);
      }

      const itemLabel = sizeLabel ? `${productName} (${sizeLabel})` : productName;

      addToCart(itemLabel, price);
    });
  });

  renderCartIcon();
});

// Show cart total on nav or corner (optional enhancement)
function renderCartIcon() {
    let cartIcon = document.getElementById('cart-indicator');
    if (!cartIcon) {
        cartIcon = document.createElement('div');
        cartIcon.id = 'cart-indicator';
        cartIcon.style.position = 'fixed';
        cartIcon.style.top = '16px';
        cartIcon.style.right = '16px';
        cartIcon.style.background = '#FFB6C1';
        cartIcon.style.color = '#fff';
        cartIcon.style.padding = '15px 12px';
        cartIcon.style.borderRadius = '20px';
        cartIcon.style.fontSize = '0.8rem';
        cartIcon.style.fontWeight = 'bold';
        cartIcon.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
        cartIcon.style.cursor = 'pointer';
        cartIcon.style.zIndex = '1000';
        cartIcon.style.fontFamily = 'Short Stack, cursive';

        document.body.appendChild(cartIcon);

        cartIcon.addEventListener('click', viewCart);
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartIcon.textContent = `🛒 ${totalItems} item${totalItems !== 1 ? 's' : ''}`;
}

// Basic cart viewer (can be expanded into modal or checkout)
function viewCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const modal = document.getElementById('cart-modal');

  cartItemsContainer.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    cartTotal.textContent = '';
  } else {
    cart.forEach((item, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.innerHTML = `
        <strong>${item.name}</strong><br>
        ₱${item.price} × 
        <input type="number" class="qty-input" min="1" value="${item.quantity}" data-index="${index}"> 
        = ₱${item.price * item.quantity}
        <button class="btn" data-remove="${index}">✖</button>
      `;
      cartItemsContainer.appendChild(itemDiv);
      total += item.price * item.quantity;
    });

    cartTotal.textContent = `Total: ₱${total}`;

    document.querySelectorAll('.qty-input').forEach(input => {
      input.addEventListener('change', e => {
        const index = e.target.dataset.index;
        const newQty = parseInt(e.target.value);
        if (newQty >= 1) {
          cart[index].quantity = newQty;
          saveCart();
          renderCartIcon();
          viewCart();
        }
      });
    });

    document.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = btn.dataset.remove;
        cart.splice(index, 1);
        saveCart();
        renderCartIcon();
        viewCart();
      });
    });
  }

  modal.style.display = 'flex';

  // ✅ Hide cart icon on mobile
  if (window.innerWidth <= 768) {
    document.getElementById('cart-indicator').style.display = 'none';

    // Handle remove
    document.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = btn.dataset.remove;
        cart.splice(index, 1);
        saveCart();
        renderCartIcon();
        viewCart();
      });
    });
  }

  modal.style.display = 'flex';
}

function closeCart() {
  document.getElementById('cart-modal').style.display = 'none';

  // ✅ Show cart icon again on mobile
  if (window.innerWidth <= 768) {
    document.getElementById('cart-indicator').style.display = 'block';
  }
}
function clearCart() {
  if (confirm('Clear your cart?')) {
    cart = [];
    saveCart();
    renderCartIcon();
    viewCart();
  }
}

function placeOrder() {
  if (cart.length === 0) {
    alert('Cart is empty!');
    return;
  }

  let message = "🧁 KIND BITES ORDER\n\n";
  let total = 0;

  cart.forEach(item => {
    message += `• ${item.name} × ${item.quantity} = ₱${item.price * item.quantity}\n`;
    total += item.price * item.quantity;
  });

  message += `\n🧾 Total: ₱${total}\n\nPlease confirm payment via GCash or message us to arrange!`;

  // 🧹 Clear the cart visually and from memory
  cart = [];
  saveCart();
  renderCartIcon();

  // 🎉 Show order confirmation message
  const messengerLink = `https://www.facebook.com/laa.delizia`;
  const instagramLink = `https://www.instagram.com/kindbites.ph/`;

  document.getElementById('cart-items').innerHTML = `
    <div style="text-align:left;">
      <h3 style="color: var(--cyan);">✅ Order Placed!</h3>
      <p style="color: var(--gray); margin-top: 10px;">Your order summary has been saved. Please proceed with payment and send us a message to confirm!</p>
      <br>
      <strong>Send your order via:</strong><br><br>
      <a class="btn" href="${messengerLink}" target="_blank">💬 Facebook Messenger</a><br><br>
      <a class="btn" href="${instagramLink}" target="_blank">💬 Instagram</a><br><br>
      <strong>GCash:</strong><br>
      📱 0918-744-1236 (Kind Bites)<br><br>
      Please send a screenshot after payment 😊
    </div>
  `;

  document.getElementById('cart-total').textContent = '';

  if (window.innerWidth <= 768) {
    document.getElementById('cart-indicator').style.display = 'block';
  }

  // ✅ Close the cart automatically after 8 seconds
  setTimeout(() => {
    closeCart();
  }, 8000);
}



function openCustomBox() {
  document.getElementById('custom-box-modal').style.display = 'flex';
  updateLiveCookieCount();

  // Hide cart icon
  const cartIcon = document.getElementById('cart-indicator');
  if (cartIcon) cartIcon.style.display = 'none';
}


function closeCustomBox() {
  document.getElementById('custom-box-modal').style.display = 'none';

  // Show cart icon again
  const cartIcon = document.getElementById('cart-indicator');
  if (cartIcon) cartIcon.style.display = 'block';
}


function updateLiveCookieCount() {
  const inputs = document.querySelectorAll('#cookie-qty-list input[type="number"]');
  let total = 0;
  inputs.forEach(input => {
    total += parseInt(input.value) || 0;
  });
  document.getElementById('cookie-count').textContent = total;
}

document.querySelectorAll('#cookie-qty-list input').forEach(input => {
  input.addEventListener('input', updateLiveCookieCount);
});

function submitCustomBox() {
  const boxSize = parseInt(document.querySelector('input[name="boxSize"]:checked').value, 10);
  const inputs = document.querySelectorAll('#cookie-qty-list input[type="number"]');
  let totalQty = 0;
  let totalPrice = 0;
  const selections = [];

  inputs.forEach(input => {
    const qty = parseInt(input.value) || 0;
    const name = input.dataset.name;
    const price = parseInt(input.dataset.price, 10);

    if (qty > 0) {
      selections.push(`${name} x${qty}`);
      totalQty += qty;
      totalPrice += qty * price;
    }
  });

  const boxFee = boxSize === 3 ? 10 : 15;
  const warning = document.getElementById('box-warning');

  if (totalQty !== boxSize) {
    warning.textContent = `Total cookies must be exactly ${boxSize}. You selected ${totalQty}.`;
    warning.style.display = 'block';
    return;
  }

  warning.style.display = 'none';
  totalPrice += boxFee;

  const label = `Create Your Own Box (${boxSize}): ${selections.join(', ')}`;
  addToCart(label, totalPrice);
  closeCustomBox();
}

// Add this in placeOrder() after message = "...";

emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
  to_name: "Kind Bites",
  message: message,
  from_name: "Website Order",
}).then(() => {
  console.log("Email sent!");
}).catch((err) => {
  console.error("Email failed:", err);
});

function confirmGcashPayment() {
  let message = "🧁 KIND BITES ORDER\n\n";
  let total = 0;

  cart.forEach(item => {
    message += `• ${item.name} × ${item.quantity} = ₱${item.price * item.quantity}\n`;
    total += item.price * item.quantity;
  });

  message += `\n🧾 Total: ₱${total}\n\nPlease confirm payment via GCash or message us to arrange!`;

  // Optional: Send via EmailJS
  // emailjs.send(...)

  cart = [];
  saveCart();
  renderCartIcon();
  closeGcashModal();

  const messengerLink = `https://www.facebook.com/laa.delizia`;
  const instagramLink = `https://www.instagram.com/kindbites.ph/`;

  document.getElementById('cart-items').innerHTML = `
    <div style="text-align:left;">
      <h3 style="color: var(--cyan);">✅ Order Placed!</h3>
      <p style="color: var(--gray); margin-top: 10px;">We’ve received your order. Please message us with proof of payment.</p>
      <br>
      <strong>Send your order via:</strong><br><br>
      <a class="btn" href="${messengerLink}" target="_blank">💬 Facebook Messenger</a><br><br>
      <a class="btn" href="${instagramLink}" target="_blank">💬 Instagram</a><br><br>
      <strong>GCash:</strong><br>
      📱 0918-744-1236 (Kind Bites)<br><br>
      Please send a screenshot after payment 😊
    </div>
  `;

  document.getElementById('cart-total').textContent = '';

  if (window.innerWidth <= 768) {
    document.getElementById('cart-indicator').style.display = 'block';
  }

  setTimeout(() => {
    closeCart();
  }, 8000);
}

function closeGcashModal() {
  document.getElementById('gcash-modal').style.display = 'none';
}










