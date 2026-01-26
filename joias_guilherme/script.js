// --- script.js ATUALIZADO ---

// 1. Inicialização
let cart = JSON.parse(localStorage.getItem('ggoldCart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    injectCartHTML();
});

// 2. Menu Mobile (NOVO)
function toggleMenu() {
    const menuOverlay = document.getElementById('mobileMenuOverlay');
    if (menuOverlay) {
        menuOverlay.classList.toggle('active');
    }
}

// 3. Carrinho
function addToCart(name, price, image) {
    const product = { id: Date.now(), name, price, image };
    cart.push(product);
    localStorage.setItem('ggoldCart', JSON.stringify(cart));
    updateCartCount();
    showToast(`Adicionado à sacola`);
    openCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('ggoldCart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
}

function updateCartCount() {
    const countSpan = document.getElementById('cart-count');
    if (countSpan) {
        countSpan.innerText = cart.length;
        countSpan.style.display = cart.length > 0 ? 'flex' : 'none';
    }
}

function openCart() {
    renderCartItems();
    document.getElementById('cart-sidebar').classList.add('active');
    document.getElementById('cart-overlay').classList.add('active');
}

function closeCart() {
    document.getElementById('cart-sidebar').classList.remove('active');
    document.getElementById('cart-overlay').classList.remove('active');
}

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-price');
    container.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">Sua sacola está vazia.</p>';
    } else {
        cart.forEach(item => {
            total += item.price;
            container.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div style="flex:1">
                        <h4 style="font-size:0.9rem; margin-bottom:5px;">${item.name}</h4>
                        <p style="font-size:0.85rem; font-weight:bold;">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <button onclick="removeFromCart(${item.id})" class="btn-remove">&times;</button>
                </div>
            `;
        });
    }
    if(totalEl) totalEl.innerText = 'R$ ' + total.toFixed(2).replace('.', ',');
}

// 4. WhatsApp Checkout (SEU NÚMERO)
function checkoutWhatsApp() {
    if (cart.length === 0) return alert("Sacola vazia!");
    
    let message = "Olá! Gostaria de finalizar meu pedido na Ggold:\n\n";
    let total = 0;
    cart.forEach(item => {
        message += `- ${item.name}: R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
        total += item.price;
    });
    message += `\n*Total: R$ ${total.toFixed(2).replace('.', ',')}*`;
    
    const phoneNumber = "5551999902936"; 
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
}

// 5. Toast
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2000);
}

// 6. HTML Injection
function injectCartHTML() {
    if (!document.getElementById('cart-sidebar')) {
        const html = `
            <div id="cart-overlay" class="cart-overlay" onclick="closeCart()"></div>
            <div id="cart-sidebar" class="cart-sidebar">
                <div class="cart-header">
                    <h3>Sua Sacola</h3>
                    <button onclick="closeCart()" class="close-cart">&times;</button>
                </div>
                <div id="cart-items-container" class="cart-body"></div>
                <div class="cart-footer">
                    <div class="cart-total"><span>Total:</span><span id="cart-total-price">R$ 0,00</span></div>
                    <button onclick="checkoutWhatsApp()" class="btn-checkout">Finalizar no WhatsApp</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }
}