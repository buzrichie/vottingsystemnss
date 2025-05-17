import { fetchConfig } from "./config.js";

export async function fetchServerTime() {
  try {
    const { baseUri } = await fetchConfig();
    const BASE_URL = `${baseUri}/api/server-time`;

    const res = await fetch(BASE_URL);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching server time:", error);
    return null;
  }
}
