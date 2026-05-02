// const ADDRESS = "localhost";
// const PORT = "3000";

export const GLOBAL_VAR = {
  // BASE_URL: `http://${ADDRESS}:${PORT}`,
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3000",
}
