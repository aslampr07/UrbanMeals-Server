const express = require("express")
const restaurantController = require("../../controller/restaurantController")

const router = express.Router()

router.get('/nearby', (req, res) => {
    restaurantController.nearbyHotelController(req, res)
});

module.exports = router