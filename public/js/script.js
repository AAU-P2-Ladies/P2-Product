const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("log-submit");
const loginErrorMsg = document.getElementById("login-error-msg");

fetch('/login').then(response => response.json).catch(()=> loginErrorMsg.style.opacity = 1)