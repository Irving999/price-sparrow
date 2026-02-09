jest.mock('../db')
jest.mock('../src/services/scraper')
jest.mock('../src/services/product.service')
jest.mock('../src/services/email.service')

const request = require('supertest')
const pool = require('../db')
const scraper = require('../src/services/scraper')
const updateProductPrice = require('../src/services/product.service')
const { sendPriceAlert } = require('../src/services/email.service')
const app = require('../src/app')

beforeEach(() => {
    jest.clearAllMocks()
})

describe('GET /api/products/:id', () => {
    it('should return product data', async () => {
        pool.query.mockResolvedValue({
            rows: [{ id: 1, url: 'https://amazon.com/item', title: 'Test', currentPrice: '29.99', currency: 'USD' }]
        })

        const res = await request(app).get('/api/products/1')

        expect(res.status).toBe(200)
        expect(res.body.title).toBe('Test')
    })

    it('should return 400 for non-numeric id', async () => {
        const res = await request(app).get('/api/products/abc')
        expect(res.status).toBe(400)
    })

    it('should return 404 when product not found', async () => {
        pool.query.mockResolvedValue({ rows: [] })

        const res = await request(app).get('/api/products/999')
        expect(res.status).toBe(404)
    })
})

describe('GET /api/products/:id/watchers', () => {
    it('should return watcher count', async () => {
        // First query: product exists check
        pool.query
            .mockResolvedValueOnce({ rowCount: 1 })
            .mockResolvedValueOnce({ rows: [{ watchersCount: 5 }] })

        const res = await request(app).get('/api/products/1/watchers')

        expect(res.status).toBe(200)
        expect(res.body.watchersCount).toBe(5)
        expect(res.body.productId).toBe(1)
    })

    it('should return 404 when product not found', async () => {
        pool.query.mockResolvedValueOnce({ rowCount: 0 })

        const res = await request(app).get('/api/products/999/watchers')
        expect(res.status).toBe(404)
    })
})

describe('POST /api/products/:id/price', () => {
    it('should scrape and update price', async () => {
        // SELECT url
        pool.query.mockResolvedValueOnce({
            rowCount: 1,
            rows: [{ url: 'https://amazon.com/item' }]
        })

        scraper.mockResolvedValue({ title: 'Test Product', price: 24.99, currency: 'USD' })
        updateProductPrice.mockResolvedValue({
            product: { id: 1, currentPrice: '24.99' },
            matchesCount: 0,
            alertedWatches: []
        })

        const res = await request(app).post('/api/products/1/price')

        expect(res.status).toBe(200)
        expect(scraper).toHaveBeenCalledWith('https://amazon.com/item')
        expect(updateProductPrice).toHaveBeenCalled()
    })

    it('should return 404 when product does not exist', async () => {
        pool.query.mockResolvedValueOnce({ rowCount: 0 })

        const res = await request(app).post('/api/products/999/price')
        expect(res.status).toBe(404)
    })

    it('should send email alerts when price drops below target', async () => {
        // SELECT url
        pool.query.mockResolvedValueOnce({
            rowCount: 1,
            rows: [{ url: 'https://amazon.com/item' }]
        })

        scraper.mockResolvedValue({ title: 'Test Product', price: 19.99, currency: 'USD' })
        updateProductPrice.mockResolvedValue({
            product: { id: 1, currentPrice: '19.99' },
            matchesCount: 1,
            alertedWatches: [10]
        })

        // SELECT watches for email
        pool.query.mockResolvedValueOnce({
            rows: [{
                email: 'user@test.com',
                targetPrice: '25.00',
                title: 'Test Product',
                url: 'https://amazon.com/item',
                currentPrice: '19.99'
            }]
        })

        sendPriceAlert.mockResolvedValue(undefined)

        const res = await request(app).post('/api/products/1/price')

        expect(res.status).toBe(200)
        expect(sendPriceAlert).toHaveBeenCalledWith(expect.objectContaining({
            to: 'user@test.com',
            productTitle: 'Test Product'
        }))
    })

    it('should return 400 for invalid productId', async () => {
        const res = await request(app).post('/api/products/abc/price')
        expect(res.status).toBe(400)
    })
})
