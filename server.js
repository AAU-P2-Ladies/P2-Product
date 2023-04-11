const express = require('express');
const path = require('path');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

var fs = require('fs'), json;

const app = express();

const port = 3080;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public')));

const oneDay = 1000 * 60 * 60 * 24;

var session;

app.use(sessions({

    secret: "merete",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false 

}));

app.use(cookieParser());

app.get('/', (req, res) => {

    session = req.session;

    if (session.userid) {
    
        res.send("Welcome User <a href=\'./logout'>click to logout</a>");
    
    } else {

        res.sendFile(path.join(__dirname, '/public/html/index.html'));

    }

})

 
app.post('/login', (req,res) => {

    //console.log(req);

    let users = getJSONFile('users.json').some((m) => {

        //console.log(m);

        if (m.navn == req.body.username) {

            if (m.password == req.body.password) {

                session = req.session;
                session.userid = req.body.username;
                
                console.log(req.session);

                console.log(m.navn);
                
                res.json({ error: false, username: true, password: true });

                return true;

            } else {

                res.json({ error: true, username: true, password: false });

                return true;

            } 
        
        }

    });

    if (!users) {

        res.json({ error: true, username: false, password: false }); 

    }

})

app.get('/coordinator_start', (req, res) => {

    res.sendFile(path.join(__dirname, '/public/html/coordinator_start.html'));

})

app.get('/coordinator_config', (req, res) => {

    res.sendFile(path.join(__dirname, '/public/html/coordinator_config.html'));

})

app.get('/logout', (req,res) => {

    req.session.destroy();
    res.redirect('./');

});

app.listen(port, () => {

    console.log(`Server listening at http://localhost:${port}`);

})

function readJSONFileSync(filepath, encoding) {

    if (typeof (encoding) == 'undefined') {
        
        encoding = 'utf8';
    
    }
    
    var file = fs.readFileSync(filepath, encoding);
    
    return JSON.parse(file);

}
    
function getJSONFile(file) {
    
    var filepath = __dirname + '/' + file;

    return readJSONFileSync(filepath);

}

let users = getJSONFile('users.json');

users.find((m) => {

    if (m.navn === 'Merete Kaldahl Andersen') {

        console.log(m.email)
    
    }
});