import express from "express";
import appRootPath from "app-root-path";
import dotenv from "dotenv";
import cors from "cors";
import { AuthRoutes } from "./routes/auth/index.mjs";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

const app = express();

// Load environment variables from .env file.
dotenv.config({
  path: `${appRootPath}/.env`,
});

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routing for API endpoints.
app.use("/auth", AuthRoutes);

app.listen(process.env.PORT, () =>
  console.log("app is running on port", process.env.PORT)
);