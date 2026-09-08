// Simulated authentication — for educational / test-automation purposes only.
// This is NOT a real security mechanism: the credentials are public on purpose.
const DEMO_USERNAME = "demo";
const DEMO_PASSWORD = "demo1234";

if (sessionStorage.getItem("nimbus_auth") === "true") {
  window.location.href = "index.html";
}

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
    loginError.hidden = true;
    sessionStorage.setItem("nimbus_auth", "true");
    sessionStorage.setItem("nimbus_username", username);
    window.location.href = "index.html";
  } else {
    loginError.hidden = false;
  }
});
