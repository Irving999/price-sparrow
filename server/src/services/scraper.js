const sites = require('./sites')
const { chromium } = require('playwright-extra')
const stealth = require('puppeteer-extra-plugin-stealth')()

chromium.use(stealth)

module.exports = scrape = async(url) => {
    // Identify store
    const siteKey = Object.keys(sites).find(key => url.includes(key))
    const site = sites[siteKey]

    if (!siteKey || !sites[siteKey]) {
        throw new Error('Unsupported site')
    }

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

        const imageFinder = async (gallerySelector, imageSelector) => {
            const gallery = page.locator(gallerySelector)
            await gallery.waitFor({ state: 'visible', timeout: 5000 })
            await gallery.scrollIntoViewIfNeeded()
            await page.waitForTimeout(2000)

            const images = await page.locator(`${gallerySelector} ${imageSelector}`).all()

            const urls = await Promise.all(
                images.map(async (img) => {
                    const srcset = await img.getAttribute('srcset')
                        || await img.getAttribute('src')

                    if (!srcset) return null

                    // Split on a comma and whitespace only when a number follows
                    const parts = srcset.split(/,\s+(?=\d)/)
                    
                    const last = parts[parts.length - 1].trim()
                    // Split wherever there is whitespace, no matter how much
                    return last.split(/\s+/)[0]
                })
            )

            return urls.filter(url => url !== null)
        }

        const outOfStock = await trySelectors(site.error)
        const titleLoc = await trySelectors(site.titles)
        const priceLoc = await trySelectors(site.prices)

        if (!titleLoc) {
            throw new Error('Failed to locate title')
        }

        if (!priceLoc && !outOfStock) {
            throw new Error('Failed to locate price')
        }

        const title = (await titleLoc.innerText()).trim()
        
        let price
        if (!outOfStock) {
            const priceRaw = await priceLoc.innerText()
            // Delete everything that isn’t a digit, dot, or minus sign
            price = Number(priceRaw.replace(/[^0-9.-]+/g, ""))
        } else {
            price = null
        }

        const imageUrls = await imageFinder(site.gallery, site.images)

        return {
            title,
            price,
            currency: 'USD',
            images: imageUrls
        }
    } catch (err) {
        throw err
    } finally {
        if (browser) await browser.close()
    }
}