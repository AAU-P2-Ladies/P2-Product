const express = require('express');
const path = require('path');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const { exit } = require('process');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

var fs = require('fs'), json;
var session;

const app = express();
const port = 3080;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').renderFile);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'public')));

const oneDay = 1000 * 60 * 60 * 24;

//MULTER CONFIG: to get file to temp server storage
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
        if (file.mimetype != 'application/json') {
             return next(new Error('Wrong file type'));
        }
         next(null, true)
    }
};

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

/**
 * Server listens to a post to '/login'
 * Takes Request (req) and Response (res) into account for the function
 */
app.post('/login', (req, res) => {

    // Loads the 'users.json'-file as 'users'
    let users = getJSONFile('users.json');
    
    // Searches through the 'users', where 'checkUser' is a boolean
    let checkUser = users.some((user) => {

        // Checks if the username inputted by the user matches the users in the database...
        if (user.username == req.body.username) {

            // ... checks if the password is correct 
            if (user.password == req.body.password) {

                // Checks if 'class' is part of the Request sent by the user.
                if (req.body.class) {

                    // Checks if the user has any classes attached to them.
                    if (user.classes.length == 0) {

                        // Sends a JSON-response back, that the user is currently not a part of a class
                        res.json({ error: true, username: true, password: true, class: false });

                        return true;

                    } else {

                        // Loops through all the users different classes that they are a part of, if any.
                        for (let index = 0; index < user.classes.length; index++) {

                            // Checks if a class that the user is assigned to matches the inputted class.
                            if (user.classes[index]["class"] == req.body.class) {

                                // Creates session for the user (now they are logged in)
                                session = req.session;
                                session.userid = req.body.username;
                                session.class = req.body.class;
                                
                                // Sends a JSON-response back, telling that that there was no errors
                                res.json({ error: false, username: true, password: true, class: true, isCoordinator: user.isCoordinator });

                                return true;

                            }

                        }

                        // Sends a JSON-response back, that the user is currently not a part of a class
                        res.json({ error: true, username: true, password: true, class: false });

                        return true;

                    }

                } else if (req.body.keycode) { // If the user has inputted a keycode instead of a class

                    // Loads the 'keycodes.json'-file as 'keycodes'
                    let keycodes = getJSONFile('keycodes.json');

                    // Sets 'keycode' and 'class1' has empty string
                    let keycode = "";
                    let class1 = "";

                    // Loops through all the keycodes, if any.
                    for (let index = 0; index < keycodes.length; index++) {

                        // Checks if the user has inputted a keycode that matches a class
                        if (keycodes[index]["keycode"] == req.body.keycode) {

                            // Assigns 'keycode' and 'class1' to their respective value
                            keycode = keycodes[index]["keycode"];
                            class1 = keycodes[index]["class"];

                            break;

                        }

                    }

                    // If 'keycode' and 'class1' is empty...
                    if (keycode == "" && class1 == "") {

                        // ... sends a JSON-response back, that the keycode is invalid 
                        res.json({ error: true, username: true, password: true, keycode: false });

                        return true;

                    } else { // Else...

                        // ... log the user in to the inputted class
                        session = req.session;
                        session.userid = req.body.username;
                        session.class = class1;

                        // Assigns 'duplicateClass' to 0
                        let duplicateClass = 0;

                        // Loops through all the users different classes that they are a part of, if any.
                        for (let index = 0; index < user.classes.length; index++) {

                            // Checks if the user is already part of the class with the inputted keycode
                            if (user.classes[index]["class"] == class1) {

                                duplicateClass = 1;
                                break;

                            }

                        }

                        // If the user is not part of the inputted class, then add the class to their user
                        if (duplicateClass == 0) {

                            user.classes.push({ class: class1 });

                            // Update the users file, taking into account that the user is now part of the class
                            fs.writeFile("./database/users.json", JSON.stringify(users, null, 4), JSON.stringify(json, null, 4), err => {

                                if (err) {
                    
                                    console.error(err);
                    
                                } 
                    
                            });

                        }
                        
                        // Sends a JSON-response back that there was no errors and the user is now logged in
                        res.json({ error: false, username: true, password: true, keycode: true, isCoordinator: user.isCoordinator });

                        return true;

                    }

                }

            } else {

                // Sends a JSON-response back that the inputted password is not correct
                res.json({ error: true, username: true, password: false });

                return true;

            } 
        
        }

    });

    // If the inputted username is not in the database
    if (!checkUser) {

        // Sends a JSON-response back that the inputted username is not correct
        res.json({ error: true, username: false, password: false }); 

    }

    // Ends the Response back to the user.
    return res.end();

})

