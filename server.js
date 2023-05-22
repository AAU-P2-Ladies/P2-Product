// Requires all dependencies and modules 
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const { exit } = require("process");
const multer = require("multer");
const { get } = require("http");
const { log } = require("console");
const alg = require("./public/js/algorithm.js");
const { response } = require("express");
var fs = require("fs"), json;

// Sets a global variable 'session' for later use 
var session;

// Initializes 'app' and 'port' for use with Express-framework and port for the server to listen to.
const app = express();
const port = 3080;

// Using the Express-framework, we can use the Express-template engine to use Embedded JavaScript (EJS)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", require("ejs").renderFile);

// Using the Express-framework, we can use the JSON-middleware and URLEncoded-middleware to parse incoming requests
// This has to be done, so that Express can take advantage of POST and PUT requests. 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Using the Express-framework, we can use the static()-middleware to serve JS- and CSS-files. We put these in the public-folder
app.use(express.static(path.join(__dirname, "public")));

// MULTER CONFIG: to get file to temporary server storage
const multerConfig = {
  storage: multer.diskStorage({
    // Setup where the user's file will go
    destination: function (req, file, next) {
      next(null, "./database/uploads");
    },

    // Then give the file a unique name
    filename: function (req, file, next) {
      const ext = file.mimetype.split("/")[1];

      next(null, file.fieldname + "-" + Date.now() + "." + ext);
    },
  }),

  // Then check if the file is a JSON-file
  fileFilter: function (req, file, next) {
    if (file.mimetype != "application/json") {
      return next(new Error("Wrong file type"));
    }

    next(null, true);
  },
};

// Tells Express to use the Express-sessions-module to keep track of and store sessions
app.use(
  sessions({
    secret: "merete",
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false,
  })
);

// Tells Express to use the cookieParser-module for keeping track of and store cookies
app.use(cookieParser());

// Global locals to use with EJS file
// baseUrl used for checking if the server is on a local machine or on a dedicated server, like AAU-server
app.use(function (req, res, next) {
  res.locals.baseUrl = (req.headers['x-forwarded-host']) ? ('https://' + req.headers['x-forwarded-host'] + '/node0') : (req.protocol + '://' + req.headers.host);
  res.locals.isLoggedIn = (req.session.userid) ? 1 : 0;
  res.locals.isCoordinator = req.session.isCoordinator;
  next();
});

app.get("/", (req, res) => {

  // Checks if the user is not logged in, if so, redirect them to the index page
  if (!req.session.userid) {
    res.render("pages/index");
  } else {
    // Checks if the user is a coordinator or not, if they are not, redirect to student start page, else, coordinator start page
    if (req.session.isCoordinator == 0) {
      res.redirect("./student_start");
    } else if (req.session.isCoordinator == 1) {
      res.redirect("./coordinator_start");
    }
  }
});

/**
 * Server listens to a post to '/login'
 * Takes Request (req) and Response (res) into account for the function
 */
