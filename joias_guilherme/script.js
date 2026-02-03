// --- script.js ATUALIZADO ---

// 1. Inicialização
let cart = JSON.parse(localStorage.getItem('ggoldCart')) || [];
const PRICE_ADJUSTMENT = -0.0;
let priceAdjustmentApplied = false;

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    injectCartHTML();
    initProductModal();
    applyPriceAdjustment();
    updateAllPriceInfos();
    initAddToCartOverride();
    initProductControls();
});

// 2. Menu Mobile (NOVO)
function toggleMenu() {
    const menuOverlay = document.getElementById('mobileMenuOverlay');
    if (menuOverlay) {
        menuOverlay.classList.toggle('active');
    }
}

function toggleDesktopDropdown(button) {
    const dropdown = button.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('open');
    }
}

function toggleMobileDropdown(dropdownId, toggleEl) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
    if (toggleEl) {
        toggleEl.classList.toggle('open');
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
    
    const phoneNumber = "5551994273111"; 
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

// 7. Modal de Produto (Detalhes)
function initProductModal() {
    injectProductModalHTML();

    document.body.addEventListener('click', (event) => {
        // Detectar clique em imagens do carrossel ou imagens normais
        const img = event.target.closest('.carousel-images img, .img-container-black > img');
        
        // Ignorar se clicou nos botões do carrossel ou botão adicionar
        if (event.target.closest('.carousel-nav, .carousel-dot, .btn-add-cart')) return;
        
        if (img) {
            // Abrir modal do produto
            openProductModal(img);
            return;
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeProductModal();
            closeImageLightbox();
        }
    });
}

function injectProductModalHTML() {
    if (document.getElementById('product-modal')) return;

    const html = `
        <div id="product-modal-overlay" class="product-modal-overlay" onclick="closeProductModal()"></div>
        <div id="product-modal" class="product-modal" aria-hidden="true" role="dialog">
            <button class="product-modal-close" onclick="closeProductModal()" aria-label="Fechar">&times;</button>
            <div class="product-modal-content">
                <div class="product-modal-image">
                    <div id="product-modal-carousel-container"></div>
                </div>
                <div class="product-modal-info">
                    <h3 id="product-modal-title"></h3>
                    <div class="product-modal-price-row">
                        <span id="product-modal-price" class="product-modal-price product-modal-price--original"></span>
                        <span id="product-modal-price-pix" class="product-modal-price-pix"></span>
                    </div>
                    <div id="product-modal-price-info" class="price-info"></div>
                    <p id="product-modal-desc" class="product-modal-desc">Banhado a ouro 18k.</p>
                    <button id="product-modal-add" class="product-modal-add">Adicionar à sacola</button>
                </div>
            </div>
        </div>
        <div id="image-lightbox" class="image-lightbox" aria-hidden="true" role="dialog">
            <button class="image-lightbox-close" onclick="closeImageLightbox()" aria-label="Fechar">&times;</button>
            <img id="image-lightbox-img" src="" alt="Imagem ampliada">
        </div>
        <div id="image-lightbox-overlay" class="image-lightbox-overlay" onclick="closeImageLightbox()"></div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
}

function openProductModal(img) {
    const card = img.closest('.product-card');
    if (!card) return;

    const titleEl = card.querySelector('.product-info h3');
    const priceEl = card.querySelector('.product-info .price');
    const title = titleEl ? titleEl.textContent.trim() : 'Produto';
    const priceText = priceEl ? priceEl.textContent.trim() : 'R$ 0,00';
    const price = parsePrice(priceText);

    // Verificar se tem carrossel ou imagem única
    const carousel = card.querySelector('.img-carousel');
    const modalCarouselContainer = document.getElementById('product-modal-carousel-container');
    
    if (carousel) {
        // Produto tem múltiplas imagens - criar carrossel no modal
        const images = carousel.querySelectorAll('.carousel-images img');
        const imagesSrc = Array.from(images).map(img => img.src);
        
        let carouselHTML = `
            <div class="img-carousel" id="modal-carousel">
                <div class="carousel-images">
                    ${imagesSrc.map(src => `<img src="${src}" alt="${title}">`).join('')}
                </div>
                <button class="carousel-nav carousel-prev">‹</button>
                <button class="carousel-nav carousel-next">›</button>
                <div class="carousel-dots">
                    ${imagesSrc.map((_, i) => `<span class="carousel-dot ${i === 0 ? 'active' : ''}"></span>`).join('')}
                </div>
            </div>
        `;
        
        modalCarouselContainer.innerHTML = carouselHTML;
        
        // Inicializar carrossel do modal
        setTimeout(() => {
            initCarousel('modal-carousel');
            
            // Adicionar evento de clique nas imagens do carrossel do modal
            const modalCarouselImages = document.querySelectorAll('#modal-carousel .carousel-images img');
            modalCarouselImages.forEach(modalImg => {
                modalImg.style.cursor = 'zoom-in';
                modalImg.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openImageLightboxDirect(modalImg);
                });
            });
        }, 100);
    } else {
        // Produto tem apenas 1 imagem
        const image = img.getAttribute('src');
        modalCarouselContainer.innerHTML = `<img id="product-modal-image" src="${image}" alt="${title}" style="cursor: zoom-in;">`;
        
        // Adicionar evento de clique na imagem do modal após inserir no DOM
        setTimeout(() => {
            const modalImage = document.getElementById('product-modal-image');
            if (modalImage) {
                modalImage.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openImageLightboxDirect(modalImage);
                });
            }
        }, 100);
    }

    const modal = document.getElementById('product-modal');
    const overlay = document.getElementById('product-modal-overlay');

    document.getElementById('product-modal-title').textContent = title;
    updateModalPriceRow(price, priceText);
    updateModalPriceInfo(price);
    resetModalImageZoom();

    const addBtn = document.getElementById('product-modal-add');
    addBtn.onclick = () => {
        closeProductModal();
        addToCart(title, price, imagesSrc ? imagesSrc[0] : image);
    };

    modal.classList.add('active');
    overlay.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    const overlay = document.getElementById('product-modal-overlay');
    if (!modal || !overlay) return;

    modal.classList.remove('active');
    overlay.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    resetModalImageZoom();
}

function parsePrice(priceText) {
    const cleaned = priceText.replace(/[^0-9,]/g, '').replace(',', '.');
    const value = parseFloat(cleaned);
    return Number.isNaN(value) ? 0 : value;
}

function formatPrice(value) {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function buildPriceInfoText(price) {
    const installment = formatPrice(price / 6);
    return {
        installmentText: `6x de ${installment} sem juros`,
        pixText: '10% OFF NO PIX'
    };
}

function updatePriceInfoElement(container, price) {
    if (!container) return;
    const { installmentText, pixText } = buildPriceInfoText(price);

    let installmentEl = container.querySelector('.price-installments');
    let pixEl = container.querySelector('.price-pix');

    if (!installmentEl) {
        installmentEl = document.createElement('span');
        installmentEl.className = 'price-installments';
        container.appendChild(installmentEl);
    }

    if (!pixEl) {
        pixEl = document.createElement('span');
        pixEl.className = 'price-pix';
        container.appendChild(pixEl);
    }

    installmentEl.textContent = installmentText;
    pixEl.textContent = pixText;
}

function updateAllPriceInfos() {
    document.querySelectorAll('.product-card').forEach(card => {
        const priceEl = card.querySelector('.product-info .price');
        if (!priceEl) return;

        const price = parsePrice(priceEl.textContent);
        if (!price) return;

        let infoEl = card.querySelector('.price-info');
        if (!infoEl) {
            infoEl = document.createElement('div');
            infoEl.className = 'price-info';
            priceEl.insertAdjacentElement('afterend', infoEl);
        }

        updatePriceInfoElement(infoEl, price);
    });
}

function updateModalPriceInfo(price) {
    const infoEl = document.getElementById('product-modal-price-info');
    if (!infoEl || !price) return;
    updatePriceInfoElement(infoEl, price);
}

function updateModalPriceRow(price, priceText) {
    const originalEl = document.getElementById('product-modal-price');
    const pixEl = document.getElementById('product-modal-price-pix');
    if (!originalEl || !pixEl) return;

    const originalText = priceText || formatPrice(price || 0);
    const pixPrice = price ? price * 0.9 : 0;

    originalEl.textContent = originalText;
    pixEl.textContent = `${formatPrice(pixPrice)} no Pix`;
}

function normalizeText(text) {
    if (!text) return '';
    return text
        .toString()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim();
}

function getCardTitle(card) {
    return card.querySelector('.product-info h3')?.textContent.trim() || '';
}

function getCardRef(card) {
    return card.querySelector('.product-ref')?.textContent.trim() || '';
}

function getCardPrice(card) {
    const priceEl = card.querySelector('.product-info .price, .product-info .product-price');
    const priceText = priceEl ? priceEl.textContent.trim() : 'R$ 0,00';
    return parsePrice(priceText);
}

function initProductControls() {
    const grids = document.querySelectorAll('.product-grid');
    if (!grids.length) return;

    grids.forEach((grid, index) => {
        if (grid.dataset.controlsInit === 'true') return;
        grid.dataset.controlsInit = 'true';

        const controls = document.createElement('div');
        controls.className = 'product-controls';
        controls.innerHTML = `
            <div class="product-controls-group">
                <label for="product-search-${index}">Pesquisar</label>
                <input id="product-search-${index}" type="search" placeholder="Pesquisar produto ou referência">
            </div>
            <div class="product-controls-group">
                <label for="product-sort-${index}">Classificar por</label>
                <select id="product-sort-${index}">
                    <option value="relevance">Padrão</option>
                    <option value="price-asc">Preço: menor para maior</option>
                    <option value="price-desc">Preço: maior para menor</option>
                    <option value="name-asc">Nome: A → Z</option>
                    <option value="name-desc">Nome: Z → A</option>
                </select>
            </div>
        `;

        const header = grid.previousElementSibling;
        if (header && header.classList.contains('page-header')) {
            header.insertAdjacentElement('afterend', controls);
        } else {
            grid.insertAdjacentElement('beforebegin', controls);
        }

        const cards = Array.from(grid.querySelectorAll('.product-card'));
        cards.forEach((card, cardIndex) => {
            card.dataset.originalIndex = cardIndex.toString();
            card.dataset.searchText = normalizeText(`${getCardTitle(card)} ${getCardRef(card)}`);
        });

        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'product-empty';
        emptyMessage.textContent = 'Nenhum produto encontrado.';
        emptyMessage.style.display = 'none';
        grid.insertAdjacentElement('afterend', emptyMessage);

        const searchInput = controls.querySelector(`#product-search-${index}`);
        const sortSelect = controls.querySelector(`#product-sort-${index}`);

        const applyFiltersAndSort = () => {
            const query = normalizeText(searchInput.value);
            let visibleCount = 0;

            cards.forEach(card => {
                const matches = !query || card.dataset.searchText.includes(query);
                card.style.display = matches ? '' : 'none';
                if (matches) visibleCount += 1;
            });

            const sortValue = sortSelect.value;
            const sorted = [...cards].sort((a, b) => {
                if (sortValue === 'price-asc') {
                    return getCardPrice(a) - getCardPrice(b);
                }
                if (sortValue === 'price-desc') {
                    return getCardPrice(b) - getCardPrice(a);
                }
                if (sortValue === 'name-asc') {
                    return getCardTitle(a).localeCompare(getCardTitle(b), 'pt-BR');
                }
                if (sortValue === 'name-desc') {
                    return getCardTitle(b).localeCompare(getCardTitle(a), 'pt-BR');
                }
                return Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex);
            });

            sorted.forEach(card => grid.appendChild(card));
            emptyMessage.style.display = visibleCount === 0 ? 'block' : 'none';
        };

        searchInput.addEventListener('input', applyFiltersAndSort);
        sortSelect.addEventListener('change', applyFiltersAndSort);
    });
}

