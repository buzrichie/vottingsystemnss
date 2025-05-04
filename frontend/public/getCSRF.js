import { fetchConfig } from "./config.js";

export async function getCSRFToken() {
  try {
    const data = await fetchConfig();

    const CSRF_res = await fetch(`${data.baseUri}/api/csrf-token`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!CSRF_res.ok) {
      throw new Error("Failed to fetch CSRF token");
    }
    const { csrfToken } = await CSRF_res.json();
    return csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF token:", error.message);
    throw error;
  }
}
