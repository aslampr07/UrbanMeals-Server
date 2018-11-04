"use strict"

let express = require("express")
let verification = require("../../tools/verification")
let mysql = require('mysql');
let urbanmeals = require("../../helper/verification")

module.exports = function (con) {
    var router = express.Router();
    let verify = new urbanmeals.Verfication(con);
    let hotel = new urbanmeals.HotelAdmin(con);


    router.get("/1.1/verify", function (req, res) {
        let token = req.query.token;
        verification.verify(con, token, function (report) {
            if (report.status === "success") {
                let userId = report.id;
                let sql = mysql.format("SELECT name, code from Hotel, Hotel_Admins where hotelID = ID and userID = ?", [userId]);
                con.query(sql, function (err, rows) {
                    if (err)
                        throw err;
                    if (rows < 1) {
                        let response = {
                            "status": "error",
                            "type": [120]
                        }
                        res.json(response);
                    }
                    else {
                        let response = {
                            "status": "success",
                            "result": rows[0]
                        }
                        res.json(response);
                    }
                })
            }
            else {
                res.json(report);
            }
        });
    })

    router.get("/1.1/init", async function (req, res) {
        let hotelCode = req.query.hotelcode;
        let token = req.query.token;

        try {
            let id = await verify.verifyToken(token)
            if(id == null){
                //when session token is not found.
                let response = {
                    success : false,
                    type : [113]
                }
                res.json(response)
            }
            else{
                let hotelID = await verify.getHotelID(hotelCode)
                if(hotelID == null){
                    //hotelcode does not match any hotel
                    let response = {
                        success : false,
                        type : [115]
                    }
                    res.send(response)
                }
                else{
                    let isAdmin = await verify.isHotelAdmin(id, hotelID);
                    //Checking wheather the user is admin or not.
                    if(isAdmin){
                        //Do everything.
                        let result = await hotel.getHotelProfileAdmin(hotelID, id);
                        let response = {
                            success : true,
                            result : result
                        }
                        res.json(response);
                    }
                    else{
                        let response = {
                            success : false,
                            type : [120]
                        }
                        res.send(response)
                    }
                }
            }
        }
        catch(err){
            console.log("Error occurred");
            throw err;
        }
    });

    return router;
}