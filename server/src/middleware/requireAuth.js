const jwt = require('jsonwebtoken')

module.exports = function requireAuth(req, res, next) {
    const header = req.headers.authorization || ""
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null

    if (!token) return res.status(401).json({ error: 'Missing token' })

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = payload.userId
        next()
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' })
    }
}