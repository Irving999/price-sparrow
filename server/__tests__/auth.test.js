jest.mock('../db')
jest.mock('bcrypt')
jest.mock('express-rate-limit', () => {
    return () => (req, res, next) => next()
})

const request = require('supertest')
const pool = require('../db')
const bcrypt = require('bcrypt')
const app = require('../src/app')

beforeEach(() => {
    jest.clearAllMocks()
})

describe('POST /api/auth/register', () => {
    it('should register a new user and return 201 with token', async () => {
        bcrypt.hash.mockResolvedValue('hashed_pw')
        pool.query.mockResolvedValue({
            rows: [{ id: 1, email: 'test@test.com' }]
        })

        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@test.com', password: 'longpassword1' })

        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('token')
        expect(res.body.user.email).toBe('test@test.com')
        expect(res.body.message).toBe('User successfully created')
    })

    it('should return 400 when both email and password are missing', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({})

        expect(res.status).toBe(400)
        expect(res.body.error).toMatch(/email and password/i)
    })

    it('should return 400 when email is missing', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ password: 'longpassword1' })

        expect(res.status).toBe(400)
        expect(res.body.error).toMatch(/email/i)
    })

    it('should return 400 when password is missing', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@test.com' })

        expect(res.status).toBe(400)
        expect(res.body.error).toMatch(/password/i)
    })

    it('should return 400 when password is too short', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@test.com', password: 'short' })

        expect(res.status).toBe(400)
        expect(res.body.error).toMatch(/10 characters/i)
    })

    it('should return 400 when email already exists', async () => {
        bcrypt.hash.mockResolvedValue('hashed_pw')
        pool.query.mockRejectedValue({ code: '23505' })

        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'taken@test.com', password: 'longpassword1' })

        expect(res.status).toBe(400)
        expect(res.body.error).toMatch(/already/i)
    })
})

describe('POST /api/auth/login', () => {
    it('should login and return 200 with token', async () => {
        pool.query.mockResolvedValue({
            rows: [{ id: 1, email: 'test@test.com', password: 'hashed_pw' }]
        })
        bcrypt.compare.mockResolvedValue(true)

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@test.com', password: 'longpassword1' })

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('token')
        expect(res.body.user.email).toBe('test@test.com')
        expect(res.body.message).toBe('Logged in successfully')
    })

    it('should return 400 when email or password is missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@test.com' })

        expect(res.status).toBe(400)
        expect(res.body.error).toMatch(/cannot be empty/i)
    })

    it('should return 400 with invalid credentials (wrong password)', async () => {
        pool.query.mockResolvedValue({
            rows: [{ id: 1, email: 'test@test.com', password: 'hashed_pw' }]
        })
        bcrypt.compare.mockResolvedValue(false)

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@test.com', password: 'wrongpassword' })

        expect(res.status).toBe(400)
        expect(res.body.error).toMatch(/invalid credentials/i)
    })

    it('should return 400 with invalid credentials (user not found)', async () => {
        pool.query.mockResolvedValue({ rows: [] })
        bcrypt.compare.mockResolvedValue(false)

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nouser@test.com', password: 'longpassword1' })

        expect(res.status).toBe(400)
        expect(res.body.error).toMatch(/invalid credentials/i)
    })
})
