jest.mock('../db')

const request = require('supertest')
const app = require('../src/app')

describe('GET /api/stores', () => {
    it('should return a list of supported stores', async () => {
        const res = await request(app).get('/api/stores')

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
        expect(res.body.length).toBeGreaterThan(0)
    })

    it('each store should have id and name properties', async () => {
        const res = await request(app).get('/api/stores')

        for (const store of res.body) {
            expect(store).toHaveProperty('id')
            expect(store).toHaveProperty('name')
        }
    })

    it('should include known stores', async () => {
        const res = await request(app).get('/api/stores')
        const ids = res.body.map(s => s.id)

        expect(ids).toContain('amazon')
        expect(ids).toContain('bestbuy')
        expect(ids).toContain('target')
    })
})
