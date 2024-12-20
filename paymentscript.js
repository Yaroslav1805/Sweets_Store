// Получение параметра из URL
const urlParams = new URLSearchParams(window.location.search);
const total = urlParams.get('total');

// Отображение суммы на странице
const totalPriceElement = document.getElementById('total-price');
if (total) {
    totalPriceElement.textContent = total;
} else {
    totalPriceElement.textContent = '0';
}

// Селекторы формы
const form = document.getElementById('payment-form');
const inputs = form.querySelectorAll('input[required]');
const payButton = document.getElementById('pay-button');

// Проверка заполненности полей
function validateForm() {
    let allFieldsFilled = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            allFieldsFilled = false;
        }
    });
    payButton.disabled = !allFieldsFilled;
}

// Добавляем обработчик на изменение полей
inputs.forEach(input => {
    input.addEventListener('input', validateForm);
});

// Обработчик кнопки "Оплатить сейчас"
payButton.addEventListener('click', () => {
    alert('Оплата успешно выполнена!');
    window.location.href = 'index.html'; // Возвращаемся на главную страницу
});