app.post("/login", (req, res) => {
  // Loads the 'users.json'-file as 'users'
  let users = getJSONFile("users.json");

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
            res.json({
              error: true,
              username: true,
              password: true,
              class: false,
            });

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
                session.isCoordinator = user.isCoordinator;

                // Sends a JSON-response back, telling that that there was no errors
                res.json({
                  error: false,
                  username: true,
                  password: true,
                  class: true,
                  isCoordinator: user.isCoordinator,
                });

                return true;
              }
            }

            // Sends a JSON-response back, that the user is currently not a part of a class
            res.json({
              error: true,
              username: true,
              password: true,
              class: false,
            });

            return true;
          }
        } else if (req.body.keycode) {
          // If the user has inputted a keycode instead of a class

          // Loads the 'keycodes.json'-file as 'keycodes'
          let keycodes = getJSONFile("keycodes.json");

          // Sets 'keycode' and 'class1' has empty string
          let keycode = "";
          let class1 = "";

          // Loops through all the , if any.
          for (let index = 0; index < keycodes.length; index++) {
            // Checks if the user has inputted a keycode that matches a class
            if (keycodes[index].keycode == req.body.keycode) {
              // Assigns 'keycode' and 'class1' to their respective value
              keycode = keycodes[index].keycode;
              class1 = keycodes[index].class;

              break;
            }
          }

          // If 'keycode' and 'class1' is empty...
          if (keycode == "" && class1 == "") {
            // ... sends a JSON-response back, that the keycode is invalid
            res.json({
              error: true,
              username: true,
              password: true,
              keycode: false,
            });

            return true;
          } else {
            // ... log the user in to the inputted class
            session = req.session;
            session.userid = req.body.username;
            session.class = class1;
            session.isCoordinator = user.isCoordinator;

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
              user.classes.push({ class: class1, keycode: keycode });

              // Loads the students file for the current class
              classFileName = class1 + "/students.json";
              classFile = getJSONFile(classFileName);

              // Loops through the students to find the inputted keycode and sets 'isRegistered' to 1
              classFile.some((userKey) => {
                if (userKey.keycode == keycode) {
                  userKey.isRegistered = 1;
                }
              });

              // Writes back into the students file
              fs.writeFile(
                "./database/" + class1 + "/students.json",
                JSON.stringify(classFile, null, 4),
                (err) => {
                  if (err) {
                    console.error(err);
                  }
                }
              );

              // Update the users file, taking into account that the user is now part of the class
              fs.writeFile(
                "./database/users.json",
                JSON.stringify(users, null, 4),
                (err) => {
                  if (err) {
                    console.error(err);
                  }
                }
              );

              // Loop to remove the current keycode
              for (let i in keycodes) {
                if (keycodes[i].keycode == keycode) {
                  keycodes.splice(i, 1);

                  break;
                }
              }

              // Writes the  back into the keycodes file
              fs.writeFile(
                "./database/keycodes.json",
                JSON.stringify(keycodes, null, 4),
                (err) => {
                  if (err) {
                    console.error(err);
                  }
                }
              );
            }

            // Sends a JSON-response back that there was no errors and the user is now logged in
            res.json({
              error: false,
              username: true,
              password: true,
              keycode: true,
              isCoordinator: user.isCoordinator,
            });

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
});

/**
 * Server listens to a post to '/checkUserLogin'
 * Takes Request (req) and Response (res) into account for the function
 */
app.post("/checkUserLogin", (req, res) => {
  // Loads the 'users.json'-file as 'users'
  let users = getJSONFile("users.json");

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
          session.isCoordinator = user.isCoordinator;
        }

        // Sends a JSON-response back that the user is logged in and is a coordinator
        res.json({
          error: false,
          username: true,
          password: true,
          classes: user.classes,
          isCoordinator: user.isCoordinator,
        });

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
app.post("/register", (req, res) => {

  // Loads the 'users.json'-file as 'users'
  let users = getJSONFile("users.json");

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
  } else {
    // Assigns 'registerUser' to the "Request.body"-object
    let registerUser = req.body;

    // Assigns 'groups' and 'isCoordinator' to an empty array and 0 respectively
    Object.assign(registerUser, {
      classes: [],
      isCoordinator: 0,
    });

    // Adds 'registerUser' to the 'users'-database
    users.push(registerUser);

    // Update the users file, taking into account that the user is now registered as a student
    fs.writeFile(
      "./database/users.json",
      JSON.stringify(users, null, 4),
      (err) => {
        if (err) {
          console.error(err);
        }
      }
    );

    // Sends a JSON-response back that there was no errors and the user is now registered
    res.json({ error: false, username: false, password: false });

    // Ends the Response back to the user.
    return res.end();
  }
});

app.get("/register", (req, res) => {

  // Checks if the user is already logged in, if so, redirect them to the index page instead of the register page
  if (req.session.userid) {
    res.redirect("./");
  } else {
    res.render("pages/register");
  }
});

app.get("/coordinator_start", (req, res) => {
  // Checks if the user is not logged in or if the user is not a coordinator, if so, redirect them to the index page instead of the coordinator start page
  if (!req.session.userid || req.session.isCoordinator != 1) {
    res.redirect("./");
  } else {
    res.render("pages/coordinator_start");
  }
});

app.get("/coordinator_preconfig", (req, res) => {
  // Checks if the user is not logged in or if the user is not a coordinator, if so, redirect them to the index page instead of the coordinator preconfig page
  if (!req.session.userid || req.session.isCoordinator != 1) {
    res.redirect("./");
  } else {
    res.render("pages/coordinator_preconfig");
  }
});

