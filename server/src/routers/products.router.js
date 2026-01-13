const express = require('express')
const controller = require('../controllers/products.controller')

const router = express.Router()

router.get('/:id', controller.getProduct)
router.get('/:id/watchers', controller.getWatchersCount)
router.post('/:id/price', controller.updatePrice)

module.exports = router