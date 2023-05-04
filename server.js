const express = require('express');
const path = require('path');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const { exit } = require('process');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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

const multerConfig = {
    
    storage: multer.diskStorage({
     //Setup where the user's file will go
     destination: function(req, file, next){
       next(null, './database/uploads');
       },   
        
        //Then give the file a unique name
        filename: function(req, file, next){
            //console.log(file);
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

        if (user.username == req.body.username) {

            return true;
               
        }

    });

    if (checkUser) {

        res.redirect('./register');

        return res.end();

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
/*
app.post('/prefSearch',(req, res) => {


    console.log(req);
    res.render('pages/student_start');

});
*/

app.get('/register',(req, res) =>{

    // res.sendFile(path.join(__dirname, '/public/html/register.html'));

    res.render('pages/register');

});

app.get('/coordinator_start', (req, res) => {

    //res.sendFile(path.join(__dirname, '/public/html/coordinator_start.html'));

    res.render('pages/coordinator_start');

});

app.get('/coordinator_config', (req, res) => {

    //res.sendFile(path.join(__dirname, '/public/html/coordinator_preconfig.html'));

    res.render('pages/coordinator_config');

});

app.get('/coordinator_preconfig', (req, res) => {

    //res.sendFile(path.join(__dirname, '/public/html/coordinator_config.html'));

    res.render('pages/coordinator_preconfig');

});

app.post('/coordinator_studentId', multer(multerConfig).single('file'), (req, res) =>{

    
    //console.log(req.file.filename);

    let students = getJSONFile("uploads/"+req.file.filename)


    studentObject

    //res.render('pages/coordinator_start');

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

app.post('/fileGroupUpload', multer(multerConfig).any(), (req, res) =>{

    let groupFormationName = req.body.nameGroupFormationInput;
    let studentList = [];
    let topicsList = [];

    if (fs.existsSync("database/" + groupFormationName)) {

        res.json({ error: true, groupFormationName: false, studentList: false, topicsList: false, studentListJSON: false, topicsListJSON: false });

        return res.end();

    }
    
    fs.mkdirSync("database/" + groupFormationName);

    for (let index = 0; index < req.files.length; index++) {

        if (req.files[index].fieldname == "studentListInput") {

            if (isJSON("uploads/" + req.files[index].filename)) {

                studentList = getJSONFile("uploads/" + req.files[index].filename);

                moveFile("./database/uploads/" + req.files[index].filename, 
                         "./database/" + groupFormationName + "/students.json"
                );

            } else {

                res.json({ error: true, groupFormationName: true, studentList: false, topicsList: false, studentListJSON: false, topicsListJSON: false });

                return res.end();

            }

        }

        if (req.files[index].fieldname == "topicsInput") {

            if (isJSON("uploads/" + req.files[index].filename)) {

                topicsList = getJSONFile("uploads/" + req.files[index].filename);

                moveFile("./database/uploads/" + req.files[index].filename, 
                         "./database/" + groupFormationName + "/topics.json"
                );

            } else {

                res.json({ error: true, groupFormationName: true, studentList: true, topicsList: false, studentListJSON: false, topicsListJSON: false });

                return res.end();

            } 

        }

    }
    
    for (let index = 0; index < studentList.length; index++) {

        if (studentList[index].hasOwnProperty('name')) {

            console.log(studentList[index]);

        } else {

            res.json({ error: true, groupFormationName: true, studentList: true, topicsList: true, studentListJSON: false, topicsListJSON: false });

            return res.end();

        }

    }

    for (let index = 0; index < topicsList.length; index++) {

        if (topicsList[index].hasOwnProperty('topic')) {

            console.log(topicsList[index]);

        } else {

            res.json({ error: true, groupFormationName: true, studentList: true, topicsList: true, studentListJSON: true, topicsListJSON: false });

            return res.end();

        }

    }

    res.json({ error: false, groupFormationName: true, studentList: true, topicsList: true, studentListJSON: true, topicsListJSON: true });

    return res.end();

});

app.post('/search', (req, res) => {

    const queryName = req.body.name;
    const className = req.body.className;

    let students = getJSONFile(className + '/students.json');
    let studentsArray = [];

    students.map(({navn, email}) => navn);

    for (let i in students) {

        studentsArray.push(students[i]['navn']);

    }

    let stringToMatch = queryName;

    if (stringToMatch != "") {

        studentsArray = studentsArray.filter(function(p) {

            let studentArray = p.split('');
            let studentToMatch = [];
            
            for(var i = 0; i < stringToMatch.length; i++) {
            
                studentToMatch.push(studentArray[i]);
            
            }
            
            return stringToMatch.toLowerCase() == studentToMatch.join('').toLowerCase();
        
        })

    }

    res.json({students: studentsArray});

    return res.end();

});

app.post('/updateClassConfig', (req, res) => {

    const className = req.body.className;
    const amountOfGroupMembers = req.body.amountOfGroupMembers;
    const studentPreferences = req.body.studentPreferences;
    const previousMembers = req.body.previousMembers;
    const objectArray = req.body.blockedPairArray;

    let config = {
        amountOfGroupMembers: amountOfGroupMembers,
        studentPreferences: studentPreferences,
        previousMembers: previousMembers
    };

    fs.writeFile("./database/" + className + "/config.json", JSON.stringify(config, null, 4), err => {

        if (err) {

            console.error(err);

        } 
    
    });

    let blockedArray = [];

    for (let key in objectArray) {

        blockedArray.push(objectArray[key].name);

    }

    let students = getJSONFile(className + '/students.json');

    students.forEach(element => {

        if (blockedArray.includes(element.navn)) {

            objectArray.filter(object => {

                if (element.navn === object.name) {

                    element.blocks = object.blocks;

                }
            
            });

        }
    
    });

    fs.writeFile("./database/" + className + "/students.json", JSON.stringify(students, null, 4), err => {

        if (err) {

            console.error(err);

        } 
    
    });

    res.json({ error: false});

    return res.end();

});

app.post('/unlockClass', (req, res) => {

    const className = req.body.className;
    
    // kør studentObjectMaker

    res.json({ error: false});

    return res.end();

});

app.listen(port, () => {

    console.log(`Server listening at http://localhost:${port}`);

});
    
function getJSONFile(file) {
    
    var filepath = __dirname + '/database/' + file;

    var file = fs.readFileSync(filepath, 'utf8');

    return JSON.parse(file);
    
}

function isJSON(file) {

    var filepath = __dirname + '/database/' + file;

    var file = fs.readFileSync(filepath, 'utf8');

    try {
        JSON.parse(file);
    } catch (e) {
        return false;
    }
    return true;
}

function moveFile(oldPath, newPath) { // https://stackoverflow.com/a/21431865
    fs.readFile(oldPath , function(err, data) {
        fs.writeFile(newPath, data, function(err) {
            fs.unlink(oldPath, function(){
                if(err) throw err;
            });
        }); 
    }); 
}