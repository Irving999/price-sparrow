const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const controller = require('../controllers/alerts.controller')
const router = express.Router()

router.get('/', requireAuth, controller.getAlerts)

module.exports = router