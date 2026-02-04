const express = require('express')
const router = express.Router()
const stores = require('../services/sites')

router.get('/', (req, res) => {
    const storeNames = Object.keys(stores).map(key => ({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1)
    }))
    res.json(storeNames)
})

module.exports = router