module.exports = {
    bestbuy: {
        titles: ['h1.h4'],
        prices: ['[data-lu-target="customer_price"]']
    },
    amazon: {
        titles: ['#productTitle'],
        prices: ['.a-offscreen']
    },
    target: {
        titles: [
            '[data-test="productTitle"]',
            '[data-test="product-title"]'
        ],
        prices: ['[data-test="product-price"]']
    },
    walmart: {
        titles: ['[itemprop="name"]'],
        prices: ['[data-testid="price-wrap"]']
    },
    macys: {
        titles: ['.product-title span.body'],
        prices: ['span[aria-label^="Current Price"]']
    }
};