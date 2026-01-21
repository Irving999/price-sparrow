module.exports = {
    bestbuy: {
        titles: ['h1.h4'],
        prices: ['[data-lu-target="customer_price"]'],
        gallery: '.VJYXIrZT4D0Zj6vQ',
        images: 'img',
        error: [],
    },
    amazon: {
        titles: ['#productTitle'],
        prices: ['.a-offscreen'],
        gallery: '#main-image-container',
        images: '.image.item img',
        error: [],
    },
    target: {
        titles: [
            '[data-test="productTitle"]',
            '[data-test="product-title"]'
        ],
        prices: ['[data-test="product-price"]'],
        gallery: '[data-module-type="ProductDetailImageGallery"]',
        images: '[data-test^="image-gallery-item-"] img',
        error: [],
    },
    walmart: {
        titles: ['[itemprop="name"]'],
        prices: ['[data-testid="price-wrap"]'],
        error: [],
    },
    macys: {
        titles: ['.product-title span.body'],
        prices: ['span[aria-label^="Current Price"]'],
        gallery: '[aria-label="slideshow"]',
        images: 'source[media="(min-width: 1024px) and (max-width: 1279px)"][type="image/jpeg"]',
        error: ['.error-color'],
    }
}