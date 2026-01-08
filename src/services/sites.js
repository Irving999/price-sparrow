module.exports = {
    bestbuy: {
        title: 'h1.h4',
        price: '[data-lu-target="customer_price"]'
    },
    amazon: {
        title: '#product-title',
        price: '.a-offscreen'
    },
    target: {
        title: '[data-test="productTitle"]',
        price: '[data-test="product-price"]'
    },
    walmart: {
        title: '[itemprop="name"]',
        price: '[data-testid="price-wrap"]'
    },
    macys: {
        title: '.product-title span.body',
        price: 'span[aria-label^="Current Price"]'
    }
}