const express = require('express')

const router = express.Router()

router.use('/restaurant', require('./restaurant'));

module.exports = router

