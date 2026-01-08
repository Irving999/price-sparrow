const pool = require('../../db')

const getAlerts = async (req, res, next) => {
    try {
        const userId = req.userId

        const { rows } = await pool.query(
            `
            SELECT
                aw.id,
                aw.triggered_price,
                aw.triggered_at,
                p.title,
                p.url
            FROM alert_watches aw
            JOIN watches w ON w.id = aw.watch_id
            JOIN products p ON p.id = w.product_id
            WHERE w.user_id = $1
            ORDER BY aw.triggered_at DESC
            `,
            [userId]
        )

        res.json({
            alerts: rows,
            count: rows.length
        })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    getAlerts
}