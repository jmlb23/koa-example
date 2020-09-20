import Koa from "koa";
import { UserRepo } from "./Model/UserRepo";
import { UserController } from "./Controllers/UserController";
import { schemaRunner } from "./db";
import { ArticleRepo } from "./Model/ArticlesRepo";
import { ArticlesController } from "./Controllers/ArticlesControler";

schemaRunner().then(x => x);

const app = new Koa();
app.context.userRepo = UserRepo();
app.context.articleRepo = ArticleRepo();

app.use(UserController.routes());
app.use(ArticlesController.routes());

if (!module.parent) {
  app.listen(8080);
}

export { app };
