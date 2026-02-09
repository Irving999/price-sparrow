jest.mock('../db')
jest.mock('../src/services/scraper')
jest.mock('../src/services/product.service')
jest.mock('express-rate-limit', () => {
    return () => (req, res, next) => next()
})

const request = require('supertest')
const pool = require('../db')
const scraper = require('../src/services/scraper')
const updateProductPrice = require('../src/services/product.service')
const app = require('../src/app')
const { authHeader, createMockClient } = require('./helpers/setup')

beforeEach(() => {
    jest.clearAllMocks()
})

describe('GET /api/me', () => {
    it('should return 401 without auth token', async () => {
        const res = await request(app).get('/api/me')
        expect(res.status).toBe(401)
    })

    it('should return user data when authenticated', async () => {
        pool.query.mockResolvedValue({
            rows: [{ id: 1, email: 'test@test.com' }]
        })

        const res = await request(app)
            .get('/api/me')
            .set('Authorization', authHeader(1))

        expect(res.status).toBe(200)
        expect(res.body.user.email).toBe('test@test.com')
    })

    it('should return 404 when user not found', async () => {
        pool.query.mockResolvedValue({ rows: [] })

        const res = await request(app)
            .get('/api/me')
            .set('Authorization', authHeader(999))

        expect(res.status).toBe(404)
    })
})

describe('GET /api/me/watches', () => {
    it('should return 401 without auth token', async () => {
        const res = await request(app).get('/api/me/watches')
        expect(res.status).toBe(401)
    })

    it('should return list of watches', async () => {
        pool.query.mockResolvedValue({
            rows: [
                { watchId: 1, targetPrice: '25.00', watchedAt: '2025-01-01', product: { id: 1, title: 'Test' } },
                { watchId: 2, targetPrice: '50.00', watchedAt: '2025-01-02', product: { id: 2, title: 'Test 2' } }
            ]
        })

        const res = await request(app)
            .get('/api/me/watches')
            .set('Authorization', authHeader(1))

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
        expect(res.body).toHaveLength(2)
    })
})

describe('GET /api/me/watches/:watchId', () => {
    it('should return watch detail with product and price history', async () => {
        pool.query.mockResolvedValue({
            rows: [{
                watchId: 1,
                targetPrice: '25.00',
                watchedAt: '2025-01-01',
                product: { id: 1, url: 'https://amazon.com/item', title: 'Test', currentPrice: '29.99' },
                productImages: ['https://img.jpg'],
                productHistory: [{ id: 1, price: '29.99', checkedAt: '2025-01-01' }]
            }]
        })

        const res = await request(app)
            .get('/api/me/watches/1')
            .set('Authorization', authHeader(1))

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('product')
        expect(res.body).toHaveProperty('productHistory')
    })

    it('should return 404 when watch not found', async () => {
        pool.query.mockResolvedValue({ rows: [] })

        const res = await request(app)
            .get('/api/me/watches/999')
            .set('Authorization', authHeader(1))

        expect(res.status).toBe(404)
    })
})

