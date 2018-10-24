"use strict"

let express = require("express")
let verification = require("../../tools/verification")
let mysql = require('mysql');
let v = require("../../helper/verification")

module.exports = function (con) {
    var router = express.Router();
    let verify = new v.Verfication(con)


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

    router.get("/1.1/init", async function(req, res){
        let hotelCode = req.query.hotelcode;
        let token = req.query.token;

        let id = await verify.verifyToken(token)
        console.log(id)
    })

    return router;
}