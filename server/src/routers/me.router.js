const express = require('express')
const rateLimit = require('express-rate-limit')
const requireAuth = require('../middleware/requireAuth')
const controller = require('../controllers/me.controller')
const router = express.Router()

const watchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many products added, please try again in 15 minutes' }
})

router.get('/', requireAuth, controller.getMe)
router.get('/watches/:watchId', requireAuth, controller.getWatch)
router.get('/watches', requireAuth, controller.getWatches)
router.post('/watches', requireAuth, watchLimiter, controller.postWatches)
router.patch('/watches/:watchId', requireAuth, controller.updateWatch)
router.delete('/watches/:watchId', requireAuth, controller.deleteWatch)

module.exports = router