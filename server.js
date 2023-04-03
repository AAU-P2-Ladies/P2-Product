const express = require('express');
const path = require('path');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

var fs = require('fs'), json;

const app = express()

const port = 3000

app.use(express.json())

app.use(express.static(path.join(__dirname, 'public')))

const oneDay = 1000 * 60 * 60 * 24;

var session;

app.use(sessions({

    secret: "merete",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: true 

}));

app.use(cookieParser());

app.get('/', (req, res) => {

    session = req.session;

    if (session.userid){
    
        res.send("Welcome User <a href=\'/logout'>click to logout</a>");
    
    } else {

        res.sendFile(path.join(__dirname, '/public/html/index.html'));

    }

})

app.post('/login', (req,res) => {

    if (req.body.username == '123' && req.body.password == '123'){
    
        session = req.session;
        session.userid = req.body.username;
        
        console.log(req.session)
        
        res.send(`Hey there, welcome <a href=\'/logout'>click to logout</a>`);
    
    } else {
    
        res.send('Invalid username or password');
    
    }
})

app.get('/coordinator', (req, res) => {

    res.sendFile(path.join(__dirname, '/public/html/coordinator_config.html'))

})

app.listen(port, () => {

    console.log(`Server listening at http://localhost:${port}`)

})
   
function readJsonFileSync(filepath, encoding) {

    if (typeof (encoding) == 'undefined') {
        
        encoding = 'utf8';
    
    }
    
    var file = fs.readFileSync(filepath, encoding);
    
    return JSON.parse(file);

}
    
function getConfig(file) {
    
    var filepath = __dirname + '/' + file;

    return readJsonFileSync(filepath);

}

// console.log(getConfig('users.json'))