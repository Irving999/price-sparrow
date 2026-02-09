const jwt = require('jsonwebtoken')

function authHeader(userId = 1) {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' })
    return `Bearer ${token}`
}

function createMockClient() {
    return {
        query: jest.fn(),
        release: jest.fn(),
    }
}

module.exports = { authHeader, createMockClient }
