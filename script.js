// script.js

// Global variables
let currentUser = null;
let cart = [];
let products = [];
let currentProduct = null;

// API Configuration - Update these URLs for your backend
const API_BASE_URL = 'http://localhost:8000/api'; // Django
// const API_BASE_URL = 'http://localhost:3000/api'; // Express.js

// Sample products data (replace with API calls)
const sampleProducts = [
    {
        id: 1,
        name: "Premium Laptop",
        description: "High-performance laptop perfect for coding and design work. Features the latest processor and ample storage.",
        price: 1299.99,
        category: "electronics",
        image: null,
        stock: 10
    },
    {
        id: 2,
        name: "Coding T-Shirt",
        description: "Comfortable cotton t-shirt with programming-themed designs. Perfect for developers.",
        price: 29.99,
        category: "clothing",
        image: null,
        stock: 50
    },
    {
        id: 3,
        name: "JavaScript Guide",
        description: "Complete guide to modern JavaScript development. From basics to advanced concepts.",
        price: 49.99,
        category: "books",
        image: null,
        stock: 25
    },
    {
        id: 4,
        name: "Wireless Mouse",
        description: "Ergonomic wireless mouse with precision tracking. Perfect for long coding sessions.",
        price: 79.99,
        category: "electronics",
        image: null,
        stock: 30
    },
    {
        id: 5,
        name: "Developer Hoodie",
        description: "Warm and comfortable hoodie with subtle tech branding. Perfect for cool weather coding.",
        price: 59.99,
        category: "clothing",
        image: null,
        stock: 20
    },
    {
        id: 6,
        name: "React Handbook",
        description: "Comprehensive guide to React development. Covers hooks, context, and best practices.",
        price: 39.99,
        category: "books",
        image: null,
        stock: 15
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load data from localStorage
    loadCartFromStorage();
    loadUserFromStorage();
    
    // Load sample products (replace with API call)
    products = sampleProducts;
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial page
    showPage('home');
    loadFeaturedProducts();
    updateCartCount();
    updateAuthLink();
}

function setupEventListeners() {
    // Modal close
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
    
    // Search
    document.getElementById('search-input').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            filterProducts();
        }
    });
}

// Navigation functions
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.style.display = 'none');
    
    // Show selected page
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.style.display = 'block';
    }
    
    // Load page content
    switch(pageId) {
        case 'home':
            loadFeaturedProducts();
            break;
        case 'products':
            loadProducts();
            break;
        case 'cart':
            loadCart();
            break;
        case 'login':
            if (currentUser) {
                showUserProfile();
            }
            break;
    }
}

// Product functions
function loadFeaturedProducts() {
    const featuredProducts = products.slice(0, 3);
    const grid = document.getElementById('featured-products-grid');
    grid.innerHTML = featuredProducts.map(product => createProductCard(product)).join('');
}

function loadProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = products.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    return `
        <div class="product-card" onclick="showProductDetail(${product.id})">
            <div class="product-image">
                ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<i class="fas fa-cube"></i>'}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description.substring(0, 80)}...</p>
                <div class="product-price">${product.price.toFixed(2)}</div>
                <button class="add-to-cart" onclick="addToCart(${product.id}, event)">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `;
}

function showProductDetail(productId) {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;
    
    const content = document.getElementById('product-detail-content');
    content.innerHTML = `
        <div class="product-detail">
            <div class="product-detail-image">
                ${currentProduct.image ? `<img src="${currentProduct.image}" alt="${currentProduct.name}">` : '<i class="fas fa-cube"></i>'}
            </div>
            <div class="product-detail-info">
                <h2>${currentProduct.name}</h2>
                <p>${currentProduct.description}</p>
                <div class="product-detail-price">${currentProduct.price.toFixed(2)}</div>
                <div class="quantity-selector">
                    <button onclick="changeQuantity(-1)">-</button>
                    <input type="number" id="quantity" value="1" min="1" max="${currentProduct.stock}">
                    <button onclick="changeQuantity(1)">+</button>
                </div>
                <p><strong>Stock:</strong> ${currentProduct.stock} items available</p>
                <p><strong>Category:</strong> ${currentProduct.category}</p>
                <button class="btn-primary" onclick="addToCartFromDetail()">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
                <button class="btn-secondary" onclick="showPage('products')" style="margin-left: 1rem;">
                    <i class="fas fa-arrow-left"></i> Back to Products
                </button>
            </div>
        </div>
    `;
    
    showPage('product-detail');
}

function changeQuantity(delta) {
    const quantityInput = document.getElementById('quantity');
    let newQuantity = parseInt(quantityInput.value) + delta;
    newQuantity = Math.max(1, Math.min(newQuantity, currentProduct.stock));
    quantityInput.value = newQuantity;
}

function filterProducts() {
    const category = document.getElementById('category-filter').value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    let filteredProducts = products;
    
    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            p.description.toLowerCase().includes(searchTerm)
        );
    }
    
    const grid = document.getElementById('products-grid');
    grid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
}

// Cart functions
function addToCart(productId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity += 1;
        } else {
            showMessage('Cannot add more items. Stock limit reached.', 'error');
            return;
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image
        });
    }
    
    updateCartCount();
    saveCartToStorage();
    showMessage(`${product.name} added to cart!`, 'success');
}

