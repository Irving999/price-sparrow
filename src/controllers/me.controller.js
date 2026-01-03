const pool = require('../../db')

function isValidUrl(str) {
    try {
        const u = new URL(str)
        return u.protocol === 'http:' || u.protocol === 'https:'
    } catch {
        return false
    }
}

const postWatches = async (req, res, next) => {
    const client = await pool.connect()
    try {
        const userId = req.userId
        const { url, targetPrice } = req.body

        if (!url || typeof url !== 'string' || !isValidUrl(url)) {
            return res.status(400).json({ error: 'Valid url is required' })
        }

        // Target price is optional
        if (targetPrice !== undefined && targetPrice !== null) {
            // Validates target price
            const num = Number(targetPrice)
            if (!Number.isFinite(num) || num < 0) {
                return res.status(400).json({ error: `'targetPrice' must be a non-negative number.` })
            }
        }

        // Starts transaction
        await client.query('BEGIN')

        const productResult = await client.query(
            `
            INSERT INTO products (url)
            VALUES ($1)
            ON CONFLICT (url) 
            DO UPDATE SET url = EXCLUDED.url
            RETURNING id, url, title, current_price, currency, last_checked_at
            `,
            [url]
        )

        const product = productResult.rows[0]

        const watchResult = await client.query(
            `
            INSERT INTO watches (user_id, product_id, target_price)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, product_id) DO NOTHING
            RETURNING id, target_price, created_at
            `,
            [userId, product.id, targetPrice ?? null]
        )

        if (watchResult.rows.length === 0) {
            await client.query('ROLLBACK')
            return res.status(409).json({ error: 'You are already watching this item' })
        }

        await client.query('COMMIT')

        const watch = watchResult.rows[0]

        return res.status(201).json({
            watchId: watch.id,
            targetPrice: watch.target_price,
            createdAt: watch.created_at,
            product: {
                id: product.id,
                url: product.url,
                title: product.title,
                currentPrice: product.current_price,
                currency: product.currency,
                lastCheckedAt: product.last_checked_at,
            },
        })
    } catch (err) {
        try {
            await client.query('ROLLBACK')
        } catch (_) {}
        next(err)
    } finally {
        client.release()
    }
}

module.exports = {
    postWatches
}