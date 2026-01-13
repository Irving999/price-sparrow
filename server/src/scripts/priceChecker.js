require('dotenv').config()
const pool = require('../../db')
const scraper = require('../services/scraper')
const updateProductPrice = require('../services/product.service')

async function run() {
    const { rows: products } = await pool.query(`SELECT id, url FROM products`)

    for (const product of products) {
        console.log(`Checking ${product.id}`)

        const { title, price, currency } = await scraper(product.url)

        await updateProductPrice({
            productId: product.id,
            title,
            price,
            currency
        })
    }

    console.log('All price checks complete')
    process.exit(0)
}

run().catch(err => {
    console.error(err)
    process.exit(1)
})