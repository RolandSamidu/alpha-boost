import axios from "axios";

const createApiInstance = (baseURL) => {
  const apiInstance = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  apiInstance.interceptors.request.use(
    (config) => {
      console.log(
        `Making ${config.method?.toUpperCase()} request to: ${config.url}`
      );
      return config;
    },
    (error) => {
      console.log("Request error:", error.message);
      return Promise.reject(error);
    }
  );

  apiInstance.interceptors.response.use(
    (response) => {
      console.log(
        `Response received from: ${response.config.url}`,
        response.status
      );
      return response;
    },
    (error) => {
      if (error.code === "ECONNABORTED") {
        console.log("Request timeout");
        error.message = "Request timeout";
      } else if (error.response) {
        console.log(`API Error ${error.response.status}:`, error.response.data);
      } else if (error.request) {
        console.log("Network error:", error.message);
      } else {
        console.log("Error:", error.message);
      }
      return Promise.reject(error);
    }
  );

  return apiInstance;
};

const API_ENDPOINTS = ["https://gzrznv7g-5000.asse.devtunnels.ms"];

export const testAPIConnection = async (baseUrl) => {
  try {
    const apiInstance = createApiInstance(baseUrl);

    const response = await apiInstance.get("/health");

    if (response.status === 200) {
      return { success: true, url: baseUrl, data: response.data };
    } else {
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const findWorkingAPI = async () => {
  for (const endpoint of API_ENDPOINTS) {
    const result = await testAPIConnection(endpoint);
    if (result.success) {
      return result.url;
    }
  }
  return null;
};

export const checkWordsWithAPI = async (words) => {
  const apiUrl = await findWorkingAPI();

  if (!apiUrl) {
    throw new Error("No working API endpoint found");
  }

  const apiInstance = createApiInstance(apiUrl);

  const response = await apiInstance.post("/check_words", { words });

  return {
    data: response.data,
    apiUrl: apiUrl,
  };
};

export const handleApiError = (error) => {
  let title = "Connection Error";
  let message = "";

  if (error.message.includes("No working API endpoint")) {
    title = "Cannot Connect to API";
    message = `Unable to connect to spelling checker\n\nPlease make sure your API server is running and try again.`;
  } else if (
    error.message.includes("timeout") ||
    error.message.includes("Request timeout") ||
    error.code === "ECONNABORTED"
  ) {
    title = "Connection Timeout";
    message = `The server is taking too long to respond\n\nPlease check your connection and try again.`;
  } else if (error.response) {
    title = "Server Error";
    message = `Server Error: HTTP ${error.response.status}\n\nPlease try again in a moment.`;
  } else if (error.request) {
    title = "Network Error";
    message = `Unable to reach the server\n\nPlease check your internet connection.`;
  } else {
    title = "Error";
    message = `Something went wrong. Please try again.`;
  }

  return { title, message };
};
