var mysql = require('mysql');
var con = mysql.createConnection({
    //Change this IP to localhost after development
    //Use only localhost in production
    host: "urbanmeals.in",
    user: "remote",
    password: "urban@meals",
    database: "urbanmeals"
});

con.connect(function (err) {
    if (err)
    {
        console.log(err);
        throw err;
    }
    console.log("Mysql Connection Successful");
});

module.exports = con;