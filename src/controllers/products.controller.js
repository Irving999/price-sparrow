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
        
        res.json({ productId, watchersCount: rows[0].watchersCount });
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getProduct,
    getWatchersCount
}