function applyPriceAdjustment() {
    if (priceAdjustmentApplied) return;
    priceAdjustmentApplied = true;

    document.querySelectorAll('.product-card').forEach(card => {
        const priceEl = card.querySelector('.product-info .price');
        if (!priceEl) return;

        const rawPrice = parsePrice(priceEl.textContent);
        if (!rawPrice) return;

        const adjustedPrice = Math.max(0, +(rawPrice + PRICE_ADJUSTMENT).toFixed(2));
        priceEl.textContent = formatPrice(adjustedPrice);
        card.dataset.adjustedPrice = adjustedPrice.toFixed(2);

        const titleEl = card.querySelector('.product-info h3');
        if (titleEl) {
            card.dataset.productName = titleEl.textContent.trim();
        }
    });
}

function initAddToCartOverride() {
    document.addEventListener('click', (event) => {
        const button = event.target.closest('.btn-add-cart');
        if (!button) return;

        const card = button.closest('.product-card');
        if (!card) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        const name = card.dataset.productName || card.querySelector('.product-info h3')?.textContent.trim() || 'Produto';
        const price = card.dataset.adjustedPrice ? parseFloat(card.dataset.adjustedPrice) : parsePrice(card.querySelector('.product-info .price')?.textContent || 'R$ 0,00');
        const image = card.querySelector('.img-container-black img, .img-carousel .carousel-images img')?.src || '';

        addToCart(name, price, image);
    }, true);
}

