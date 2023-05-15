const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const { exit } = require("process");
const multer = require("multer");
const { get } = require("http");
const { log } = require("console");
const alg = require("./public/js/algorithm.js");

const maxTime = 30;

var fs = require("fs"),
  json;
var session;

const app = express();
const port = 3080;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", require("ejs").renderFile);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

const oneDay = 1000 * 60 * 60 * 24;

//MULTER CONFIG: to get file to temp server storage
const multerConfig = {
  storage: multer.diskStorage({
    //Setup where the user's file will go
    destination: function (req, file, next) {
      next(null, "./database/uploads");
    },

    //Then give the file a unique name
    filename: function (req, file, next) {
      const ext = file.mimetype.split("/")[1];

      next(null, file.fieldname + "-" + Date.now() + "." + ext);
    },
  }),

  fileFilter: function (req, file, next) {
    if (file.mimetype != "application/json") {
      return next(new Error("Wrong file type"));
    }

    next(null, true);
  },
};

app.use(
  sessions({
    secret: "merete",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);

app.use(cookieParser());

app.use(function (req, res, next) {
  res.locals.baseUrl = req.protocol + "://" + req.headers.host;
  res.locals.isLoggedIn = req.session.userid ? 1 : 0;
  res.locals.isCoordinator = req.session.isCoordinator;
  next();
});

app.get("/", (req, res) => {
  if (!req.session.userid) {
    res.render("pages/index");
  } else {
    if (req.session.isCoordinator == 0) {
      res.render("pages/student_start");
    } else if (req.session.isCoordinator == 1) {
      res.render("pages/coordinator_start");
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

          // Loops through all the keycodes, if any.
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
            // Else...

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

              classFileName = class1 + "/students.json";
              classFile = getJSONFile(classFileName);

              classFile.some((userKey) => {
                if (userKey.keycode == keycode) {
                  userKey.isRegistered = 1;
                }
              });

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
    // Else...

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
/*
app.post('/prefSearch',(req, res) => {


    console.log(req);
    res.render('pages/student_start');

});
*/

app.get("/register", (req, res) => {
  if (req.session.userid) {
    res.redirect("./");
  } else {
    res.render("pages/register");
  }
});

app.get("/coordinator_start", (req, res) => {
  if (!req.session.userid || req.session.isCoordinator != 1) {
    res.redirect("./");
  } else {
    res.render("pages/coordinator_start");
  }
});

app.get("/coordinator_preconfig", (req, res) => {
  if (!req.session.userid || req.session.isCoordinator != 1) {
    res.redirect("./");
  } else {
    res.render("pages/coordinator_preconfig");
  }
});

app.get("/:className/coordinator_view", (req, res) => {
  if (!req.session.userid || req.session.isCoordinator != 1) {
    res.redirect("./");
  } else {
    res.render("pages/coordinator_view");
  }
});

app.post("/getStudents", (req, res) => {
  let file = getJSONFile(req.body.className + "/students.json");

  return res.json(file);
});

app.post("/makeGroups", (req, res) => {
  const className = req.body.className;

  let students = getJSONFile(className + "/students.json");
  let configFile = getJSONFile(className + "/config.json");

  let groupSize = configFile.amountOfGroupMembers;
  console.log(groupSize);
  let groups = alg.masterAlgorithm(students, groupSize, maxTime);

  fs.writeFile(
    "./database/" + className + "/groups.json",
    JSON.stringify(groups, null, 4),
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );

  res.json({ error: false });

  return res.end();

  //return res.json({'students': studentsFile, 'groupSize': configFile.amountOfGroupMembers});
});

app.get("/:className/coordinator_config", (req, res) => {
  if (!req.session.userid || req.session.isCoordinator != 1) {
    res.redirect("./");
  } else {
    let users = getJSONFile("users.json");

    let checkClass = 0;

    users.some((user) => {
      if (user.username == session.userid) {
        for (let index = 0; index < user.classes.length; index++) {
          if (user.classes[index]["class"] == req.params.className) {
            checkClass = 1;

            break;
          }
        }
      }
    });

    if (checkClass == 1) {
      res.render("pages/coordinator_config");
    } else {
      res.redirect("/../");
    }
  }
});

app.post("/coordinator_studentId", multer(multerConfig).single("file"), (req, res) => {
    let students = getJSONFile("uploads/" + req.file.filename);

    if (!students.names) throw "Not right format";

    studentObjectMaker(students.names, req.body.groupName);

    //res.render('pages/coordinator_start');
  }
);

app.get("/student_start", (req, res) => {
  if (!req.session.userid || req.session.isCoordinator != 0) {
    res.redirect("./");
  } else {
    res.render("pages/student_start");
  }
});

//Fetch the current coordinators classes in order to display list of options
app.get("/getCoordinatorClasses", (req, res) => {
  let userFile = getJSONFile("users.json");
  let classes = [];
  //Loop through users to find current logged in user and find their classes
  for (let user of userFile) {
    if (user.username == session.userid) {
      classes = user.classes;
    }
  }
  res.json(classes);
  return res.end();
});

//save the coordinators chosen class ID to edit/view
app.post("/postCoordinatorClass", (req, res) => {
  session.class = req.body.class;
  console.log(session.class);
});

app.get("/student_group", (req, res) => {
  if (!req.session.userid || req.session.isCoordinator != 0) {
    res.redirect("./");
  } else {
    res.render("pages/student_group");
  }
});

app.get("/student_profile", (req, res) => {
  if (!req.session.userid || req.session.isCoordinator != 0) {
    res.redirect("./");
  } else {
    res.render("pages/student_profile");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();

  res.redirect("./");
});

app.post("/fileGroupUpload", multer(multerConfig).any(), (req, res) => {
  let groupFormationName = req.body.nameGroupFormationInput;
  let studentList = [];
  let topicsList = [];

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

  fs.mkdirSync("database/" + groupFormationName);

  for (let index = 0; index < req.files.length; index++) {
    if (req.files[index].fieldname == "studentListInput") {
      if (isJSON("uploads/" + req.files[index].filename)) {
        studentList = getJSONFile("uploads/" + req.files[index].filename);

        moveFile(
          "./database/uploads/" + req.files[index].filename,
          "./database/" + groupFormationName + "/students.json"
        );
      } else {
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

  for (let index = 0; index < studentList.length; index++) {
    if (studentList[index].hasOwnProperty("name")) {
      //console.log(studentList[index]);
    } else {
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
    if (topicsList[index].hasOwnProperty("topic")) {
      //console.log(topicsList[index]);
    } else {
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

  let users = getJSONFile("users.json");

  users.some((user) => {
    if (user.username == session.userid) {
      // Assigns 'duplicateClass' to 0
      let duplicateClass = 0;

      // Loops through all the users different classes that they are a part of, if any.
      for (let index = 0; index < user.classes.length; index++) {
        // Checks if the user is already part of the class with the inputted keycode
        if (user.classes[index]["class"] == groupFormationName) {
          duplicateClass = 1;
          break;
        }
      }

      if (duplicateClass == 0) {
        user.classes.push({ class: groupFormationName });
      }

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

      return true;
    }
  });

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
  const queryName = req.body.name;

  let className;
  if (req.body.className == "") {
    className = session.class;
  } else {
    className = req.body.className;
  }

  let students = getJSONFile(className + "/students.json");
  let studentsArray = [];

  students.map(({ name }) => name);

  for (let i in students) {
    studentsArray.push(students[i]["name"]);
  }

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

  res.json({ students: studentsArray });

  return res.end();
});

app.post("/updateClassConfig", (req, res) => {
  const className = req.body.className;
  const amountOfGroupMembers = req.body.amountOfGroupMembers;
  const studentPreferences = req.body.studentPreferences;
  const objectArray = req.body.blockedPairArray;
  const includeRoles = req.body.includeRoles ? "1" : "0";

  let config = {
    amountOfGroupMembers: amountOfGroupMembers,
    studentPreferences: studentPreferences,
  };

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

  for (let key in objectArray) {
    blockedArray.push(objectArray[key].name);
  }

  let students = getJSONFile(className + "/students.json");

  students.forEach((element) => {
    if (blockedArray.includes(element.name)) {
      objectArray.filter((object) => {
        if (element.name === object.name) {
          element.blocks = object.blocks;
        }
      });
    }
  });

  fs.writeFile(
    "./database/" + className + "/students.json",
    JSON.stringify(students, null, 4),
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );

  res.json({ error: false });

  return res.end();
});

app.post("/unlockClass", (req, res) => {
  const className = req.body.className;

  let students = getJSONFile(className + "/students.json");

  studentKeycodeMaker(students, className);

  res.json({ error: false });

  return res.end();
});

app.get("/getGroups", (req, res) => {
  const className = session.class;

  if (!fs.existsSync("./database/" + className + "/groups.json")) {
    return res.json({ error: true });
  } else {
    let groups = getJSONFile(className + "/groups.json");

    return res.json(groups);
  }
});

/**
 * This get is used for the output page for a student to see their group after group formation
 */
app.get("/getGroup", (req, res) => {
  let users = getJSONFile("users.json");
  let username = session.userid;
  let keycode = "";
  //First, find the current users keycode in order to be able to find their name from the student file
  for (let user of users) {
    //Checks for the first user in the database that has the username of the currently logged in student
    if (user.username == username) {
      for (let i in user.classes) {
        if (user.classes[i].class == session.class) {
          keycode = user.classes[i].keycode;
        }
      }
    }
  }
  let fileName = session.class + "/students.json";
  let classFile = getJSONFile(fileName);
  let name = "";
  for (let student of classFile) {
    if (student.keycode == keycode) {
      name = student.name;
    }
  }

  //Having found the name of the current user, search the group file to find this users group
  fileName = session.class + "/groups.json";
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

  console.log(name);
  console.log(group);

  if (group) {
    return res.json(group);
  } else {
    console.log("group does not exist");
    return res.end();
  }
});

app.post("/saveProfile", (req, res) => {
  let students = getJSONFile(session.class + "/students.json");
  let topicList = getJSONFile(session.class + "/topics.json");
  let users = getJSONFile("users.json");
  let studentsName = [];
  let keycode;
  for (let i in users) {
    console.log(session.userid)
    if (session.userid == users[i].username) {
      for (let j in users[i].classes) {
        if (users[i].classes[j].class == session.class) {
          keycode = users[i].classes[j].keycode;
          console.log(users[i].username + " just made a profile");
        }
      }
    }

    students.some((std) => {
      if (std.keycode == keycode) {
        const studentPreferences = req.body.prefs;
        //Check in Student JSON
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
            res.json({ error: true, prefs: true });
            return res.end();
          }
        }
        //Student Exist

        const studentBlocks = req.body.blocks;
        //Check in Student JSON

        for (let i in req.body.block) {
          if (studentsName.includes(req.body.blocks[i])) {
            for (let j in students.blocks) {
              if (students.blocks[j] == req.body.blocks[i]) {
                res.json({ error: true, block: true });
                return res.end();
              }
            }
          } else {
            res.json({ error: true, blocks: true });
            return res.end();
          }
        }

        const studentTopics = req.body.topics;
        //Check in Topic JSON

        if (
          topicList.length < req.body.topics.length ||
          0 > req.body.topics.length
        ) {
          res.json({ error: true, topics: true });
          return res.end();
        }

        const studentRoles = req.body.roles;
        //Future check for if the roles are equal to the roles made by coordinator
        if (9 < req.body.topics.length || 0 > req.body.topics.length) {
          res.json({ error: true, roles: true });
          return res.end();
        }
        console.log("Adding to user" + std.name);
        for (let i in studentPreferences) {
          std.prefs.push(studentPreferences[i]);
        }
        for (let i in studentBlocks) {
          std.blocks.push(studentBlocks[i]);
        }
        for (let i in studentTopics) {
          std.topics.push(studentTopics[i]);
        }
        for (let i in studentRoles) {
          std.roles.push(studentRoles[i]);
        }

        fs.writeFile(
          "./database/" + session.class + "/students.json",
          JSON.stringify(students, null, 4),
          JSON.stringify(json, null, 4),
          (err) => {
            if (err) {
              console.error(err);
            }
          }
        );

        res.json({ error: false });
        return res.end();
      }
    });
  }
});

app.get("/getBlockedPair", (req, res) => {
  let students = getJSONFile(session.class + "/students.json");
  let users = getJSONFile("users.json");
  for (let i in users) {
    students.some((std) => {
      for (let j in users[i].classes) {
        if (std.keycode == users[i].classes[j].keycode) {
          res.json({ error: false, blocked: std.blocks });
          return res.end();
        }
      }
    });
  }
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

  /*

    if(!fs.existsSync('./database/' + folderName + '/keycode.json')) {

        fs.writeFileSync('./database/' + folderName + '/keycode.json', data, { flag: 'w+' }, err => {

            if (err) throw err;

        });

    }

    */

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

function moveFile(oldPath, newPath) {
  // https://stackoverflow.com/a/21431865

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