/**
 * Server listens to a post to '/checkUserLogin'
 * Takes Request (req) and Response (res) into account for the function
 */
app.post('/checkUserLogin', (req, res) => {
    
    // Loads the 'users.json'-file as 'users'
    let users = getJSONFile('users.json');

    // Searches through the 'users', where 'checkUser' is a boolean
    let checkUser = users.some((user) => {

        // Checks if the username inputted by the user matches the users in the database...
        if (user.username == req.body.username) {

            // ... checks if the password is correct
            if (user.password == req.body.password) {

                // Checks if the user is a coordinator
                if (user.isCoordinator == 1) {

                    // Logs the user in
                    session = req.session;
                    session.userid = req.body.username;

                }

                // Sends a JSON-response back that the user is logged in and is a coordinator 
                res.json({ error: false, username: true, password: true, classes: user.classes, isCoordinator: user.isCoordinator });

                return true;

            } else {

                // Sends a JSON-response back that the inputted password is not correct
                res.json({ error: true, username: true, password: false });
    
                return true;
    
            } 
               
        }

    });

    // If the inputted username is not in the database
    if (!checkUser) {

        // Sends a JSON-response back that the inputted username is not correct
        res.json({ error: true, username: false, password: false }); 

    }

    // Ends the Response back to the user.
    return res.end();

});

/**
 * Server listens to a post to '/register'
 * Takes Request (req) and Response (res) into account for the function
 */
