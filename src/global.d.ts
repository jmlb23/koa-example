import { Repo } from "./Model/Repo";
import { User } from "./Model/Entities";
import { BaseContext } from "koa";

declare module "koa" {
  export class BaseContext {
    repo: Repo<string, User>;
  }
}
