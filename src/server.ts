import mongoose from "mongoose";
import config from "./app/config";
console.log("config", config.db_user);
async function bootstrap() {
  await mongoose.connect(
    `mongodb+srv://${config.db_user}:${config.db_password}@practice-cluster.4jfud1m.mongodb.net/${config.db_name}?retryWrites=true&w=majority`
  );
  console.log("Database connected successfully");
}

bootstrap();
