const express = require('express')
const pool = require('../db')

const app = express()

app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))

const PORT = 3000
app.listen(PORT, () => console.log(`http://localhost:${PORT}`))