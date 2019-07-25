let Restaurant = require('../model/restaurantModel').Restaurant

exports.nearbyHotelController = async (req, res) => {
    let version = req.query.ver

    if (version) {
        if (version === "2.0") {
            //Setting the default value
            let lat = parseFloat(req.query.lat) || 10;
            let lon = parseFloat(req.query.lon) || 76;
            let start = parseInt(req.query.start) || 0;
            let end = parseInt(req.query.end) || 20;

            try {

                let rows = await Restaurant.getNearby(lat, lon, start, end)

                //Converting the null rating to zero
                rows.map(obj => {
                    obj.rating = (obj.rating) ? obj.rating : 0.0
                });

                let response = {
                    success: true,
                    result: rows
                }
                res.send(response)
            }
            catch (err) {
                res.status(500)
                let response = {
                    success: false,
                    type: "database error"
                }
                res.send(response)
            }
        }
        else {
            //TODO create a response code
            res.send("Version is incorrect");
        }
    }
    else {
        res.send("No version specified")
    }
}