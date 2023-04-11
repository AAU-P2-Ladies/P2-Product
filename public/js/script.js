const loginForm = document.getElementById("login-form");
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const loginButton = document.getElementById("login-submit");
const registerForm = document.getElementById("register-form");
const registerUsername = document.getElementById("register-username");
const registerPassword = document.getElementById("register-password");
const registerButton = document.getElementById("register-submit");


let lbutton = loginButton.addEventListener("click", (e) => {

  e.preventDefault();

    fetch('./login', {
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
    .then((data) => {

      console.log(data);

      if (data.error && !data.username && !data.password) {

        alert("Invalid Username or Password"); 

      } else  {

        location.href = './';

      }

    })
    .catch((err) => {

      console.error(err);

    });

});

let rbutton = registerButton.addEventListener("click", (e) => {

  e.preventDefault();

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

      console.log(data);

      if (!data) {

        alert("Invalid"); 

      } else  {

        location.href = './';

      }

    })
    .catch((err) => {

      console.error(err);

    });

});