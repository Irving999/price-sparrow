require('dotenv').config()
const scraper = require('../services/scraper')

const pool = require('../../db')

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
    let client
    try {
        // Validate product id
        const productId = Number(req.params.id)
        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({ error: 'Invalid productId' })
        }

        // Get product from db
        const result = await pool.query('SELECT url FROM products WHERE id = $1', [productId])
        if (!result.rowCount) return res.status(404).json({ error: 'Product does not exist' })
        const url = result.rows[0].url

        // Scrape product
        const { title, price, currency } = await scraper(url)
        if (!title || !currency || !Number.isFinite(price) || price < 0) {
            return res.status(400).json({ error: 'Invalid input' })
        }
        
        client = await pool.connect()
        await client.query('BEGIN')

        const updatedResult = await client.query(
            `
            UPDATE products
            SET 
                title = $1,
                current_price = $2,
                currency = $3,
                last_checked_at = NOW()
            WHERE id = $4
            AND current_price IS DISTINCT FROM $2
            RETURNING
                id,
                url,
                current_price AS "currentPrice",
                currency,
                last_checked_at AS "lastCheckedAt"
            `,
            [title, price, currency, productId]
        )

        // If product price has not changed return
        if (!updatedResult.rowCount) {
            await client.query('ROLLBACK')
            return res.status(200).json({ status: 'no_change', message: 'Price has not changed' })
        }

        const product = updatedResult.rows[0]

        await client.query(`INSERT INTO price_history (product_id, price) VALUES ($1, $2)`,
            [productId, price]
        )

        const matches = await client.query(
            `
            INSERT INTO alert_watches(watch_id, triggered_price)
            SELECT w.id, $2
            FROM watches w
            WHERE w.product_id = $1
                AND w.target_price IS NOT NULL
                AND $2 <= w.target_price
            ON CONFLICT (watch_id, triggered_price) DO NOTHING
            RETURNING watch_id
            `,
            [product.id, price]
        )

        await client.query('COMMIT')

        res.json({
            product,
            matchesCount: matches.rowCount,
            alertedWatches: matches.rows.map(r => r.watch_id)
        })
    } catch (err) {
        try { await client.query('ROLLBACK') } catch(_) {}
        next(err)
    } finally {
        if (client) client.release()
    }
}

module.exports = {
    getProduct,
    getWatchersCount,
    updatePrice
}