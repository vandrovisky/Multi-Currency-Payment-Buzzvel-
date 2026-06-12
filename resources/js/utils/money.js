export function formatMoney(amount, currency) {
    return new Intl.NumberFormat('en', {
        style: 'currency',
        currency,
    }).format(amount);
}

export function formatRate(rate) {
    return Number(rate).toLocaleString('en', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
    });
}
