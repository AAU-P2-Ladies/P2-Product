const express = require('express');
const path = require('path');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const { exit } = require('process');
const multer  = require('multer');

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

//MULTER CONFIG: to get file photos to temp server storage
const multerConfig = {
    
    storage: multer.diskStorage({
     //Setup where the user's file will go
     destination: function(req, file, next){
       next(null, './database/uploads');
       },   
        
        //Then give the file a unique name
        filename: function(req, file, next){
            console.log(file);
            const ext = file.mimetype.split('/')[1];
            next(null, file.fieldname + '-' + Date.now() + '.'+ext);
          }
    }),   
        
        //A means of ensuring only images are uploaded. 
    fileFilter: function(req, file, next){
        if(!file){
            next();
        }
        const json = file.mimetype.startsWith('application/');
        if(json){
           console.log('file uploaded');
            next(null, true);
        }else{
            console.log("file not supported");
              
            //TODO:  A better message response to user on failure.
            return next();
        }
    }
};



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

    //console.log(req.body);

    let users = getJSONFile('users.json');
    
    let checkUser = users.some((user) => {

        // console.log(user);

        if (user.username == req.body.username) {

            if (user.password == req.body.password) {

                if (req.body.class) {

                    if (user.classes.length == 0) {

                        res.json({ error: true, username: true, password: true, class: false });

                        return true;

                    } else {

                        for (let index = 0; index < user.classes.length; index++) {

                            if (user.classes[index]["class"] == req.body.class) {

                                session = req.session;
                                session.userid = req.body.username;
                                session.class = req.body.class;
                                
                                // console.log(req.session);
                                // console.log(m.username);
                                console.log(session.class);
                                
                                res.json({ error: false, username: true, password: true, class: true });

                                return true;

                            }

                        }

                        res.json({ error: true, username: true, password: true, class: false });

                        return true;

                    }

                } else if (req.body.keycode) {

                    let keycodes = getJSONFile('keycodes.json');

                    let keycode = "";
                    let class1 = "";

                    for (let index = 0; index < keycodes.length; index++) {

                        if (keycodes[index]["keycode"] == req.body.keycode) {

                            console.log('hej ' + req.body.keycode);

                            keycode = keycodes[index]["keycode"];
                            class1 = keycodes[index]["class"];

                            break;

                        }

                    }

                    if (keycode == "" && class1 == "") {

                        res.json({ error: true, username: true, password: true, keycode: false });

                        return true;

                    } else {

                        session = req.session;
                        session.userid = req.body.username;
                        session.class = class1;

                        let duplicateClass = 0;

                        for (let index = 0; index < user.classes.length; index++) {

                            if (user.classes[index]["class"] == class1) {

                                duplicateClass = 1;
                                break;

                            }

                        }

                        if (duplicateClass == 0) {

                            user.classes.push({ class: class1 });

                        }
                        
                        // console.log(req.session);
                        // console.log(m.username);
                        console.log(user);

                        fs.writeFile("./database/users.json", JSON.stringify(users, null, 4), JSON.stringify(json, null, 4), err => {

                            if (err) {
                
                                console.error(err);
                
                            } 
                
                        });
                        
                        res.json({ error: false, username: true, password: true, keycode: true });

                        return true;

                    }

                }

            } else {

                res.json({ error: true, username: true, password: false });

                return true;

            } 
        
        }

    });

    if (!checkUser) {

        res.json({ error: true, username: false, password: false }); 

    }

    return res.end();

})

app.post('/checkUserLogin',(req, res) => {
    
    let users = getJSONFile('users.json');

    let checkUser = users.some((user) => {

        if (user.username == req.body.username) {

            if (user.password == req.body.password) {

                res.json({ error: false, username: true, password: true, classes: user.classes, isCoordinator: user.isCoordinator });

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

    return res.end();

});

app.post('/register',(req, res) => {
    
    let users = getJSONFile('users.json');

    console.log(users);

    let checkUser = users.some((user) => {

        if (user.username == req.body.username) {

            return true;
               
        }

    });

    if (checkUser) {
        
        return res.json({ error: true, username: false, password: false }); 

    } else {

        let registerUser = req.body;

        Object.assign(registerUser, {
            groups: [],
            isCoordinator: 0
        });
        
        users.push(registerUser);

        console.log(users)

        fs.writeFile("./database/users.json", JSON.stringify(users, null, 4), JSON.stringify(json, null, 4), err => {

            if (err) {

                console.error(err);

            } 

        });

        res.json({error: false, keycode: req.body.keycode});

        return res.end();

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

app.post('/coordinator_studentId', multer(multerConfig).single('file'), (req, res) =>{

    
    //console.log(req.file.filename);

    let students = getJSONFile("uploads/"+req.file.filename)

   
    studentObjectMaker(students.names, req.body.groupName);

    

    res.render('pages/coordinator_start');

})

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


app.listen(port, () => {

    console.log(`Server listening at http://localhost:${port}`);

});

function checkFolderName(folderName, data) {

    if (!fs.existsSync('./database/' + folderName)) {

        fs.mkdirSync('./database/' + folderName);

    }

    if(!fs.existsSync('./database/' + folderName + '/students.json')) {

        fs.writeFileSync('./database/' + folderName + '/students.json', { flag: 'w+' }, err => {

            if (err) throw err;

        });

    }

    if(!fs.existsSync('./database/' + folderName + '/keycode.json')) {

        fs.writeFileSync('./database/' + folderName + '/keycode.json', data, { flag: 'w+' }, err => {

            if (err) throw err;

        });

    }
    
    return getJSONFile(folderName + "/keycode.json");
    
}
    
function getJSONFile(file) {
    
    var filepath = __dirname + '/database/' + file;

    console.log(filepath)

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

async function studentObjectMaker(users,semester){


    let students = [];


    for (let i in users) {
        
         students[i] = {
            Name: users[i],
            Keycodes: makeKeycode(10),
            isRegistered: 0
        }
    
    }

    fs.writeFile("./database/"+semester+"/students.json", JSON.stringify(students, null, 4), JSON.stringify(json, null, 4), err => {

        if (err) {

            console.error(err);

        } 

    });

}