app.get("/:className/coordinator_view", (req, res) => {
  // Checks if the user is not logged in or if the user is not a coordinator, if so, redirect them to the index page instead of the coordinator view page
  if (!req.session.userid || req.session.isCoordinator != 1) {
    res.redirect("./");
  } else {
    res.render("pages/coordinator_view");
  }
});

app.post("/getStudents", (req, res) => {
  // Gets the students-JSON-file and returns it to the client
  const className = req.body.className;

  let studentsFile = getJSONFile(className + "/students.json");

  return res.json(studentsFile);
});

app.post("/makeGroups", (req, res) => {
  // Gets the students-JSON-file and config-JSON-file
  const className = req.body.className;

  let students = getJSONFile(className + "/students.json");
  let configFile = getJSONFile(className + "/config.json");

  // Sets the amount of group members for that class
  let groupSize = configFile.amountOfGroupMembers;
  // Sets the max running time for the algorithm
  const maxTime = 30;

  // Runs the Master Algorithm and assigns the groups to the 'groups'-variable
  let groups = alg.masterAlgorithm(students, groupSize, maxTime);

  // Writes the groups from the algorithm into the 'groups.json'-file
  fs.writeFile(
    "./database/" + className + "/groups.json",
    JSON.stringify(groups, null, 4),
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );

  // Returns that there was no errors back to the client
  res.json({ error: false });

  return res.end();
});

app.get("/:className/coordinator_config", (req, res) => {
  // Checks if the user is not logged in or if the user is not a coordinator, if so, redirect them to the index page instead of the coordinator config page
  if (!req.session.userid || req.session.isCoordinator != 1) {
    res.redirect("./");
  } else {
    // Loads the 'users.json'-file
    let users = getJSONFile("users.json");

    let checkClass = 0;

    // Loops through the users and checks if the user's class matches the inputted class
    users.some((user) => {
      if (user.username == req.session.userid) {
        for (let index = 0; index < user.classes.length; index++) {
          if (user.classes[index]["class"] == req.params.className) {
            checkClass = 1;

            break;
          }
        }
      }
    });

    // If it matches, then we serve the coordinator config page to them
    if (checkClass == 1) {
      res.render("pages/coordinator_config");
    } else {
      // Else, we redirect them to the homepage
      res.redirect("/../");
    }
  }
});

// Fetch the current coordinators classes in order to display list of options
app.get("/getCoordinatorClasses", (req, res) => {
  let userFile = getJSONFile("users.json");
  let classes = [];
  // Loop through users to find current logged in user and find their classes
  for (let user of userFile) {
    if (user.username == req.session.userid) {
      classes = user.classes;
    }
  }
  res.json(classes);
  return res.end();
});

// Save the coordinators chosen class ID to edit/view
app.post("/postCoordinatorClass", (req, res) => {
  session = req.session
  session.class = req.body.class;
  //console.log(req.session.class);
});

app.get("/student_start", (req, res) => {
  // Checks if the user is not logged in or if the user is not a student, if so, redirect them to the index page instead of the student start page
  if (!req.session.userid || req.session.isCoordinator != 0) {
    res.redirect("./");
  } else {
    res.render("pages/student_start");
  }
});

app.get("/student_group", (req, res) => {
  // Checks if the user is not logged in or if the user is not a student, if so, redirect them to the index page instead of the student group page
  if (!req.session.userid || req.session.isCoordinator != 0) {
    res.redirect("./");
  } else {
    res.render("pages/student_group");
  }
});

app.get("/student_profile", (req, res) => {
  // Checks if the user is not logged in or if the user is not a student, if so, redirect them to the index page instead of the student profile page
  if (!req.session.userid || req.session.isCoordinator != 0) {
    res.redirect("./");
  } else {
    res.render("pages/student_profile");
  }
});

// Logs the current user out and redirect them to the homepage
app.get("/logout", (req, res) => {
  req.session.destroy();

  res.redirect("./");
});

