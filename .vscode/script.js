const products = [
    {id:1, name:"Wireless Headphones", category:"Electronics", price:1299, oldPrice:1999, rating:4.5, emoji:"🎧", badge:"BESTSELLER"},
    {id:2, name:"Smart Watch", category:"Electronics", price:1799, oldPrice:2499, rating:4.4, emoji:"⌚", badge:"SALE"},
    {id:3, name:"Running Shoes", category:"Fashion", price:1499, oldPrice:2299, rating:4.3, emoji:"👟", badge:"POPULAR"},
    {id:4, name:"Classic T-Shirt", category:"Fashion", price:499, oldPrice:799, rating:4.2, emoji:"👕", badge:"SALE"},
    {id:5, name:"Travel Backpack", category:"Accessories", price:899, oldPrice:1299, rating:4.6, emoji:"🎒", badge:"TRENDING"},
    {id:6, name:"Bluetooth Speaker", category:"Electronics", price:999, oldPrice:1499, rating:4.4, emoji:"🔊", badge:"SALE"},
    {id:7, name:"Sunglasses", category:"Accessories", price:399, oldPrice:699, rating:4.1, emoji:"🕶️", badge:"NEW"},
    {id:8, name:"Coffee Mug", category:"Home", price:249, oldPrice:399, rating:4.0, emoji:"☕", badge:"DEAL"},
    {id:9, name:"Desk Lamp", category:"Home", price:699, oldPrice:999, rating:4.3, emoji:"💡", badge:"SALE"},
    {id:10, name:"Gaming Controller", category:"Electronics", price:1599, oldPrice:2199, rating:4.7, emoji:"🎮", badge:"TOP RATED"},
    {id:11, name:"Sports Cap", category:"Fashion", price:299, oldPrice:499, rating:4.1, emoji:"🧢", badge:"NEW"},
    {id:12, name:"Digital Camera", category:"Electronics", price:4999, oldPrice:5999, rating:4.8, emoji:"📷", badge:"PREMIUM"}
];

const $ = id => document.getElementById(id);

function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        return fallback;
    }
}

let cart = loadData("shopSmartCart", []);
let wishlist = loadData("shopSmartWishlist", []);
let currentCategory = "All";
let searchText = "";
let toastTimer;

function saveData() {
    localStorage.setItem("shopSmartCart", JSON.stringify(cart));
    localStorage.setItem("shopSmartWishlist", JSON.stringify(wishlist));
}

function money(amount) {
    return "₹" + amount.toLocaleString("en-IN");
}

function showToast(message) {
    $("toast").textContent = message;
    $("toast").classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        $("toast").classList.remove("show");
    }, 2200);
}

function getProduct(id) {
    return products.find(product => product.id === Number(id));
}

function renderProducts() {
    let filtered = products.filter(product => {
        const matchesCategory =
            currentCategory === "All" ||
            product.category === currentCategory;

        const matchesSearch =
            product.name.toLowerCase().includes(searchText) ||
            product.category.toLowerCase().includes(searchText);

        return matchesCategory && matchesSearch;
    });

    const sort = $("sortSelect").value;

    if (sort === "low") filtered.sort((a,b) => a.price - b.price);
    if (sort === "high") filtered.sort((a,b) => b.price - a.price);
    if (sort === "rating") filtered.sort((a,b) => b.rating - a.rating);

    $("productGrid").innerHTML = filtered.map(product => {
        const wished = wishlist.includes(product.id);
        const discount = Math.round(
            (1 - product.price / product.oldPrice) * 100
        );

        return `
            <article class="product-card">
                <span class="product-badge">${product.badge}</span>

                <button class="wish-btn ${wished ? "active" : ""}"
                        data-action="wish"
                        data-id="${product.id}"
                        aria-label="Add ${product.name} to wishlist">
                    ${wished ? "❤️" : "🤍"}
                </button>

                <div class="product-image">${product.emoji}</div>

                <span class="product-category">${product.category}</span>
                <h3>${product.name}</h3>

                <div class="rating">
                    ★★★★★ <span>${product.rating}/5</span>
                </div>

                <div class="price-row">
                    <span class="price">${money(product.price)}</span>
                    <span class="old-price">${money(product.oldPrice)}</span>
                    <span class="discount">${discount}% OFF</span>
                </div>

                <button class="add-btn"
                        data-action="add"
                        data-id="${product.id}">
                    🛒 Add to Cart
                </button>
            </article>
        `;
    }).join("");

    $("emptyMessage").hidden = filtered.length !== 0;
}

function updateCounts() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

    $("cartCount").textContent = totalItems;
    $("wishCount").textContent = wishlist.length;
}

function renderCart() {
    if (cart.length === 0) {
        $("cartItems").innerHTML =
            '<p class="panel-empty">🛒 Your cart is empty.</p>';
    } else {
        $("cartItems").innerHTML = cart.map(item => {
            const product = getProduct(item.id);
            if (!product) return "";

            return `
                <div class="cart-item">
                    <div class="cart-emoji">${product.emoji}</div>

                    <div>
                        <h4>${product.name}</h4>
                        <p>${money(product.price)} each</p>

                        <div class="quantity-controls">
                            <button data-action="decrease"
                                    data-id="${product.id}">−</button>

                            <span>${item.qty}</span>

                            <button data-action="increase"
                                    data-id="${product.id}">+</button>
                        </div>

                        <button class="remove-btn"
                                data-action="remove"
                                data-id="${product.id}">
                            Remove
                        </button>
                    </div>

                    <strong>${money(product.price * item.qty)}</strong>
                </div>
            `;
        }).join("");
    }

    const total = cart.reduce((sum, item) => {
        const product = getProduct(item.id);
        return sum + (product ? product.price * item.qty : 0);
    }, 0);

    $("cartTotal").textContent = money(total);
    $("checkoutBtn").disabled = cart.length === 0;

    updateCounts();
}