function handleModalImageZoom(event) {
    const img = event.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    img.style.setProperty('--zoom-x', `${x}%`);
    img.style.setProperty('--zoom-y', `${y}%`);
    img.classList.add('zoom-active');
}

function resetModalImageZoom() {
    const img = document.getElementById('product-modal-image');
    if (!img) return;
    img.classList.remove('zoom-active');
    img.style.removeProperty('--zoom-x');
    img.style.removeProperty('--zoom-y');
}

function openModalImageInNewTab() {
    const img = document.getElementById('product-modal-image');
    if (!img || !img.src) return;
    window.open(img.src, '_blank');
}

function openImageLightbox() {
    const img = document.getElementById('product-modal-image');
    if (!img || !img.src) return;

    const lightbox = document.getElementById('image-lightbox');
    const overlay = document.getElementById('image-lightbox-overlay');
    const lightboxImg = document.getElementById('image-lightbox-img');

    if (!lightbox || !overlay || !lightboxImg) return;

    lightboxImg.setAttribute('src', img.src);
    lightboxImg.setAttribute('alt', img.alt || 'Imagem ampliada');
    lightbox.classList.add('active');
    overlay.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
}

function closeImageLightbox() {
    const lightbox = document.getElementById('image-lightbox');
    const overlay = document.getElementById('image-lightbox-overlay');
    if (!lightbox || !overlay) return;
    lightbox.classList.remove('active');
    overlay.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
}

