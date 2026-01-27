const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const pool = require('../../db')
const scraper = require('../services/scraper')
const updateProductPrice = require('../services/product.service')

async function run() {
    const { rows: products } = await pool.query(`SELECT id, url FROM products`)

    for (const product of products) {
        console.log(`Checking ${product.id}`)

        try {
            const { title, price, currency, images } = await scraper(product.url)
            await updateProductPrice({
                productId: product.id,
                title,
                price,
                currency,
                images
            })
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