const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const controller = require('../controllers/me.controller')
const router = express.Router()

router.get('/', requireAuth, controller.getMe)
router.get('/watches/:watchId', requireAuth, controller.getWatch)
router.get('/watches', requireAuth, controller.getWatches)
router.post('/watches', requireAuth, controller.postWatches)
router.post('/watches/:watchId', requireAuth, controller.deleteWatch)

module.exports = router