const mysql = require('mysql')

const pool = mysql.createPool({
    connectionLimit : 100,
    host            : "urbanmeals.in",
    user            : "remote",
    password        : "urban@meals",
    database        : "urbanmeals"
})

exports.pool = pool