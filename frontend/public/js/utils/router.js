import { registerComponent } from "../../pages/register.js";

const app = document.getElementById("app");

if (window.performance) {
  // Handle initial load OR refresh for /result
  if (window.location.pathname === "/register") {
    navigateTo(window.location.pathname);
  }
}

export function navigateTo(route) {
  switch (route) {
    case "/register":
      app.innerHTML = registerComponent();
      break;
    default:
      break;
  }
}
