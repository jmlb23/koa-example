import { connect } from "mongodb";
import * as dot from "dotenv";

import { resolve } from "path";

dot.config({ path: resolve(".env") })

export const mongoClient = () => connect(process.env["mongo_uri"] as string, {
  auth: {
    user: process.env["user_mongo"] as string,
    password: process.env["password_mongo"] as string
  }, useUnifiedTopology: true,
});