app.post("/fileGroupUpload", multer(multerConfig).any(), (req, res) => {
  // Assigns 'groupFormationName' to the user-inputted group formation name
  let groupFormationName = req.body.nameGroupFormationInput;
  let studentList = [];
  let topicsList = [];

  // Checks if the group formation name already exists, if so, return an error
  if (fs.existsSync("database/" + groupFormationName)) {
    res.json({
      error: true,
      groupFormationName: false,
      studentList: false,
      topicsList: false,
      studentListJSON: false,
      topicsListJSON: false,
    });

    return res.end();
  }

  // Makes a folder with the group formation name
  fs.mkdirSync("database/" + groupFormationName);

  // Loops through the user-inputted files, checks if they are valid JSON and moves them to the correct folder
  for (let index = 0; index < req.files.length; index++) {
    if (req.files[index].fieldname == "studentListInput") {
      if (isJSON("uploads/" + req.files[index].filename)) {
        studentList = getJSONFile("uploads/" + req.files[index].filename);

        moveFile(
          "./database/uploads/" + req.files[index].filename,
          "./database/" + groupFormationName + "/students.json"
        );
      } else {
        // Returns an error if the user-inputted students-file is not a valid JSON-file
        res.json({
          error: true,
          groupFormationName: true,
          studentList: false,
          topicsList: false,
          studentListJSON: false,
          topicsListJSON: false,
        });

        return res.end();
      }
    }

    if (req.files[index].fieldname == "topicsInput") {
      if (isJSON("uploads/" + req.files[index].filename)) {
        topicsList = getJSONFile("uploads/" + req.files[index].filename);

        moveFile(
          "./database/uploads/" + req.files[index].filename,
          "./database/" + groupFormationName + "/topics.json"
        );
      } else {
        // Returns an error if the user-inputted topics-file is not a valid JSON-file
        res.json({
          error: true,
          groupFormationName: true,
          studentList: true,
          topicsList: false,
          studentListJSON: false,
          topicsListJSON: false,
        });

        return res.end();
      }
    }
  }

  // Loops through the students-file
  for (let index = 0; index < studentList.length; index++) {
    // If an object in the students-file does not have the name-property, then return an error
    if (!studentList[index].hasOwnProperty("name")) {
      res.json({
        error: true,
        groupFormationName: true,
        studentList: true,
        topicsList: true,
        studentListJSON: false,
        topicsListJSON: false,
      });

      return res.end();
    }
  }

  for (let index = 0; index < topicsList.length; index++) {
    // If an object in the topics-file does not have the topic-property, then return an error
    if (!topicsList[index].hasOwnProperty("topic")) {
      res.json({
        error: true,
        groupFormationName: true,
        studentList: true,
        topicsList: true,
        studentListJSON: true,
        topicsListJSON: false,
      });

      return res.end();
    }
  }

  // Loads the 'users.json'-file
  let users = getJSONFile("users.json");

  users.some((user) => {
    if (user.username == req.session.userid) {
      // Assigns 'duplicateClass' to 0
      let duplicateClass = 0;

      // Loops through all the users different classes that they are a part of, if any.
      for (let index = 0; index < user.classes.length; index++) {
        // Checks if the user is part of the class with the inputted class
        if (user.classes[index]["class"] == groupFormationName) {
          duplicateClass = 1;
          break;
        }
      }

      // If the user is not part of the class, then we assign them to it
      if (duplicateClass == 0) {
        user.classes.push({ class: groupFormationName });
      }

      // Update the users file
      fs.writeFile(
        "./database/users.json",
        JSON.stringify(users, null, 4),
        (err) => {
          if (err) {
            console.error(err);
          }
        }
      );

      return true;
    }
  });

  // Returns that there was no errors
  res.json({
    error: false,
    groupFormationName: true,
    studentList: true,
    topicsList: true,
    studentListJSON: true,
    topicsListJSON: true,
  });

  return res.end();
});

