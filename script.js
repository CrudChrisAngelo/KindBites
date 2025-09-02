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

      // ✅ Check for flavor option
      const flavorSelect = productCard.querySelector('.flavor-option');
      let flavorLabel = '';
      if (flavorSelect) {
        flavorLabel = flavorSelect.options[flavorSelect.selectedIndex].text.split('-')[0]?.trim() || '';
      }

      // ✅ Check for price/topping option
      const priceSelect = productCard.querySelector('.price-option');
      let price = 0;
      let styleLabel = '';

      if (priceSelect) {
        price = parseInt(priceSelect.value, 10);
        styleLabel = priceSelect.options[priceSelect.selectedIndex].text.split('-')[1]?.trim() || '';
      } else {
        const priceText = productCard.querySelector('.product-price').textContent.trim();
        price = extractPrice(priceText);
      }

      // ✅ Combine into final label
      let itemLabel = productName;
      if (flavorLabel) itemLabel += ` - ${flavorLabel}`;
      if (styleLabel) itemLabel += ` (${styleLabel})`;

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

  const encodedMsg = encodeURIComponent(message);
  const messengerLink = `https://www.facebook.com/laa.delizia`;
  const InstagramLink = `https://www.instagram.com/kindbites.ph/=${encodedMsg}`;

  document.getElementById('cart-items').innerHTML = `
    <div style="text-align:left;">
      <strong>Send your order via:</strong><br><br>
      <a class="btn" href="${messengerLink}" target="_blank">💬 Facebook Messenger</a><br><br>
      <a class="btn" href="${InstagramLink}" target="_blank">💬 Instagram</a><br><br>
      <strong>GCash:</strong><br>
      📱 0918-744-1236 (Kind Bites)<br><br>
      Please send screenshot after payment 😊
    </div>
  `;
  document.getElementById('cart-total').textContent = '';
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

