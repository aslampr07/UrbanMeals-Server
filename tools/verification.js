"use strict";
var mysql = require('mysql');
module.exports = {
    verify: function (con, token, callback) {
        var response = {};
        var sql = mysql.format('SELECT u.ID, phoneVerified as verified FROM User u, Login_Session WHERE userID = u.ID AND sessionToken = ?', [token]);
        con.query(sql, function (err, rows) {
            if (err) {
                throw err;
            }
            if (rows.length <= 0) {
                response.status = 'error';
                response.type = [113];
            }
            else {
                //if(rows[0].verified == 'N'){
                //The user does not need phone verification.
                if (false) {
                    response.status = 'error';
                    response.type = [114];
                }
                else {
                    response.status = 'success';
                    response.id = rows[0].ID;
                }
            }
            callback(response);
        });
    }
}