app.post("/search", (req, res) => {
  // Assigns 'queryName' to the user-inputted name
  const queryName = req.body.name;

  // If there is not sent a class name with the request, we assign 'className' to the session's class name
  let className;
  if (req.body.className == "") {
    className = req.session.class;
  } else {
    className = req.body.className;
  }

  // Loads the correct students-file
  let students = getJSONFile(className + "/students.json");
  let studentsArray = [];

  // Maps out students to only have name-property 
  students.map(({ name }) => name);

  // Loops through the students and puts the student names into 'studentsArray'
  for (let i in students) {
    studentsArray.push(students[i]["name"]);
  }

  // Here we compare the user-inputted string with the 'studentsArray'
  let stringToMatch = queryName;
  if (stringToMatch != "") {
    studentsArray = studentsArray.filter(function (p) {
      let studentArray = p.split("");
      let studentToMatch = [];

      for (let i = 0; i < stringToMatch.length; i++) {
        studentToMatch.push(studentArray[i]);
      }

      return (
        stringToMatch.toLowerCase() == studentToMatch.join("").toLowerCase()
      );
    });
  }

  // Returns the 'studentsArray' with the matching students, based on the input, to the client
  res.json({ students: studentsArray });

  return res.end();
});

app.post("/updateClassConfig", (req, res) => {
  // Assigns all the relevant Request data
  const className = req.body.className;
  const amountOfGroupMembers = req.body.amountOfGroupMembers;
  const studentPreferences = req.body.studentPreferences;
  const includeRoles = req.body.includeRoles ? "1" : "0";
  const objectArray = req.body.blockedPairArray;

  // Assigns 'config' to be an object of amountOfGroupMembers, studentPreferences and includeRoles
  let config = {
    amountOfGroupMembers: amountOfGroupMembers,
    studentPreferences: studentPreferences,
    includeRoles: includeRoles
  };

  // Writes 'config' into the 'config.json'-file
  fs.writeFile(
    "./database/" + className + "/config.json",
    JSON.stringify(config, null, 4),
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );

  let blockedArray = [];

  // Loops through 'objectArray' and sets 'blockedArray' to be the names of all the blocked pairs 
  for (let key in objectArray) {
    blockedArray.push(objectArray[key].name);
  }

  // Loads the students-file
  let students = getJSONFile(className + "/students.json");

  // Loops through all students and sets blocked pairs accordingly
  students.forEach((element) => {
    if (blockedArray.includes(element.name)) {
      objectArray.filter((object) => {
        if (element.name === object.name) {
          element.blocks = object.blocks;
        }
      });
    }
  });

  // Writes the students, with the blocked pairs, back into the 'students.json'-file
  fs.writeFile(
    "./database/" + className + "/students.json",
    JSON.stringify(students, null, 4),
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );

  // Returns that there was no errors back to the client
  res.json({ error: false });

  return res.end();
});

app.post("/unlockClass", (req, res) => {
  const className = req.body.className;

  // Loads the students-file
  let students = getJSONFile(className + "/students.json");

  // Runs the 'studentKeycodeMaker'-function to generate keycodes for the students
  studentKeycodeMaker(students, className);

  // Returns that there was no errors back to the client
  res.json({ error: false });

  return res.end();
});

app.get("/getGroups", (req, res) => {
  const className = req.session.class;

  // Checks if the 'groups.json'-file exists, if so, return an error
  if (!fs.existsSync("./database/" + className + "/groups.json")) {
    return res.json({ error: true });
  } else {
    // Loads the groups and returns them
    let groups = getJSONFile(className + "/groups.json");

    return res.json(groups);
  }
});

/**
 * This get is used for the output page for a student to see their group after group formation
 */
app.get("/getGroup", (req, res) => {
  let users = getJSONFile("users.json");
  let username = req.session.userid;
  let keycode = "";
  // First, find the current users keycode in order to be able to find their name from the student file
  for (let user of users) {
    // Checks for the first user in the database that has the username of the currently logged in student and sets 'keycode' for that student
    if (user.username == username) {
      for (let i in user.classes) {
        if (user.classes[i].class == req.session.class) {
          keycode = user.classes[i].keycode;
        }
      }
    }
  }

  let fileName = req.session.class + "/students.json";
  let classFile = getJSONFile(fileName);
  let name = "";
  // Loops through the students JSON-file to find the name of the student (user) that is logged in
  for (let student of classFile) {
    if (student.keycode == keycode) {
      name = student.name;
      break;
    }
  }

  // Having found the name of the current user, search the group file to find this users group
  fileName = req.session.class + "/groups.json";
  let group;
  let groupFile = getJSONFile(fileName);
  for (let i in groupFile) {
    for (let j in groupFile[i].students) {
      if (groupFile[i].students[j].name == name) {
        group = groupFile[i];
        break;
      }
    }
  }

  // Return the group else end the response
  if (group) {
    return res.json(group);
  } else {
    return res.end();
  }
});
/**
 * Checks data for any malicious intent
 * Saves data from request to right student
 */