function addToCartFromDetail() {
    if (!currentProduct) return;
    
    const quantity = parseInt(document.getElementById('quantity').value);
    const existingItem = cart.find(item => item.id === currentProduct.id);
    
    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity <= currentProduct.stock) {
            existingItem.quantity = newQuantity;
        } else {
            showMessage('Cannot add more items. Stock limit reached.', 'error');
            return;
        }
    } else {
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            quantity: quantity,
            image: currentProduct.image
        });
    }
    
    updateCartCount();
    saveCartToStorage();
    showMessage(`${currentProduct.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    saveCartToStorage();
    loadCart();
    showMessage('Item removed from cart', 'info');
}

function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (item && product) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else if (newQuantity <= product.stock) {
            item.quantity = newQuantity;
            updateCartCount();
            saveCartToStorage();
            loadCart();
        } else {
            showMessage('Quantity exceeds available stock', 'error');
        }
    }
}

function loadCart() {
    const cartContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Add some products to get started!</p>
                <button class="btn-primary" onclick="showPage('products')">Shop Now</button>
            </div>
        `;
        totalElement.textContent = '0.00';
        return;
    }
    
    cartContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<i class="fas fa-cube"></i>'}
            </div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.price.toFixed(2)} each</p>
            </div>
            <div class="quantity-controls">
                <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <div class="cart-item-price">${(item.price * item.quantity).toFixed(2)}</div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalElement.textContent = total.toFixed(2);
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showMessage('Your cart is empty', 'error');
        return;
    }
    
    if (!currentUser) {
        showMessage('Please login to proceed with checkout', 'info');
        showPage('login');
        return;
    }
    
    loadCheckout();
    showPage('checkout');
}

function loadCheckout() {
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');
    
    checkoutItems.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <span>${item.name} (${item.quantity}x)</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutTotal.textContent = total.toFixed(2);
}

// Authentication functions
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simulate API call (replace with actual API call)
    simulateLogin(email, password)
        .then(user => {
            currentUser = user;
            saveUserToStorage();
            updateAuthLink();
            showMessage('Login successful!', 'success');
            showPage('home');
        })
        .catch(error => {
            showMessage(error.message, 'error');
        });
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    // Simulate API call (replace with actual API call)
    simulateRegister(name, email, password)
        .then(user => {
            currentUser = user;
            saveUserToStorage();
            updateAuthLink();
            showMessage('Registration successful!', 'success');
            showPage('home');
        })
        .catch(error => {
            showMessage(error.message, 'error');
        });
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthLink();
    showMessage('Logged out successfully', 'info');
    showPage('home');
}

function showLoginForm() {
    document.getElementById('login-form-container').style.display = 'block';
    document.getElementById('register-form-container').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('register-form-container').style.display = 'block';
}

function updateAuthLink() {
    const authLink = document.getElementById('auth-link');
    if (currentUser) {
        authLink.innerHTML = `${currentUser.name} <span onclick="logout()" style="margin-left: 10px; cursor: pointer;">(Logout)</span>`;
        authLink.onclick = () => showUserProfile();
    } else {
        authLink.innerHTML = 'Login';
        authLink.onclick = () => showPage('login');
    }
}

function showUserProfile() {
    // Show user profile/orders page
    showMessage('User profile feature coming soon!', 'info');
}

// Order processing
function handleCheckout(e) {
    e.preventDefault();
    
    const orderData = {
        user: currentUser,
        items: cart,
        shipping: {
            name: document.getElementById('shipping-name').value,
            email: document.getElementById('shipping-email').value,
            address: document.getElementById('shipping-address').value
        },
        payment: {
            method: document.getElementById('payment-method').value
        },
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    // Simulate order processing (replace with actual API call)
    simulateOrderProcessing(orderData)
        .then(order => {
            cart = [];
            updateCartCount();
            saveCartToStorage();
            showOrderConfirmation(order);
        })
        .catch(error => {
            showMessage(error.message, 'error');
        });
}

function showOrderConfirmation(order) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div class="order-confirmation">
            <h2><i class="fas fa-check-circle" style="color: green;"></i> Order Confirmed!</h2>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
            <p>Thank you for your purchase! You will receive a confirmation email shortly.</p>
            <button class="btn-primary" onclick="closeModal(); showPage('home');">Continue Shopping</button>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Utility functions
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        ${message}
        <button style="float: right; background: none; border: none; font-size: 1.2rem; cursor: pointer;" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.insertBefore(messageDiv, document.body.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
}

function openModal() {
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Storage functions
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function saveUserToStorage() {
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

function loadUserFromStorage() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
}

// Simulate API calls (replace these with actual API calls)
function simulateLogin(email, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email === 'test@example.com' && password === 'password') {
                resolve({
                    id: 1,
                    name: 'Test User',
                    email: email
                });
            } else {
                reject(new Error('Invalid credentials'));
            }
        }, 1000);
    });
}

function simulateRegister(name, email, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email && password && name) {
                resolve({
                    id: Date.now(),
                    name: name,
                    email: email
                });
            } else {
                reject(new Error('Registration failed'));
            }
        }, 1000);
    });
}

function simulateOrderProcessing(orderData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (orderData.items.length > 0) {
                resolve({
                    id: 'ORD' + Date.now(),
                    total: orderData.total,
                    status: 'confirmed'
                });
            } else {
                reject(new Error('Order processing failed'));
            }
        }, 2000);
    });
}

// API Integration functions (uncomment and modify for your backend)
/*
async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

async function loginUser(credentials) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || 'Login failed');
        }
    } catch (error) {
        throw error;
    }
}

async function registerUser(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (error) {
        throw error;
    }
}

async function createOrder(orderData) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(orderData)
        });
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || 'Order creation failed');
        }
    } catch (error) {
        throw error;
    }
}
*/