describe('POST /api/me/watches', () => {
    it('should create a watch for a new product (triggers scrape)', async () => {
        const mockClient = createMockClient()
        pool.connect.mockResolvedValue(mockClient)

        // BEGIN
        mockClient.query.mockResolvedValueOnce(undefined)
        // INSERT product (new — returns a row)
        mockClient.query.mockResolvedValueOnce({
            rows: [{ id: 1, url: 'https://www.amazon.com/item', title: null, current_price: null, currency: 'USD', last_checked_at: null }]
        })
        // INSERT watch
        mockClient.query.mockResolvedValueOnce({
            rows: [{ id: 10, target_price: '25.00', created_at: '2025-01-01' }],
            rowCount: 1
        })
        // COMMIT
        mockClient.query.mockResolvedValueOnce(undefined)

        scraper.mockResolvedValue({ title: 'Amazon Product', price: 29.99, currency: 'USD', images: ['https://img.jpg'] })
        updateProductPrice.mockResolvedValue(undefined)

        const res = await request(app)
            .post('/api/me/watches')
            .set('Authorization', authHeader(1))
            .send({ url: 'https://www.amazon.com/item', targetPrice: 25 })

        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('watchId')
        expect(res.body).toHaveProperty('product')
        expect(scraper).toHaveBeenCalled()
    })

    it('should create a watch for an existing product (no scrape)', async () => {
        const mockClient = createMockClient()
        pool.connect.mockResolvedValue(mockClient)

        // BEGIN
        mockClient.query.mockResolvedValueOnce(undefined)
        // INSERT product (existing — ON CONFLICT returns empty)
        mockClient.query.mockResolvedValueOnce({ rows: [] })
        // SELECT existing product
        mockClient.query.mockResolvedValueOnce({
            rows: [{ id: 1, url: 'https://www.amazon.com/item', title: 'Amazon Product', current_price: '29.99', last_checked_at: '2025-01-01' }]
        })
        // INSERT watch
        mockClient.query.mockResolvedValueOnce({
            rows: [{ id: 10, target_price: '25.00', created_at: '2025-01-01' }],
            rowCount: 1
        })
        // COMMIT
        mockClient.query.mockResolvedValueOnce(undefined)

        const res = await request(app)
            .post('/api/me/watches')
            .set('Authorization', authHeader(1))
            .send({ url: 'https://www.amazon.com/item', targetPrice: 25 })

        expect(res.status).toBe(201)
        expect(scraper).not.toHaveBeenCalled()
    })

    it('should return 400 for invalid URL', async () => {
        const res = await request(app)
            .post('/api/me/watches')
            .set('Authorization', authHeader(1))
            .send({ url: 'not-a-url' })

        expect(res.status).toBe(400)
        expect(res.body.error).toMatch(/valid url/i)
    })

    it('should return 400 for unsupported site', async () => {
        const res = await request(app)
            .post('/api/me/watches')
            .set('Authorization', authHeader(1))
            .send({ url: 'https://www.unknownstore.com/product/123' })

        expect(res.status).toBe(400)
        expect(res.body.error).toMatch(/not supported/i)
    })

    it('should return 409 when already watching the product', async () => {
        const mockClient = createMockClient()
        pool.connect.mockResolvedValue(mockClient)

        // BEGIN
        mockClient.query.mockResolvedValueOnce(undefined)
        // INSERT product (existing)
        mockClient.query.mockResolvedValueOnce({ rows: [] })
        // SELECT existing product
        mockClient.query.mockResolvedValueOnce({
            rows: [{ id: 1, url: 'https://www.amazon.com/item', title: 'Amazon Product', current_price: '29.99', last_checked_at: '2025-01-01' }]
        })
        // INSERT watch (ON CONFLICT — already exists, returns empty)
        mockClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })
        // ROLLBACK
        mockClient.query.mockResolvedValueOnce(undefined)

        const res = await request(app)
            .post('/api/me/watches')
            .set('Authorization', authHeader(1))
            .send({ url: 'https://www.amazon.com/item' })

        expect(res.status).toBe(409)
        expect(res.body.error).toMatch(/already watching/i)
    })
})

describe('PATCH /api/me/watches/:watchId', () => {
    it('should update target price', async () => {
        pool.query.mockResolvedValue({
            rows: [{ watchId: 1, targetPrice: '30.00' }],
            rowCount: 1
        })

        const res = await request(app)
            .patch('/api/me/watches/1')
            .set('Authorization', authHeader(1))
            .send({ targetPrice: 30 })

        expect(res.status).toBe(200)
        expect(res.body.targetPrice).toBe('30.00')
    })

    it('should return 400 for negative targetPrice', async () => {
        const res = await request(app)
            .patch('/api/me/watches/1')
            .set('Authorization', authHeader(1))
            .send({ targetPrice: -5 })

        expect(res.status).toBe(400)
    })

    it('should return 400 when targetPrice is missing', async () => {
        const res = await request(app)
            .patch('/api/me/watches/1')
            .set('Authorization', authHeader(1))
            .send({})

        expect(res.status).toBe(400)
    })

    it('should return 404 when watch not found', async () => {
        pool.query.mockResolvedValue({ rows: [], rowCount: 0 })

        const res = await request(app)
            .patch('/api/me/watches/999')
            .set('Authorization', authHeader(1))
            .send({ targetPrice: 30 })

        expect(res.status).toBe(404)
    })
})

describe('DELETE /api/me/watches/:watchId', () => {
    it('should delete watch and return 200', async () => {
        pool.query.mockResolvedValue({ rowCount: 1 })

        const res = await request(app)
            .delete('/api/me/watches/1')
            .set('Authorization', authHeader(1))

        expect(res.status).toBe(200)
        expect(res.body.message).toMatch(/removed/i)
    })

    it('should return 404 when watch not found', async () => {
        pool.query.mockResolvedValue({ rowCount: 0 })

        const res = await request(app)
            .delete('/api/me/watches/999')
            .set('Authorization', authHeader(1))

        expect(res.status).toBe(404)
    })

    it('should return 400 for invalid watchId', async () => {
        const res = await request(app)
            .delete('/api/me/watches/abc')
            .set('Authorization', authHeader(1))

        expect(res.status).toBe(400)
    })
})
