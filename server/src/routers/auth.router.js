const express = require('express')
const rateLimit = require('express-rate-limit')
const auth = require('../controllers/auth.controller')
const router = express.Router()

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many attempts, please try again in 15 minutes' }
})

router.post('/register', authLimiter, auth.postRegister)
router.post('/login', authLimiter, auth.postLogin)

module.exports = router