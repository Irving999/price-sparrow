const pool = require('../../db')

const updateProductPrice = async ({ client, productId, title, price, currency, images }) => {
    const internalClient = client || await pool.connect()
    const isInternalClient = !client

    try {
        if (isInternalClient) await internalClient.query('BEGIN')

        await internalClient.query(
            `INSERT INTO product_images (product_id, image_url)
            SELECT $1, unnest($2::text[])
            ON CONFLICT (product_id, image_url) DO NOTHING
            `,
            [productId, images || []]
        )

        const prevPriceResult = await internalClient.query(
            `SELECT current_price FROM products WHERE id = $1`,
            [productId]
        )
        const prevPrice = prevPriceResult.rows[0].current_price
        
        const updatedResult = await internalClient.query(
            `UPDATE products
            SET 
                title = $1,
                current_price = $2,
                currency = $3,
                last_checked_at = NOW()
            WHERE id = $4
            RETURNING
                id,
                url,
                current_price AS "currentPrice",
                currency,
                last_checked_at AS "lastCheckedAt"`,
            [title, price, currency, productId]
        )

        const product = updatedResult.rows[0]
                
        if (prevPrice !== price) {
            await internalClient.query(
                `INSERT INTO price_history (product_id, price) VALUES ($1, $2)`,
                [productId, price]
            )
        }
        
        const matches = await internalClient.query(
            `INSERT INTO alert_watches(watch_id, triggered_price)
            SELECT w.id, $2
            FROM watches w
            WHERE w.product_id = $1
                AND w.target_price IS NOT NULL
                AND $2 <= w.target_price
            ON CONFLICT (watch_id, triggered_price) DO NOTHING
            RETURNING watch_id`,
            [productId, price]
        )
        
        if (isInternalClient) await internalClient.query('COMMIT')
        
        return {
            product,
            matchesCount: matches.rowCount,
            alertedWatches: matches.rows.map(r => r.watch_id)
        }
    } catch (err) {
        if (isInternalClient) await internalClient.query('ROLLBACK')
        throw err
    } finally {
        if (isInternalClient) internalClient.release()
    }
}

module.exports = updateProductPrice