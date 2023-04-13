const express = require('express');
const path = require('path');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const { exit } = require('process');

var fs = require('fs'), json;

const app = express();
const port = 3080;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public')));

//app.engine('.html', require('ejs').__express);
//app.set('view engine', 'html');
//app.set('views', __dirname + '/views');

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
    
        res.sendFile(path.join(__dirname, '/public/html/coordinator_start.html'));
    
    } else {

        res.sendFile(path.join(__dirname, '/public/html/index.html'));

    }

})

 
app.post('/login', (req,res) => {

    //console.log(req);

    let users = getJSONFile('users.json').some((m) => {

        //console.log(m);

        if (m.username == req.body.username) {

            if (m.password == req.body.password) {

                session = req.session;
                session.userid = req.body.username;
                
                console.log(req.session);

                console.log(m.username);
                
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

app.post('/register',(req, res) => {
    
    let users = getJSONFile('users.json');

    let checkUser = users.some((m) => {

        if (m.username == req.body.username) {

            return true;
               
        }

    });

    if (checkUser) {

        res.redirect('./register_login');

        return res.end();

    } else {

        users.push(req.body);

        fs.writeFile("./users.json",JSON.stringify(users, null, 4),JSON.stringify(json, null, 4), err => {
            if (err) throw err;
        });

        res.redirect('./');

    }

});


app.get('/logout', (req,res) => {

    req.session.destroy();
    res.redirect('./');

});

app.get('/register_login',(req, res) =>{

    res.sendFile(path.join(__dirname, '/public/html/register.html'));

});

app.get('/coordinator_start', (req, res) => {

    res.sendFile(path.join(__dirname, '/public/html/coordinator_start.html'));

});

app.get('/coordinator_config', (req, res) => {

    res.sendFile(path.join(__dirname, '/public/html/coordinator_config.html'));

});

app.get('/student_start', (req, res) => {

    res.sendFile(path.join(__dirname, '/public/html/student_start.html'));

});


app.listen(port, () => {

    console.log(`Server listening at http://localhost:${port}`);

});
    
function getJSONFile(file) {
    
    var filepath = __dirname + '/' + file;

    var file = fs.readFileSync(filepath, 'utf8');

    return JSON.parse(file);
    
}