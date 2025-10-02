//src/configs/Env.ts

import dotenv from "dotenv";
dotenv.config();

const Env = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
};

export default Env;