function closeGcashModal() {
  const modal = document.getElementById('gcash-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}


function placeOrder() {
  if (cart.length === 0) {
    alert('Cart is empty!');
    return;
  }
  document.getElementById('gcash-modal').style.display = 'flex';
}

// Replace your confirmGcashPayment function with this fixed version:

function confirmGcashPayment() {
  console.log("confirmGcashPayment function started");
  
  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();

  console.log("Name:", name);
  console.log("Phone:", phone);

  if (!name || !phone) {
    alert("Please enter your name and phone number.");
    return;
  }

  // Calculate order details
  let total = 0;
  const items = cart.map(item => {
    total += item.price * item.quantity;
    return `• ${item.name} × ${item.quantity} = ₱${item.price * item.quantity}`;
  }).join('\n');

  console.log("Cart:", cart);
  console.log("Items:", items);
  console.log("Total:", total);

  // Show loading state
  const submitBtn = document.querySelector('#gcash-modal .btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending Order...';
  submitBtn.disabled = true;

  // Prepare form data
  const formData = new FormData();
  formData.append("name", name);
  formData.append("phone", phone);
  formData.append("items", items);
  formData.append("total", total);

  console.log("FormData prepared");

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx2ayTph84UCE_R4aW16oeFVbSPSRO0UqFiHhXGCbLgw8ZDU3AucjWvcJq4g0J4KOBL/exec";

  console.log("Sending to URL:", APPS_SCRIPT_URL);

  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    body: formData
  })
  .then(response => {
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    return response.text();
  })
  .then(result => {
    console.log('Raw response:', result);
    
    if (result.includes("SUCCESS")) {
      console.log("Success detected");
      // Success! Clear cart and close modals
      cart = [];
      saveCart();
      renderCartIcon();
      closeGcashModal();
      closeCart();

      // Show success message
      alert(`✅ Order Sent Successfully!\n\nOrder Details:\n${items}\n\nTotal: ₱${total}\n\nPlease send your GCash payment screenshot to:\n📱 0918-744-1236\n💬 Facebook Messenger\n📸 Instagram\n\nThank you for your order!`);
      
    } else {
      console.log("Success not detected in response");
      throw new Error("Unexpected response: " + result);
    }
  })
  .catch(error => {
    console.error("Detailed error:", error);
    console.error("Error message:", error.message);
    alert(`❌ Order submission failed.\n\nError: ${error.message}\n\nPlease contact us directly:\n📱 0918-744-1236\n💬 Facebook: laa.delizia\n📸 Instagram: kindbites.ph`);
  })
  .finally(() => {
    // Reset button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
}



// LIGHTBOXXX

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the lightbox functionality
    initLightbox();
    
    // Your other existing DOMContentLoaded code...
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');

function updateLightboxImage() {
    const imageSrc = galleryImages[currentImageIndex].getAttribute("src");
    lightboxImage.setAttribute("src", imageSrc);
    lightboxImage.setAttribute("alt", galleryImages[currentImageIndex].alt || "");
    lightboxCounter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
}

function initLightbox() {
    const galleryImages = document.querySelectorAll('.gallery img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const lightboxCounter = document.querySelector('.lightbox-counter');
    
    // If no gallery images found, exit
    if (galleryImages.length === 0) return;
    
    let currentImageIndex = 0;
    
    // Add click event to each gallery image
    galleryImages.forEach((img, index) => {
        img.addEventListener('click', function() {
            openLightbox(index);
        });
        
        // Add cursor pointer to indicate clickability
        img.style.cursor = 'zoom-in';
    });
    
    // Open lightbox with specific image
    function openLightbox(index) {
        currentImageIndex = index;
        updateLightboxImage();
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    // Update lightbox image and counter
    function updateLightboxImage() {
        const imageSrc = galleryImages[currentImageIndex].src;
        lightboxImage.src = imageSrc;
        lightboxImage.alt = galleryImages[currentImageIndex].alt;
        lightboxCounter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
    }
    
    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = ''; // Re-enable scrolling
    }
    
    // Navigate to next image
    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        updateLightboxImage();
    }
    
    // Navigate to previous image
    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxImage();
    }
    
    // Event listeners for lightbox controls
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', nextImage);
    lightboxPrev.addEventListener('click', prevImage);
    
    // Close lightbox when clicking on the background
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('open')) return;
        
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowRight':
                nextImage();
                break;
            case 'ArrowLeft':
                prevImage();
                break;
        }
    });
    
    // Swipe support for touch devices
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightbox.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    lightbox.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const swipeThreshold = 50;
        
        if (touchEndX < touchStartX - swipeThreshold) {
            nextImage(); // Swipe left
        }
        
        if (touchEndX > touchStartX + swipeThreshold) {
            prevImage(); // Swipe right
        }
    }
}
});

document.addEventListener('DOMContentLoaded', function() {
  const slides = document.querySelector('.slides');
  const images = document.querySelectorAll('.slides img');
  const prev = document.querySelector('.prev');
  const next = document.querySelector('.next');
  const counter = document.querySelector('.counter');
  
  let index = 0;
  
  function updateSlider() {
    slides.style.transform = `translateX(${-index * 100}%)`;
    counter.textContent = `${index + 1} / ${images.length}`;
  }
  
  next.addEventListener('click', () => {
    index = (index + 1) % images.length;
    updateSlider();
  });
  
  prev.addEventListener('click', () => {
    index = (index - 1 + images.length) % images.length;
    updateSlider();
  });
  
  // Initialize
  updateSlider();
});

const slides = document.querySelector('.slides');
const images = document.querySelectorAll('.slides img');
const prev = document.querySelector('.prev');
const next = document.querySelector('.next');
let index = 0;

// Slider controls
function showSlide(i) {
  if (i < 0) index = images.length - 1;
  else if (i >= images.length) index = 0;
  else index = i;
  slides.style.transform = `translateX(${-index * 100}%)`;
}

prev.addEventListener('click', () => showSlide(index - 1));
next.addEventListener('click', () => showSlide(index + 1));

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.querySelector('.lightbox-img');
const closeBtn = document.querySelector('.lightbox .close');

images.forEach(img => {
  img.addEventListener('click', () => {
    lightbox.style.display = 'flex';
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
  });
});

closeBtn.addEventListener('click', () => {
  lightbox.style.display = 'none';
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.style.display = 'none';
});



