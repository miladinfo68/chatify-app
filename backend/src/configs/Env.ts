// src/configs/Env.ts
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load .env only in development
if (process.env.NODE_ENV !== "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env.production") });
}else{
  dotenv.config();
}

const Env = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  COOKIE_ACCESS_TOKEN: process.env.COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN:process.env.COOKIE_REFRESH_TOKEN,
  JWT_SECRET: process.env.JWT_SECRET,
  ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES,
  REFRESH_TOKEN_PATH: process.env.REFRESH_TOKEN_PATH,
  Domain: process.env.Domain,
};


// Validate critical env vars
if (!Env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}
const port = parseInt(Env.PORT || "", 10);

if (isNaN(port) || port < 0 || port > 65535) {
  throw new Error(
    `Invalid PORT: ${process.env.PORT}. Must be a number between 0 and 65535.`
  );
}

export default Env;


//#####################
//#####################
//#####################
//#####################

// //src/configs/Env.ts

// import dotenv from "dotenv";
// dotenv.config();

// const Env = {
//   PORT: process.env.PORT,
//   NODE_ENV: process.env.NODE_ENV,
//   MONGODB_URI: process.env.MONGODB_URI,
//   COOKIE_NAME:process.env.COOKIE_NAME,
//   JWT_SECRET: process.env.JWT_SECRET,
//   ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES,
//   REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES,
// };

// export default Env;
