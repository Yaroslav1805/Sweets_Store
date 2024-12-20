document.querySelectorAll('.order-button').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = button.getAttribute('data-price');
        
        // Перенаправление на страницу корзины с передачей параметров товара
        window.location.href = `main.html?name=${encodeURIComponent(name)}&price=${encodeURIComponent(price)}`;
    });
});