function renderWishlist() {
    if (wishlist.length === 0) {
        $("wishlistItems").innerHTML =
            '<p class="panel-empty">❤️ Your wishlist is empty.</p>';
    } else {
        $("wishlistItems").innerHTML = wishlist.map(id => {
            const product = getProduct(id);
            if (!product) return "";

            return `
                <div class="cart-item">
                    <div class="cart-emoji">${product.emoji}</div>

                    <div>
                        <h4>${product.name}</h4>
                        <p>${money(product.price)}</p>

                        <button class="remove-btn"
                                data-action="wish"
                                data-id="${product.id}">
                            Remove from Wishlist
                        </button>

                        <button class="remove-btn"
                                data-action="add"
                                data-id="${product.id}">
                            + Add to Cart
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }

    updateCounts();
}

function addToCart(id) {
    const product = getProduct(id);
    if (!product) return;

    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({id: product.id, qty: 1});
    }

    saveData();
    renderCart();
    showToast(product.name + " added to cart!");
}

function toggleWishlist(id) {
    id = Number(id);

    if (wishlist.includes(id)) {
        wishlist = wishlist.filter(item => item !== id);
        showToast("Removed from wishlist.");
    } else {
        wishlist.push(id);
        showToast("Added to wishlist ❤️");
    }

    saveData();
    renderProducts();
    renderWishlist();
}

function changeQuantity(id, amount) {
    const item = cart.find(item => item.id === Number(id));
    if (!item) return;

    item.qty += amount;

    if (item.qty <= 0) {
        cart = cart.filter(item => item.id !== Number(id));
    }

    saveData();
    renderCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== Number(id));
    saveData();
    renderCart();
    showToast("Product removed from cart.");
}

function openPanel(panelId) {
    $("cartPanel").classList.remove("open");
    $("wishlistPanel").classList.remove("open");

    $(panelId).classList.add("open");
    $("overlay").classList.add("show");
}

function closePanels() {
    $("cartPanel").classList.remove("open");
    $("wishlistPanel").classList.remove("open");
    $("overlay").classList.remove("show");
}

// Event delegation for product cards and cart items.
document.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "add") addToCart(id);
    if (action === "wish") toggleWishlist(id);
    if (action === "increase") changeQuantity(id, 1);
    if (action === "decrease") changeQuantity(id, -1);
    if (action === "remove") removeFromCart(id);
});

// Category navigation.
document.querySelector(".navbar").addEventListener("click", event => {
    const link = event.target.closest("[data-category]");
    if (!link) return;

    event.preventDefault();

    currentCategory = link.dataset.category;

    document.querySelectorAll(".navbar a").forEach(item => {
        item.classList.toggle("active", item === link);
    });

    $("sectionTitle").textContent =
        currentCategory === "All"
            ? "Trending Products"
            : currentCategory + " Products";

    renderProducts();
    $("products").scrollIntoView({behavior: "smooth"});
});

// Search.
function performSearch() {
    searchText = $("searchInput").value.trim().toLowerCase();
    renderProducts();
    $("products").scrollIntoView({behavior: "smooth"});
}

$("searchBtn").addEventListener("click", performSearch);

$("searchInput").addEventListener("input", () => {
    searchText = $("searchInput").value.trim().toLowerCase();
    renderProducts();
});

$("searchInput").addEventListener("keydown", event => {
    if (event.key === "Enter") performSearch();
});

// Sorting.
$("sortSelect").addEventListener("change", renderProducts);

// Cart and wishlist panels.
$("cartBtn").addEventListener("click", () => {
    renderCart();
    openPanel("cartPanel");
});

$("wishlistBtn").addEventListener("click", () => {
    renderWishlist();
    openPanel("wishlistPanel");
});

$("overlay").addEventListener("click", closePanels);

document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", closePanels);
});

// Dark mode.
if (localStorage.getItem("shopSmartDark") === "true") {
    document.body.classList.add("dark");
    $("themeBtn").textContent = "☀️";
}

$("themeBtn").addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    localStorage.setItem("shopSmartDark", String(isDark));
    $("themeBtn").textContent = isDark ? "☀️" : "🌙";
});

// Demo checkout — no real payment is taken.
$("checkoutBtn").addEventListener("click", () => {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => {
        const product = getProduct(item.id);
        return sum + (product ? product.price * item.qty : 0);
    }, 0);

    const confirmed = confirm(
        "Demo Checkout\n\n" +
        "Total Amount: " + money(total) +
        "\n\nPlace this demo order?"
    );

    if (confirmed) {
        cart = [];
        saveData();
        renderCart();
        closePanels();

        showToast("Demo order placed successfully! 🎉");
    }
});

// Demo newsletter — does not send email to a server.
$("newsletterForm").addEventListener("submit", event => {
    event.preventDefault();

    const email = $("emailInput").value.trim();

    if (!email) return;

    showToast("Thanks for subscribing! 🎉");
    $("newsletterForm").reset();
});

// Initial page setup.
renderProducts();
renderCart();
renderWishlist();
updateCounts();