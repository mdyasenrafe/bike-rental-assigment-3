import cors from "cors";
import express, { Application } from "express";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";
import notFoundRoute from "./app/middlewares/notFoundRoute";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api", router);

app.use(globalErrorHandler);
app.use(notFoundRoute);

export default app;
