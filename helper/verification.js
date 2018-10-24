let mysql = require("mysql")

class Verfication {
    constructor(con) {
        this._con = con
    }
    verifyToken(token){
        let sql = mysql.format("SELECT * FROM Login_Session WHERE sessionToken = ?", [token])
        return new Promise((resolve, reject) => {
            this._con.query(sql, (err, rows) => {
                if(err){
                    reject(err)
                }
                resolve(rows[0]);
            });
        });
   }
}
module.exports = {Verfication}