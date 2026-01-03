const express = require('express')
const pool = require('../db')

const authRouter = require('./routers/auth.router')
const watchesRouter = require('./routers/me.router')
const productsRouter = require('./routers/products.router')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/me', watchesRouter)
app.use('/api/products', productsRouter)

const PORT = 3000
app.listen(PORT, () => console.log(`http://localhost:${PORT}`))