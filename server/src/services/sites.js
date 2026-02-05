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
        gallery: '[data-testid="zoom-image"]',
        images: '[data-seo-id="hero-image"]',
        error: [],
    },
    macys: {
        titles: ['.product-title span.body'],
        prices: ['span[aria-label^="Current Price"]'],
        gallery: '[aria-label="slideshow"]',
        images: 'source[media="(min-width: 1024px) and (max-width: 1279px)"][type="image/jpeg"]',
        noScroll: true,
        error: ['.error-color'],
    },
    zara: {
        titles: ['[data-qa-qualifier="product-detail-info-name"]'],
        prices: ['[data-qa-qualifier="price-amount-current"] .money-amount__main'],
        gallery: '.product-detail-view__extra-images',
        images: '[data-qa-qualifier="media-image"] img',
        error: []
    },
    uniqlo: {
        titles: ['main [data-testid="ITOGutterContainer"] [data-testid="ITOTypography"]'],
        prices: ['main [aria-label^="price is"]'],
        gallery: '.media-gallery--grid',
        images: '[data-media-type="image"]',
        error: []
    },
    nordstrom: {
        titles: ['div h1'],
        prices: ['[data-botify-lu="current-price"]'],
        gallery: '.jnqKJ',
        images: 'img.LUNts',
        error: []
    },
    nike: {
        titles: ['[data-testid="product_title"]'],
        prices: ['[data-testid="currentPrice-container"]'],
        gallery: '[data-testid="ImageCarousel"]',
        images: '[data-testid="HeroImg"]',
        error: []
    },
}