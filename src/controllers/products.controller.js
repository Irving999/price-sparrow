const scraper = require('../services/scraper')
const pool = require('../../db')
const { updateProductPrice } = require('../services/product.service')

const getProduct = async (req, res, next) => {
    try {
        const productId = Number(req.params.id)
        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({ error: "Invalid productId"})
        }

        const { rows } = await pool.query(`
            SELECT 
                id,
                url,
                title,
                current_price AS "currentPrice",
                currency,
                last_checked_at AS "lastChecked",
                created_at AS "createdAt"
            FROM products p
            WHERE p.id = $1
            `,
            [productId]
        )

        if (rows.length === 0) return res.status(404).json({ error: "Product not found" })

        res.json(rows[0])
    } catch (err) {
        next(err)
    }
}

const getWatchersCount = async (req, res, next) => {
    try {
        const productId = Number(req.params.id)
        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({ error: "Invalid productId"})
        }

        const productCheck = await pool.query(`SELECT 1 FROM products WHERE id = $1`, [productId])
        if (productCheck.rowCount === 0) {
            return res.status(404).json({ error: "Product not found." })
        }

        const { rows } = await pool.query(
            `
            SELECT COUNT(*)::int AS "watchersCount"
            FROM watches
            WHERE product_id = $1
            `,
            [productId]
        )
        
        res.json({ productId, watchersCount: rows[0].watchersCount })
    } catch (err) {
        next(err)
    }
}

const updatePrice = async (req, res, next) => {
    try {
        // Validate product id
        const productId = Number(req.params.id)
        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({ error: 'Invalid productId' })
        }
        
        // Get product from db
        const result = await pool.query('SELECT url FROM products WHERE id = $1', [productId])
        if (!result.rowCount) {
            return res.status(404).json({ error: 'Product does not exist' })
        }
        const url = result.rows[0].url
        
        // Scrape product
        const { title, price, currency } = await scraper(url)
        if (!title || !currency || !Number.isFinite(price) || price < 0) {
            return res.status(400).json({ error: 'Invalid input' })
        }
        
        const data = await updateProductPrice({ productId, title, price, currency })
        res.json(data)
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getProduct,
    getWatchersCount,
    updatePrice
}