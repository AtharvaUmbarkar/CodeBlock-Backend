import { Request } from "express";
import { Response } from "express-serve-static-core";

import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const port = process.env.PORT as string;
const mongoPort = process.env.CODEBLOCK_DATA_DB_URL as string;

mongoose.set("strictQuery", true);
mongoose.connect(mongoPort);
console.log(`MongoDB server started at ${mongoPort}`);

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

app.use("/backend/user/", require("./routes/user/user.ts"));

app.get("/", async (req: Request, res: Response) => {
  res.send("Hello, Code Block backend here -_-");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
