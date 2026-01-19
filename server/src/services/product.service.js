const pool = require('../../db')

const updateProductPrice = async ({ productId, title, price, currency }) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        
        const updatedResult = await client.query(
            `UPDATE products
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
                last_checked_at AS "lastCheckedAt"`,
            [title, price, currency, productId]
        )
        
        // If product price has not changed, return early
        if (!updatedResult.rowCount) {
            await client.query('ROLLBACK')
            return { status: 'no_change', message: 'Price has not changed' }
        }
        
        const product = updatedResult.rows[0]
        
        await client.query(
            `INSERT INTO price_history (product_id, price) VALUES ($1, $2)`,
            [productId, price]
        )
        
        const matches = await client.query(
            `INSERT INTO alert_watches(watch_id, triggered_price)
            SELECT w.id, $2
            FROM watches w
            WHERE w.product_id = $1
                AND w.target_price IS NOT NULL
                AND $2 <= w.target_price
            ON CONFLICT (watch_id, triggered_price) DO NOTHING
            RETURNING watch_id`,
            [product.id, price]
        )
        
        await client.query('COMMIT')
        
        return {
            product,
            matchesCount: matches.rowCount,
            alertedWatches: matches.rows.map(r => r.watch_id)
        }
    } catch (err) {
        await client.query('ROLLBACK')
        throw err
    } finally {
        client.release()
    }
}

module.exports = updateProductPrice