require('dotenv').config()

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
        client = await pool.connect()

        const productId = Number(req.params.id)
        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({ error: 'Invalid productId' })
        }

        const { currentPrice, currency } = req.body
        const priceNum = Number(currentPrice)
        if (!Number.isFinite(priceNum) || priceNum < 0) {
            return res.status(400).json({ error: 'Invalid price' })
        }

        await client.query('BEGIN')

        const updatedResult = await client.query(
            `
            UPDATE products
            SET 
                current_price = $1,
                currency = $2,
                last_checked_at = NOW()
            WHERE id = $3
            RETURNING
                id,
                url,
                current_price AS "currentPrice",
                currency,
                last_checked_at AS "lastCheckedAt"
            `,
            [priceNum, currency, productId]
        )

        if (!updatedResult.rowCount) {
            await client.query('ROLLBACK')
            return res.status(404).json({ error: 'Product does not exist' })
        }
        
        const product = updatedResult.rows[0]

        const matchesResult = await client.query(
            `
            SELECT
                w.id AS "watchId",
                w.user_id AS "userId",
                w.target_price AS "targetPrice",
                w.created_at AS "watchedAt"
            FROM watches w
            WHERE w.product_id = $1
                AND w.target_price IS NOT NULL
                AND $2 <= w.target_price
            ORDER BY w.created_at ASC
            `,
            [productId, priceNum]
        )

        await client.query('COMMIT')

        res.json({
            product,
            matches: matchesResult.rows,
            matchesCount: matchesResult.rows.length
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