const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const pool = require('../../db')
const scraper = require('../services/scraper')
const updateProductPrice = require('../services/product.service')
const { sendPriceAlert } = require('../services/email.service')

async function run() {
    const { rows: products } = await pool.query(`SELECT id, url FROM products`)

    for (const product of products) {
        console.log(`Checking ${product.id}`)

        try {
            const { title, price, currency, images } = await scraper(product.url)
            const result = await updateProductPrice({
                productId: product.id,
                title,
                price,
                currency,
                images
            })

            if (result.matchesCount > 0) {
                const { rows: watches } = await pool.query(
                    `SELECT u.email, w.target_price AS "targetPrice", p.title, p.url, p.current_price AS "currentPrice"
                    FROM watches w
                    JOIN users u ON u.id = w.user_id
                    JOIN products p ON p.id = w.product_id
                    WHERE w.id = ANY($1)`,
                    [result.alertedWatches]
                )

                for (const watch of watches) {
                    try {
                        await sendPriceAlert({
                            to: watch.email,
                            productTitle: watch.title,
                            productUrl: watch.url,
                            currentPrice: watch.currentPrice,
                            targetPrice: watch.targetPrice
                        })
                        console.log(`Email sent to ${watch.email} for "${watch.title}"`)
                    } catch (emailErr) {
                        console.error(`Failed to send email to ${watch.email}:`, emailErr.message)
                    }
                }
            }
        } catch (error) {
            console.error(`Error checking product ${product.id}:`, error.message)
        }
    }

    console.log('All price checks complete')
    process.exit(0)
}

run().catch(err => {
    console.error(err)
    process.exit(1)
})