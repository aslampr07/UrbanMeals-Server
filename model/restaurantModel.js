const pool = require("../config/database").pool
const mysql = require("mysql")

class Restaurant{
    static getNearby(lat, lon, start, end){
        return new Promise((resolve, reject) => {

            let sql = mysql.format(`SELECT name, code, place, phone, calculate_distance(latitude, longitude, ?, ?) AS distance, latitude, longitude, 
                                    (SELECT AVG(rating) FROM Hotel_Rating WHERE hotelID = h.ID ) AS rating, url, body AS description 
                                    FROM Hotel h, Hotel_Profile hp, Pictures p, Hotel_Description hd WHERE 
                                    enabled = 'Y' AND h.ID = hp.hotelID AND p.ID = mainDP AND hd.hotelID = h.ID ORDER BY distance LIMIT ?, ?`, [lat, lon, start, end]);
            
            pool.query(sql, (err, rows) => {
                if(err){
                    reject(err)
                }
                resolve(rows)
            })
        });
    }
}

module.exports = {Restaurant}