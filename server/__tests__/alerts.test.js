jest.mock('../db')
jest.mock('express-rate-limit', () => {
    return () => (req, res, next) => next()
})

const request = require('supertest')
const pool = require('../db')
const app = require('../src/app')
const { authHeader } = require('./helpers/setup')

beforeEach(() => {
    jest.clearAllMocks()
})

describe('GET /api/alerts', () => {
    it('should return 401 without auth token', async () => {
        const res = await request(app).get('/api/alerts')
        expect(res.status).toBe(401)
    })

    it('should return alerts for authenticated user', async () => {
        pool.query.mockResolvedValue({
            rows: [
                { id: 1, triggered_price: '19.99', triggered_at: '2025-01-01', title: 'Product', url: 'https://amazon.com/item' }
            ]
        })

        const res = await request(app)
            .get('/api/alerts')
            .set('Authorization', authHeader(1))

        expect(res.status).toBe(200)
        expect(res.body.alerts).toHaveLength(1)
        expect(res.body.count).toBe(1)
    })

    it('should return empty array when no alerts exist', async () => {
        pool.query.mockResolvedValue({ rows: [] })

        const res = await request(app)
            .get('/api/alerts')
            .set('Authorization', authHeader(1))

        expect(res.status).toBe(200)
        expect(res.body.alerts).toHaveLength(0)
        expect(res.body.count).toBe(0)
    })
})
