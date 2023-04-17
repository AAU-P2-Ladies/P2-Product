const express = require('express');
const path = require('path');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const { exit } = require('process');

var fs = require('fs'), json;

const app = express();
const port = 3080;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').renderFile);

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

app.use(function(req, res, next) {

    res.locals.isLoggedIn = req.session.userid ? 1 : 0;
    next();

});

app.get('/', (req, res) => {

    if (req.session.userid) {
    
        //res.sendFile(path.join(__dirname, '/public/html/coordinator_start.html'));

        res.render('pages/coordinator_start')
    
    } else {

        res.render('pages/index')

        /* res.render('pages/index', {
            isLoggedIn: session.userid ? 1 : 0
        }); */

    }

})

 
app.post('/login', (req, res) => {

    //console.log(req);

    let checkUser = getJSONFile('users.json').some((user) => {

        //console.log(m);

        if (user.username == req.body.username) {

            if (user.password == req.body.password) {

                session = req.session;
                session.userid = req.body.username;
                
                // console.log(req.session);
                // console.log(m.username);
                
                res.json({ error: false, username: true, password: true });

                return true;

            } else {

                res.json({ error: true, username: true, password: false });

                return true;

            } 
        
        }

    });

    if (!checkUser) {

        res.json({ error: true, username: false, password: false }); 

    }

})

app.post('/register',(req, res) => {
    
    let users = getJSONFile('users.json');

    let checkUser = users.some((user) => {

        if (user.keycode == req.body.keycode) {
            
            return true;
               
        }

        if (user.username == req.body.username) {

            return true;
               
        }

    });

    if (checkUser) {

        
        return res.json({ error: true, username: false, password: false }); 

    } else {

        users.push(req.body);

        fs.writeFile("./users.json", JSON.stringify(users, null, 4), JSON.stringify(json, null, 4), err => {

            if (err) {

                console.error(err);

            } 
        
        });

        res.redirect('./');

    }

});

app.get('/register',(req, res) =>{

    // res.sendFile(path.join(__dirname, '/public/html/register.html'));

    res.render('pages/register');

});

app.get('/coordinator_start', (req, res) => {

    //res.sendFile(path.join(__dirname, '/public/html/coordinator_start.html'));

    res.render('pages/coordinator_start');

});

app.get('/coordinator_config', (req, res) => {

    //res.sendFile(path.join(__dirname, '/public/html/coordinator_config.html'));

    res.render('pages/coordinator_config');

});

app.get('/student_start', (req, res) => {

    //res.sendFile(path.join(__dirname, '/public/html/student_start.html'));

    res.render('pages/student_start');

});

app.get('/student_group', (req, res) => {

    //res.sendFile(path.join(__dirname, '/public/html/student_group.html'));

    res.render('pages/student_group');

});

app.get('/student_profile', (req, res) => {

    //res.sendFile(path.join(__dirname, '/public/html/student_profile.html'));

    res.render('pages/student_profile');

});

app.get('/logout', (req,res) => {

    req.session.destroy();

    res.redirect('./');

});

app.post('/make_keycodes', (req, res) => {

    let groupName = req.body.groupName;
    
    let keycodes = checkFolderName(groupName);

    console.log(keycodes);
    
    return res.end();

});

app.listen(port, () => {

    console.log(`Server listening at http://localhost:${port}`);

});

function checkFolderName(folderName) {

    if (!fs.existsSync('./database/' + folderName)) {

        fs.mkdirSync('./database/' + folderName);

    }

    if(!fs.existsSync('./database/' + folderName + '/keycode.json')) {

        let keycode = makeKeycode(10);

        fs.writeFileSync('./database/' + folderName + '/keycode.json', JSON.stringify(keycode), { flag: 'a+' }, err => {

            if (err) throw err;

        });

    }
    
    return getJSONFile("database/" + folderName + "/keycode.json");
    
}
    
function getJSONFile(file) {
    
    var filepath = __dirname + '/' + file;

    var file = fs.readFileSync(filepath, 'utf8');

    return JSON.parse(file);
    
}

function makeKeycode(length) {

    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    
    while (counter < length) {
      
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    
    }
    
    return result;

}