app.post('/register', (req, res) => {
    
    // Loads the 'users.json'-file as 'users'
    let users = getJSONFile('users.json');

    // Searches through the 'users', where 'checkUser' is a boolean
    let checkUser = users.some((user) => {

        // Checks if the inputted username already exists
        if (user.username == req.body.username) {

            // Returns true
            return true;
               
        }

    });

    // If 'checkUser' is true
    if (checkUser) {
        
        // Sends a JSON-response back that the username is already taken
        return res.json({ error: true, username: false, password: false }); 

    } else { // Else...

        // Assigns 'registerUser' to the "Request.body"-object
        let registerUser = req.body;

        // Assigns 'groups' and 'isCoordinator' to an empty array and 0 respectively
        Object.assign(registerUser, {
            groups: [],
            isCoordinator: 0
        });
        
        // Adds 'registerUser' to the 'users'-database
        users.push(registerUser);

        // Update the users file, taking into account that the user is now registered as a student
        fs.writeFile("./database/users.json", JSON.stringify(users, null, 4), JSON.stringify(json, null, 4), err => {

            if (err) {

                console.error(err);

            } 

        });

        // Sends a JSON-response back that there was no errors and the user is now registered
        res.json({ error: false, username: false, password: false });

        // Ends the Response back to the user.
        return res.end();

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

    if (!students.names) throw "Not right format"
   
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


app.post('/fileGroupUpload', multer(multerConfig).any(), (req, res) => {

    
    //console.log(req.body);
    //console.log(req.files);

    let groupName = ""
    let studentList = [];
    let topicsList = [];

    for (let index = 0; index < req.files.length; index++) {

        if (req.files[index].fieldname == "studentListInput" && 
            isJSON("uploads/" + req.files[index].filename)) {

            studentList = getJSONFile("uploads/" + req.files[index].filename);


        }

        if (req.files[index].fieldname == "topicsInput"  && 
        isJSON("uploads/" + req.files[index].filename)) {

            topicsList = getJSONFile("uploads/" + req.files[index].filename);

        }

    }
    
    for (let index = 0; index < studentList.length; index++) {

        if (studentList[index].hasOwnProperty('name') && 
            studentList[index].hasOwnProperty('studyNumber')) {

                console.log(studentList[index]);

        }

    }

    let checkGroupName = true;
    let checkStudentFile = true;
    let checkTopicsFile = true;
    
    if (req.body.nameGroupFormationInput == "") {

        checkGroupName = false;

    }  

    if (!studentList) {

        checkStudentFile = false;

    } 
    
    if (!topicsList) {
        
        checkTopicsFile = false;

    } 
    
    if (checkGroupName && checkStudentFile && checkTopicsFile) {
        
        studentObjectMaker(studentList.name, req.body.nameGroupFormationInput);
        res.json({error: false, groupName: true, studentFile: true, topicsFile: true})
        
    } else {

        res.json({error: true, groupName: checkGroupName, studentFile: checkStudentFile, topicsFile: checkTopicsFile})
            
    }
    

    

    //console.log(topicsList);

    //let students = getJSONFile("uploads/" + req.file[0].studentListInput)

    
    

    //res.render('pages/coordinator_start');

})
app.listen(port, () => {

    console.log(`Server listening at http://localhost:${port}`);

});
/**
 * Checks if a folder with a student.json exist
 * @param {*} folderName 
 * @returns 
 */
function checkFolderName(folderName) {

    if (!fs.existsSync('./database/' + folderName)) {

        fs.mkdirSync('./database/' + folderName);

    }

    if(!fs.existsSync('./database/' + folderName + '/students.json')) {

        fs.writeFileSync('./database/' + folderName + '/students.json', { flag: 'w+' }, err => {

            if (err) throw err;

        });

    }

    /*

    if(!fs.existsSync('./database/' + folderName + '/keycode.json')) {

        fs.writeFileSync('./database/' + folderName + '/keycode.json', data, { flag: 'w+' }, err => {

            if (err) throw err;

        });

    }

    */
    
    return getJSONFile(folderName + "/keycode.json");
    
}
/**
 * This function openes a json file
 * @param {Takes a name of a file} file 
 * @returns the content the file parsed as an object
 */    
function getJSONFile(file) {
    
    //Makes the path to the file
    var filepath = __dirname + '/database/' + file;

    console.log(filepath)
    
    //Reads content and saves it
    var file = fs.readFileSync(filepath, 'utf8');

    return JSON.parse(file);
    
}

/**
 * Checks to see if a files content is in the Json format  
 * @param {Takes a name of file} file 
 * @returns the state of the file is Json or not (True xor False)
 */
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
/**
 * This function semi-randomliy picks a char from a string to make a keycode 
 * @param {Takes wanted length of a keycode} length 
 * @returns a keycode in the form of a string 
 */
function makeKeycode(length) {

    let result = '';
    //String of chars that will be used in the wanted keycode
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    
    //Makes the keycode
    while (counter < length) {
      
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    
    }
    
    return result;

}
/**
 * This function makes an list of objects and writes a files with the students names, a specific code,
 * and a boolean function to check if they have registered
 * @param {This parameter takes names of the students uploaded by the coordinator} users 
 * @param {This to takes semester name inputted by coordinator to open its folder} semester 
 */
async function studentObjectMaker(users, semester){


    let students = [];

    //Makes an object with a name, code, and boolean, for every student sent by the coordinator
    for (let i in users) {
        
         students[i] = {
            Name: users[i],
            Keycodes: makeKeycode(10),
            isRegistered: 0
        }
    
    }

    await checkFolderName(semester);

    fs.writeFile("./database/" + semester + "/students.json", JSON.stringify(students, null, 4), JSON.stringify(json, null, 4), err => {

        if (err) {

            console.error(err);

        } 

    });

}