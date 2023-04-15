const registerForm = document.getElementById("register-form");
const registerUsername = document.getElementById("register-username");
const registerPassword = document.getElementById("register-password");
const registerButton = document.getElementById("register-submit");

let button = registerButton.addEventListener("click", (e) => {

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

      alert("Something went wrong!"); 

      fetch('./register_login');

    });

});