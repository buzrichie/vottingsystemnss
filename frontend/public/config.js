let config = {};

// Function to fetch config securely from the backend
export async function fetchConfig() {
  try {
    // // If baseUri is already set, return the config object directly
    // if (config.baseUri) {
    //   return config;
    // }

    // // Fetch the config from the backend
    // const res = await fetch("/config");
    // const data = await res.json();

    // config.baseUri = data.baseUri;
    config.baseUri = "https://nss-awutusenya.onrender.com";

    return config;
  } catch (error) {
    console.error("Error fetching config:", error);
    throw error;
  }
}

// helper function to get the baseUri
export function getBaseUri() {
  return config.baseUri;
}
