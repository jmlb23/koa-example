import Koa from "koa";
import { UserRepo } from "./Model/UserRepo";
import { UserController } from "./Controllers/UserController";

const app = new Koa();
app.context.repo = new UserRepo();

app.use(UserController.routes());

if (!module.parent) {
  app.listen(8080);
}

export { app };