app.post("/saveProfile", (req, res) => {
  let students = getJSONFile(req.session.class + "/students.json");
  let topicList = getJSONFile(req.session.class + "/topics.json");
  let users = getJSONFile("users.json");
  let keycode;
  
  // Loop through to find the keycode of the current student (user) that is logged in
  usersfind: for (let i in users) {
    if (req.session.userid == users[i].username) {
      for (let j in users[i].classes) {
        if (users[i].classes[j].class == req.session.class) {
          keycode = users[i].classes[j].keycode;
          break usersfind;
        }
      }
    }
  }

  students.find((std) => {
    if (std.keycode == keycode) {

      const studentPreferences = req.body.prefs;
      //Check in Student JSON
      let studentsName = [];
      for (let i in students) {
        studentsName.push(students[i].name);
      }

      for (let i in req.body.prefs) {
        if (studentsName.includes(req.body.prefs[i])) {
          for (let j in req.body.blocks) {
            if (req.body.blocks[j] == req.body.prefs[i]) {
              res.json({ error: true, prefs: true });
              return res.end();
            }
          }
        } else {
          res.json({error: true, prefs: true, blocks: false, topics: false, roles: false});
          return res.end();
        }
      }
      //Student Exist

      const studentBlocks = req.body.blocks;
      //Check in Student JSON

      for (let i in req.body.blocks) {
        if (studentsName.includes(req.body.blocks[i])) {
          for (let j in students.blocks) {
            if (students.blocks[j] == req.body.blocks[i]) {
              res.json({error: true, prefs: false, blocks: true, topics: false, roles: false});
              return res.end();
            }
          }
        } else {
          res.json({error: true, prefs: false, blocks: true, topics: false, roles: false});
          return res.end();
        }
      }
      const studentTopics = getTopicList(topicList, req.body.topics)
      //Check in Topic JSON
      if (topicList.length < req.body.topics.length || 0 > req.body.topics.length){
        res.json({error: true, prefs: false, blocks: false, topics: true, roles: false});
        return res.end();
      }

      const studentRoles = req.body.roles;
      //Future check for if the roles are equal to the roles made by coordinator
      if (9 < req.body.topics.length || 0 > req.body.topics.length) {
        res.json({error: true, prefs: false, blocks: false, topics: false, roles: true});
        return res.end();
      }
      console.log("Adding to user" + std.name);
      console.log(studentTopics.length);
      for (let k in studentPreferences) {
        std.prefs.push(studentPreferences[k]);
      }
      for (let k in studentBlocks) {
        std.blocks.push(studentBlocks[k]);
      }
      for (let k in studentTopics) {
        std.topics.push(studentTopics[k]);
      }
      for (let k in studentRoles) {
        std.roles.push(studentRoles[k]);
      }

      fs.writeFile(
        "./database/" + req.session.class + "/students.json",
        JSON.stringify(students, null, 4),
        (err) => {
          if (err) {
            console.error(err);
          }
        }
      );
      
      res.json({error: false, prefs: false, blocks: false, topics: false, roles: false});
      return res.end();

    }
    
  });
  
});
/**
 * Get a list of students that are blocked from the requesting user
 */
app.get("/getBlockedPair", (req, res) => {
  let students = getJSONFile(req.session.class + "/students.json");
  let users = getJSONFile("users.json");
  let keycode;
  usersFind:
  for (let i in users) {
    if (req.session.userid == users[i].username) {
      for (let j in users[i].classes) {
        if (users[i].classes[j].class == req.session.class) {
          keycode = users[i].classes[j].keycode;
          break usersFind;
        }
      }
    }}
    students.some((std) => {
      if (std.keycode == keycode) {
          res.json({ error: false, blocked: std.blocks });
          return res.end();
        }
      })
  });

