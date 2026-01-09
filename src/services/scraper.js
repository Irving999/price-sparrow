const sites = require('./sites')
const { chromium } = require('playwright-extra')
const stealth = require('puppeteer-extra-plugin-stealth')()

chromium.use(stealth)

module.exports = scrape = async(url) => {
    // Identify store
    const siteKey = Object.keys(sites).find(key => url.includes(key))
    const site = sites[siteKey]

    let browser
    try {
        browser = await chromium.launch({ headless: true })

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 720 },
            locale: 'en-US'
        })

        const page = await context.newPage()

        await page.goto(url, { waitUntil: 'domcontentloaded' })

        const trySelectors = async (selectors) => {
            for (const selector of selectors) {
                const loc = page.locator(selector).first()
                try {
                    await loc.waitFor({ state: 'visible', timeout: 3000 })
                    return loc
                } catch { continue }
            }
            return null
        }

        const titleLoc = await trySelectors(site.titles)
        const priceLoc = await trySelectors(site.prices)

        if (!titleLoc || !priceLoc) {
            throw new Error('Failed to locate elements')
        }

        const title = (await titleLoc.innerText()).trim()
        const priceRaw = await priceLoc.innerText()

        const priceClean = Number(priceRaw.replace(/[^0-9.-]+/g, ""))

        return {
            title,
            price: priceClean,
            currency: 'USD'
        }
    } catch (err) {
        console.error(`Scrape Failed for ${url}:`, err.message)
        return null
    } finally {
        if (browser) await browser.close()
    }
}