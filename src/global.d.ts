import { Repo } from "./Model/Repo";
import { User, Article } from "./Model/Entities";
import { BaseContext, DefaultState } from "koa";

declare module "koa" {
  export class BaseContext {
    userRepo: Promise<Repo<string, User>>;
    articleRepo: Promise<Repo<string, Article>>;
  }

  export class DefaultState {
    username: string
  }
}
