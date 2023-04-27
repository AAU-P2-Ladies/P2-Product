const registerForm = document.getElementById("register-form");
const registerKeycode = document.getElementById("register-keycode");
const registerUsername = document.getElementById("register-username");
const registerPassword = document.getElementById("register-password");
const registerButton = document.getElementById("register-submit");

/**
 * Event that is active when the register button is clicked
 */
let button = registerButton.addEventListener("click", (e) => {

  e.preventDefault();
    /**
     * Sends data to the server to be checked 
     */
    fetch('./register', {
        method: "POST",
        headers: {
            Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: registerUsername.value,
            password: registerPassword.value,
        }),
    })
    .then((response) => response.json())
    .then((data) => {
      /**
       * Checks the data sent by the server
       */
      console.log(data);

      if (!data) {
        
        /**
         * Alerts user if data is wrong
         */
        alert("Invalid data"); 
        location.href = './register';

      } else  {
        /**
         * Sends user back to the login page if nothing is wrong
         */
        location.href = './';

      }

    })
    .catch((err) => {
      
      console.error(err);

      alert("Something went wrong!"); 

      location.href = './register';

    });

});