const express = require("express");
const app = express();
const db = require('./db/index');

// app.set('port', 8080);
app.set('port', 8000);

db.connect();
console.log('embedded DB conndected');

const router = require('./routes/index');

app.listen(app.get('port'), () =>{
    console.log('embedded server start on port ', app.get('port'));
})

app.use(express.json()); 
app.use('/', router);