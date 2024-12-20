document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Отменяет стандартное поведение ссылки
        // Плавный скроллинг до соответствующей секции
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

document.getElementById('back-to-shop').addEventListener('click', () => {
    window.location.href = 'shop.html'; // Переход на shop.html
});


const cartPanel = document.querySelector('.cart-panel');
const toggleCartButton = document.querySelector('.toggle-cart');
const closeCartButton = document.getElementById('close-cart');
const cartItemsContainer = document.querySelector('.cart-items');
const totalPriceElement = document.querySelector('.total-price');
const checkoutButton = document.querySelector('.checkout-button');
let totalPrice = 0;

toggleCartButton.addEventListener('click', () => {
    // Переключение видимости корзины
    cartPanel.classList.toggle('active');
});

closeCartButton.addEventListener('click', () => {
    cartPanel.classList.remove('active');
});


// Получение параметров из URL
const params = new URLSearchParams(window.location.search);
const name = params.get('name');
const price = params.get('price');
const totalPriceEl = document.querySelector('.total-price');

// Если передан товар, добавляем его в корзину
if (name && price) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
        <span>${name}</span>
        <span>${price} руб</span>
        <button class="remove-from-cart">Удалить</button>
    `;

    // Обработчик для удаления товара
    cartItem.querySelector('.remove-from-cart').addEventListener('click', () => {
        cartItem.remove();
        totalPrice -= parseInt(price, 10);
        updateTotalPrice();
    });

    cartItemsContainer.appendChild(cartItem);
    totalPrice += parseInt(price, 10);
    updateTotalPrice();
}

function updateTotalPrice() {
    totalPriceEl.textContent = totalPrice;
}

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const item = button.closest('.item');
        const name = item.querySelector('p').textContent;
        const price = parseInt(button.getAttribute('data-price'), 10);

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <span>${name}</span>
            <span>${price} ₽</span>
            <button class="remove-from-cart">Удалить</button>
        `;

        cartItem.querySelector('.remove-from-cart').addEventListener('click', () => {
            cartItem.remove();
            totalPrice -= price;
            updateTotalPrice();
        });

        cartItemsContainer.appendChild(cartItem);
        totalPrice += price;
        updateTotalPrice();
    });
});

checkoutButton.addEventListener('click', () => {
    window.location.href = `payment.html?total=${totalPrice}`;
});

function updateTotalPrice() {
    totalPriceElement.textContent = totalPrice;
}