app.get("/getTopics", (req, res) => {
  let topicList1 = getJSONFile(req.session.class + "/topics.json");
  let topicList2 = topicList1.map(x => Object.values(x));
  res.json(topicList2);

  return res.end();

})

/**
 * Get used to get some of the values from the configFile, used in student profile page
 */
app.get("/getConfig", (req, res) => {
  let configFile = getJSONFile(req.session.class + "/config.json");
  let includeRoles = configFile.includeRoles
  let studentPreference = configFile.studentPreferences;
  res.json({roles: includeRoles,pref: studentPreference})
  return res.end();
  });
/**
 * Logs the servers url
 */
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

/**
 * Checks if a folder with a given name with a student.json exist, if not, it will make the folder and file
 * @param {The folder that is in need of being checked} folderName
 * @returns true when finished with checking
 */
function checkFolderName(folderName) {
  if (!fs.existsSync("./database/" + folderName)) {
    fs.mkdirSync("./database/" + folderName);
  }

  if (!fs.existsSync("./database/" + folderName + "/students.json")) {
    fs.writeFileSync(
      "./database/" + folderName + "/students.json",
      { flag: "w+" },
      (err) => {
        if (err) throw err;
      }
    );
  }

  return true;
}
/**
 * This function openes a json file
 * @param {Takes a name of a file} file
 * @returns the content the file parsed as an object
 */
function getJSONFile(file) {
  //Makes the path to the file
  var filepath = __dirname + "/database/" + file;

  //Reads content and saves it
  var file = fs.readFileSync(filepath, "utf8");

  try {
    return JSON.parse(file);
  } catch (e) {
    return [];
  }
}

/**
 * Checks to see if a files content is in the Json format
 * @param {Takes a name of file} file
 * @returns the state of the file is Json or not (True xor False)
 */
function isJSON(file) {
  var filepath = __dirname + "/database/" + file;

  var file = fs.readFileSync(filepath, "utf8");

  // Checks if it is a valid JSON by trying to parse it as JSON
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
  let result = "";
  //String of chars that will be used in the wanted keycode
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
 * @param {This to takes class name inputted by coordinator to open its folder} className
 */
async function studentKeycodeMaker(users, className) {
  let students = [];
  let keycodeFile = await getJSONFile("keycodes.json");
  let tmpKeycode = "";

  //Makes an object with a name, code, and boolean, for every student sent by the coordinator
  for (let i in users) {
    tmpKeycode = makeKeycode(10);

    keycodeFile.some((user) => {
      if (tmpKeycode == user.keycode) {
        return 0;
      } else {
        return tmpKeycode;
      }
    });

    keycodeFile.push({
      keycode: tmpKeycode,
      class: className,
    });

    students[i] = {
      name: users[i].name,
      prefs: users[i].prefs ? users[i].prefs : [],
      blocks: users[i].blocks ? users[i].blocks : [],
      roles: users[i].roles ? users[i].roles : [],
      topics: users[i].topics ? users[i].topics : [],
      keycode: tmpKeycode,
      isRegistered: 0,
    };
  }
  fs.writeFile(
    "./database/keycodes.json",
    JSON.stringify(keycodeFile, null, 4),
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );

  fs.writeFile(
    "./database/" + className + "/students.json",
    JSON.stringify(students, null, 4),
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
}
/**
 * Makes a list of topics from a list of indexes
 * @param {All the availible topics} topicList 
 * @param {The list of indexes} topicIndex 
 * @returns the final list of topics
 */
function getTopicList(topicList, topicIndex){
  let topicList2 = [];
  for (let i in topicList) {
    if(topicIndex.includes(i)){
      topicList2.push(topicList[i].topic);
    }
  }
  return topicList2;
}
/**
 * Moves a file to a new location
 * @param {*} oldPath 
 * @param {*} newPath 
 */
function moveFile(oldPath, newPath) { // https://stackoverflow.com/a/21431865
  fs.readFile(oldPath, function (err, data) {
    fs.writeFile(newPath, data, function (err) {
      fs.unlink(oldPath, function () {
        if (err) throw err;
      });
    });
  });
}

//These error middelware have to stay at the bottom
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).send("Something broke!");
});

app.use((req, res, next) => {
  res.status(404).send("Sorry, can't find that!");
});
