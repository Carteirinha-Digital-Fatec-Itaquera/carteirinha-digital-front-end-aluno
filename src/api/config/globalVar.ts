// const ADDRESS = "localhost";
// const PORT = "3000";

export const GLOBAL_VAR = {
  // BASE_URL: `http://${ADDRESS}:${PORT}`,
  BASE_URL: import.meta.env.VITE_API_URL || "https://carteirinha-digital-backend-d6k1.onrender.com",
  // BASE_URL: import.meta.env.VITE_API_URL || "http://:3000",
}
