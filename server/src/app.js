require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}))

app.use(express.json())

app.use('/api/auth', require('./routers/auth.router'))
app.use('/api/me', require('./routers/me.router'))
app.use('/api/products', require('./routers/products.router'))
app.use('/api/alerts', require('./routers/alerts.router'))
app.use('/api/stores', require('./routers/stores.router'))

// Error handling
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' })
})

app.use((err, req, res, next) => {
    const status = err.status || 500

    console.error('Error', {
        message: err.message,
        code: err.code,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    })

    res.status(status).json({
        error: status === 500 ? 'Server Error' : err.message
    })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`http://localhost:${PORT}`))