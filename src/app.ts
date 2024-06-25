import cors from "cors";
import express, { Application } from "express";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(globalErrorHandler);

export default app;
