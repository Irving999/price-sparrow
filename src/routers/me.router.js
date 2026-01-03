const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const controller = require('../controllers/me.controller')
const router = express.Router()

router.get('/watches', requireAuth, controller.getWatches)
router.post('/watches', requireAuth, controller.postWatches)

module.exports = router