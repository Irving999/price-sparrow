const { chromium } = require('playwright-extra')
const stealth = require('puppeteer-extra-plugin-stealth')()

chromium.use(stealth)

module.exports = async (url) => {
    let browser
    try {
        browser = await chromium.launch({ headless: true })

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 720 },
            locale: 'en-US'
        })

        const page = await context.newPage()

        await page.goto(url, { waitUntil: 'commit' })

        const titleLocator = page.locator('h1')
        await titleLocator.waitFor({ state: 'attached' })

        const title = await titleLocator.innerText()
        
        const price = await page.getByTestId('price-block-customer-price').innerText()
        const cleanPrice = price.replace(/[$,]/g, '')

        if (!title || !price) {
            throw new Error('Failed to extract product data')
        }

        const data = {
            title,
            price: cleanPrice,
            currency: 'USD'
        }
        return data
    } catch (err) {
        console.error('BestBuy scrape error:', err)
        return null
    } finally {
        if (browser) await browser.close()
    }
}