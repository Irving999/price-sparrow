const express = require('express')
const pool = require('../db')

const authRouter = require('./routers/auth.router')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)

const PORT = 3000
app.listen(PORT, () => console.log(`http://localhost:${PORT}`))