function openImageLightboxDirect(img) {
    if (!img || !img.src) return;

    const lightbox = document.getElementById('image-lightbox');
    const overlay = document.getElementById('image-lightbox-overlay');
    const lightboxImg = document.getElementById('image-lightbox-img');

    if (!lightbox || !overlay || !lightboxImg) return;

    lightboxImg.setAttribute('src', img.src);
    lightboxImg.setAttribute('alt', img.alt || 'Imagem ampliada');
    lightbox.classList.add('active');
    overlay.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
}

// Função para controlar o carrossel de imagens
function initCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    
    const imagesContainer = carousel.querySelector('.carousel-images');
    const images = carousel.querySelectorAll('.carousel-images img');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const dots = carousel.querySelectorAll('.carousel-dot');
    
    let currentIndex = 0;
    let startX = 0;
    let isDragging = false;
    
    function goToSlide(index) {
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;
        
        currentIndex = index;
        imagesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }
    
    if (prevBtn) prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(currentIndex - 1);
    });
    
    if (nextBtn) nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(currentIndex + 1);
    });
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            goToSlide(index);
        });
    });
    
    // Suporte para touch/swipe em mobile
    carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });
    
    carousel.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
    }, { passive: false });
    
    carousel.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        
        // Se arrastou mais de 50px
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                // Arrastou para esquerda - próxima imagem
                goToSlide(currentIndex + 1);
            } else {
                // Arrastou para direita - imagem anterior
                goToSlide(currentIndex - 1);
            }
        }
        
        isDragging = false;
    });
    
    goToSlide(0);
}

// Inicializar todos os carrosséis ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.img-carousel').forEach((carousel) => {
        initCarousel(carousel.id);
    });
});
