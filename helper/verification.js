let mysql = require("mysql")

class Verfication {

    constructor(con) {
        this._con = con
    }

    //verify wheather the session token is valid.
    verifyToken(token) {
        let sql = mysql.format("SELECT userID FROM Login_Session WHERE sessionToken = ?", [token])
        return new Promise((resolve, reject) => {
            this._con.query(sql, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    if (rows.length > 0) {
                        resolve(rows[0].userID)
                    }
                    else {
                        resolve(null)
                    }   
                }
            });
        });
    }

    //For retrieving the hotelID from the hotelCode
    getHotelID(hotelCode){
        let sql = mysql.format("SELECT ID FROM Hotel WHERE code = ?", [hotelCode]);
        return new Promise((resolve, reject) => {
            this._con.query(sql, (err, rows) => {
                if(err){
                    reject(err)
                }
                else{
                    if(rows.length > 0){
                        resolve(rows[0].ID)
                    }   
                    else{
                        resolve(null);
                    }      
                }
            });
        });
    }

    //for finding wheather the user is admin or not of an hotel.
    isHotelAdmin(userID, hotelID){
        let sql = mysql.format("SELECT * from Hotel_Admins WHERE userID = ? AND hotelID = ?", [userID, hotelID]);
        return new Promise((resolve, reject) => {
            this._con.query(sql, (err, rows) => {
                if(err){
                    reject(err);
                }
                else{
                    if(rows.length > 0){
                        resolve(true);
                    }
                    else{
                        resolve(false);
                    }
                }
            })
        });
    }


}

class HotelAdmin{

    constructor(con){
        this._con = con;
    }

    //For retreiving the general information about the Hotel and its admin.
    getHotelProfileAdmin(hotelID, userID) {
        let sql = mysql.format(`SELECT name, code, CONCAT(firstname, " ", lastname) AS admin, street, place, city, pincode, hp.phone as phone, body as description
                                FROM Hotel h, User_Profile u, Hotel_Admins ha, Hotel_Profile hp, Hotel_Description hd 
                                WHERE ha.userID = ? 
                                AND ha.hotelID = ? 
                                AND ha.userID = u.userID 
                                AND ha.hotelID = h.ID 
                                AND hp.hotelID = h.ID 
                                AND hd.hotelID = h.ID;`, [userID, hotelID]);
        return new Promise((resolve, reject) => {
            this._con.query(sql, (err, rows) => {
                if(err){
                    reject(err)
                }
                else{
                    let response = rows[0];
                    let sql = mysql.format(`SELECT imageURL FROM Hotel_Pictures WHERE hotelID =?`,[hotelID]);
                    this._con.query(sql, (err, rows) => {
                        if(err){
                            reject(err)
                        }
                        else{
                            response.images = rows.map(obj => {
                                return obj.imageURL;
                            });
                            resolve(response);
                        }
                    });
                }
            });
        });
    }
}
module.exports = {Verfication, HotelAdmin}