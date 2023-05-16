const loginForm = document.getElementById("login-form");
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const loginButton = document.getElementById("login-modal");
const loginButton2 = document.getElementById("login-submit");
const loginKeycode = document.getElementById("keycode");

//Event, activated when login button on the main page is pressed
loginButton.addEventListener("click", (e) => {

  e.preventDefault();  

  // Posts to '/checkUserLogin' with username and password
  fetch('./checkUserLogin', {
    method: "POST",
    headers: {
        Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
    },
    body: JSON.stringify({
        username: loginUsername.value,
        password: loginPassword.value,
    }),
  })
  .then((response) => response.json())
  .then((data) => {//Checks login data for mistakes 

    if (data.error && !data.username) {

      alert("Invalid Username or Password"); 

    } else if (data.error && !data.password) {

      alert("Invalid Password"); 

    } else {
      //Checks to see if the user logging in is a Coordinator
      //If the user is, then they will be sent to Coordinator page
      if (data.isCoordinator == 1) {

        location.href = './coordinator_start';

      } else {

        /**
         * Creates <option>'s in <select> for Modal
         */
        let classesSelect = document.getElementById("classesSelect");
        classesSelect.innerHTML = "";

        if (data.classes != 0) {

          document.getElementById("exampleModalLabel").innerText = 'Please select class or enter keycode';
          document.getElementById("classesDiv").style.display = "block";

          let element = document.createElement("option");
          element.textContent = '- select class -';
          element.disabled = true;
          element.selected = true;
          
          classesSelect.appendChild(element);

          for(var i = 0; i < data.classes.length; i++) {

            let opt = data.classes[i]["class"];
            let el = document.createElement("option");
    
            el.textContent = opt;
            el.value = opt;
            
            classesSelect.appendChild(el);
    
          }

        } else {

          document.getElementById("exampleModalLabel").innerText = 'Please enter keycode';
          document.getElementById("classesDiv").style.display = "none";

        }

        /**
         * Shows Modal for user
         */
        let myModal = new bootstrap.Modal(document.getElementById('exampleModal'));
        myModal.show();

        /**
         * When user selects an <option> in <select> in Modal
         */
        classesSelect.addEventListener("change", (e) => {

          fetch('./login', {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: loginUsername.value,
                password: loginPassword.value,
                class: classesSelect.value
            }),
          })
          .then((response) => response.json())
          .then((data) => {
      
            console.log(data);
      
            if (data.error && !data.username) {
      
              alert("Invalid Username or Password"); 
      
            } else if (data.error && !data.password) {
      
              alert("Invalid Password"); 
      
            } else if (data.error && !data.class) {

              alert("Invalid Class"); 
      
            } else {

              location.href = './student_start';

            }
      
          })
          .catch((err) => {
      
            console.error(err);
      
            alert("Something went wrong!"); 
      
          });

        });

        /**
         * When user clicks the 'Login'-button in Modal
         */
        loginButton2.addEventListener("click", (e) => {

          fetch('./login', {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: loginUsername.value,
                password: loginPassword.value,
                keycode: loginKeycode.value
            }),
          })
          .then((response) => response.json())
          .then((data) => {
      
            console.log(data);
      
            if (data.error && !data.username) {
      
              alert("Invalid Username or Password"); 
      
            } else if (data.error && !data.password) {
      
              alert("Invalid Password"); 
      
            } else if (data.error && !data.keycode) {

              alert("Invalid Keycode"); 
      
            } else {

              location.href = './student_start';

            }
      
          })
          .catch((err) => {//Catches any errors sent by the promises or the data sent from the server
      
            console.error(err);
      
            alert("Something went wrong!"); 
      
          });

        });

      }

    }

  })
  .catch((err) => {//Catches any errors sent by the promises or the data sent from the server

    console.error(err);

    alert("Something went wrong!"); 

  });
});
