document.addEventListener("DOMContentLoaded", () => {
    // Loading screen logic
    const loadingScreen = document.getElementById("loading-screen");
    const pageCover = document.getElementById("page-cover");
    document.body.classList.add("loading");

    setTimeout(() => {
        loadingScreen.style.opacity = "0";
        pageCover.style.opacity = "0";
        setTimeout(() => {
            loadingScreen.style.display = "none";
            pageCover.style.display = "none";
            document.body.classList.remove("loading");
        }, 1000);
    }, 1000);

    // Shirt data

    const shirts = [
        { title: "FRESH", description: "SO CLEAN", price: 35, imgSrc: "/store/z.DESIGN13.webp" },
        { title: "GOD IS ALIVE", description: "MAYBE.", price: 35, imgSrc: "/store/z.DESIGN3 (1)-1.webp" },
        { title: "SOBER 25", description: "WE DO NOT PROMOTE DRUGS", price: 35, imgSrc: "/store/z.DESIGN4 (1).webp" },
        { title: "ANTI-SHIRT", description: "EXACTLY WHAT IT LOOKS LIKE", price: 35, imgSrc: "/store/z.DESIGN5 (1)-1.webp" },
        { title: "GOT ANY WEED?", description: "FIND A PLUG NEAR YOU WITH THIS T-SHIRT", price: 35, imgSrc: "/store/z.DESIGN6 (1)-2.webp" },
        { title: "SOBER SELEBRITY", description: "COMING SOON?", price: 35, imgSrc: "/store/z.DESIGN8 (1)-1.webp" },
        { title: "[USELESS RADIO] ", description: "I WANTED TO MAKE A GAP T-SHIRT", price: 35, imgSrc: "/store/z.DESIGN10 (1).webp" },
        { title: "CHIPPY BEAVER", description: "WEAR OUR BELOVED BEAVER ON YOUR CHEST.", price: 35, imgSrc: "/store/z.DESIGN11 (1)-1.webp" },
        { title: "WEBPAGE", description: "THIS IS THE BEST TEE ON THE SITE!", price: 35, imgSrc: "/store/z.DESIGN12 (1)-1.webp" },
        { title: "2046", description: "PRAISE BE OUR BELOVED B6", price: 35, imgSrc: "/store/z.DESIGN14.webp" }
    ];

    // Cart setup
    let cart = [];

    const cartIcon = document.getElementById("header-cart");
    const cartCount = document.getElementById("cart-count");
    const cartContainer = document.getElementById("cart-container");
    const cartItemsContainer = document.getElementById("cart-items");
    const paypalContainer = document.getElementById("paypal-button-container");

    cartIcon.addEventListener("click", () => {
        const isVisible = cartContainer.style.display === "block";
        if (isVisible) {
            cartContainer.style.display = "none";
            return;
        }
        cartContainer.style.display = "block";
        renderCart();
    });

    function updateCartCount() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = count;
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCartCount();
        renderCart();
    }

    function clearCart() {
        if (confirm('Clear all items from cart?')) {
            cart = [];
            updateCartCount();
            renderCart();
        }
    }

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        paypalContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>No items yet!</p>';
            return;
        }

        cart.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div>
                        <p style="margin: 0;"><strong>${item.title}</strong> (${item.size}) x ${item.quantity}</p>
                        <p style="margin: 0;">$${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button onclick="removeFromCart(${index})" style="background: red; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });

        // Add clear cart button
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear Cart';
        clearBtn.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 10px; background: #dc3545; color: white; border: none; cursor: pointer; border-radius: 5px;';
        clearBtn.onclick = clearCart;
        cartItemsContainer.appendChild(clearBtn);

        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = 0.00; // Set your shipping fee
        const tax = subtotal * 0.07; // 7% tax rate (adjust to your rate)
        const total = subtotal + shipping + tax;

        // Display breakdown in cart
        const breakdownDiv = document.createElement('div');
        breakdownDiv.innerHTML = `
            <hr>
            <p>Subtotal: $${subtotal.toFixed(2)}</p>
            <p>Shipping: $${shipping.toFixed(2)}</p>
            <p>Tax: $${tax.toFixed(2)}</p>
            <p><strong>Total: $${total.toFixed(2)}</strong></p>
        `;
        cartItemsContainer.appendChild(breakdownDiv);

        const checkoutBtn = document.createElement('button');
        checkoutBtn.textContent = 'Checkout';
        checkoutBtn.style.cssText = 'width:100%;padding:14px;background:#635bff;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:16px;font-weight:bold;margin-top:10px;';
        checkoutBtn.onclick = async () => {
            checkoutBtn.disabled = true;
            checkoutBtn.textContent = 'Loading...';
            try {
                const res = await fetch('/api/store-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cart }),
                });
                const json = await res.json();
                if (json.url) {
                    // Stripe Checkout refuses to render inside an iframe — when the
                    // store is embedded in the desktop Store window, break out to
                    // the top-level page (same origin, so this is allowed).
                    try {
                        (window.top || window).location.href = json.url;
                    } catch (err) {
                        window.open(json.url, '_blank');
                    }
                } else {
                    throw new Error(json.message || 'Checkout failed');
                }
            } catch (e) {
                checkoutBtn.disabled = false;
                checkoutBtn.textContent = 'Checkout';
                alert('Checkout error: ' + e.message);
            }
        };
        paypalContainer.appendChild(checkoutBtn);
    }
// Make functions globally accessible for inline onclick
    window.removeFromCart = removeFromCart;
    window.clearCart = clearCart;
    // Modal setup
    document.querySelectorAll(".shirt").forEach((shirt, index) => {
        shirt.addEventListener("click", () => {
            const modal = document.getElementById("image-modal");
            const modalImage = document.getElementById("modal-image");
            const modalTitle = document.getElementById("modal-title");
            const modalDescription = document.getElementById("modal-description");
            const modalPrice = document.getElementById("modal-price");
            const shirtQuantity = document.getElementById("shirt-quantity");
            const shirtSize = document.getElementById("shirt-size");
            const addToCartButton = document.getElementById("add-to-cart");

            const selectedShirt = shirts[index];

            modal.style.display = "flex";
            modalImage.src = selectedShirt.imgSrc;
            modalTitle.textContent = selectedShirt.title;
            modalDescription.textContent = selectedShirt.description;
            modalPrice.textContent = selectedShirt.price.toFixed(2);
            shirtQuantity.value = 1;
            shirtSize.value = "M";

            addToCartButton.onclick = () => {
                const quantity = parseInt(shirtQuantity.value);
                const size = shirtSize.value;
                if (isNaN(quantity) || quantity <= 0) return;

                const existingItem = cart.find(item => item.title === selectedShirt.title && item.size === size);
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    cart.push({
                        title: selectedShirt.title,
                        price: selectedShirt.price,
                        quantity: quantity,
                        size: size
                    });
                }

                updateCartCount();
                renderCart();
                alert(`${selectedShirt.title} (Size ${size}) x${quantity} added to cart!`);
            };
        });
    });

    // Modal close
    document.getElementById("close-modal").addEventListener("click", () => {
        document.getElementById("image-modal").style.display = "none";
    });

    window.addEventListener("click", (event) => {
        const modal = document.getElementById("image-modal");
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Lazy-load shirt images one at a time as they enter the viewport
    const shirtImgs = document.querySelectorAll('img.shirt[data-src]');
    const imgObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                obs.unobserve(img);
            }
        });
    }, { rootMargin: '100px' });
    shirtImgs.forEach(img => imgObserver.observe(img));
});