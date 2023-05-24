const mysql = require('mysql2');

module.exports = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'defacto8*',
    database : 'embedded'
    // password : 'wlfkf258',
    // database : 'embeded'
});

