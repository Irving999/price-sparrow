const pool = require('../../db')

function isValidUrl(str) {
    try {
        const u = new URL(str)
        return u.protocol === 'http:' || u.protocol === 'https:'
    } catch {
        return false
    }
}

const getMe = async (req, res, next) => {
    try {
        const userId = req.userId

        const { rows } = await pool.query(
            `
            SELECT id, email FROM users
            WHERE id = $1
            `
            , [userId]
        )

        const user = rows[0]

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        res.json({
            id: user.id,
            email: user.email
        })
    } catch (err) {
        next(err)
    }
}

const getWatch = async (req, res, next) => {
    try {
        const id = Number(req.params.watchId)

        const { rows } = await pool.query(
            `SELECT
                w.id AS "watchId",
                w.target_price AS "targetPrice",
                w.created_at AS "watchedAt",
                json_build_object(
                'id', p.id,
                'url', p.url,
                'title', p.title,
                'currentPrice', p.current_price,
                'currency', p.currency,
                'lastCheckedAt', p.last_checked_at
                ) AS product
             FROM watches w
             JOIN products p ON p.id = w.product_id
             WHERE w.id = $1
            `,
            [id]
        )

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Watch not found' })
        }

        res.json(rows[0])
    } catch (error) {
        next(error)
    }
}

const getWatches = async (req, res, next) => {
    try {
        const userId = req.userId

        const { rows } = await pool.query(
            `
            SELECT
                w.id AS "watchId",
                w.target_price AS "targetPrice",
                w.created_at AS "watchedAt",
                json_build_object(
                'id', p.id,
                'url', p.url,
                'title', p.title,
                'currentPrice', p.current_price,
                'currency', p.currency,
                'lastCheckedAt', p.last_checked_at
                ) AS product
            FROM watches w
            JOIN products p ON p.id = w.product_id
            WHERE w.user_id = $1
            ORDER BY w.created_at DESC
            `,
            [userId]
        )
        res.json(rows)
    } catch (err) {
        next(err)
    }
}

const postWatches = async (req, res, next) => {
    let client
    try {
        client = await pool.connect()
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

const deleteWatch = async (req, res, next) => {
    try {
        const userId = req.userId
        const watchId = Number(req.params.watchId)

        if (!Number.isInteger(watchId) || watchId <= 0) {
            return res.status(400).json({ error: "Invalid watchId." });
        }

        const { rowCount } = await pool.query(
            `
            DELETE FROM watches
            WHERE id = $1
            AND user_id = $2
            `
            , [watchId, userId]
        )

        if (!rowCount) return res.status(404).json({ error: 'Watch not found' })

        res.json({ message: 'Product removed successfully', watchId })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getWatch,
    getWatches,
    postWatches,
    deleteWatch,
    getMe
}