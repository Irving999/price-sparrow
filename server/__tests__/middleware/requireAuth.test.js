const jwt = require('jsonwebtoken')
const requireAuth = require('../../src/middleware/requireAuth')

function mockRes() {
    const res = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
}

describe('requireAuth middleware', () => {
    it('should set req.userId and call next() with a valid token', () => {
        const token = jwt.sign({ userId: 42 }, process.env.JWT_SECRET, { expiresIn: '1h' })
        const req = { headers: { authorization: `Bearer ${token}` } }
        const res = mockRes()
        const next = jest.fn()

        requireAuth(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(req.userId).toBe(42)
    })

    it('should return 401 when no Authorization header is present', () => {
        const req = { headers: {} }
        const res = mockRes()
        const next = jest.fn()

        requireAuth(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({ error: 'Missing token' })
        expect(next).not.toHaveBeenCalled()
    })

    it('should return 401 when Authorization header has no Bearer prefix', () => {
        const req = { headers: { authorization: 'Token abc123' } }
        const res = mockRes()
        const next = jest.fn()

        requireAuth(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(next).not.toHaveBeenCalled()
    })

    it('should return 403 when token is invalid', () => {
        const req = { headers: { authorization: 'Bearer invalid.token.here' } }
        const res = mockRes()
        const next = jest.fn()

        requireAuth(req, res, next)

        expect(res.status).toHaveBeenCalledWith(403)
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' })
        expect(next).not.toHaveBeenCalled()
    })

    it('should return 403 when token is expired', () => {
        const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: '0s' })
        const req = { headers: { authorization: `Bearer ${token}` } }
        const res = mockRes()
        const next = jest.fn()

        requireAuth(req, res, next)

        expect(res.status).toHaveBeenCalledWith(403)
        expect(next).not.toHaveBeenCalled()
    })
})
