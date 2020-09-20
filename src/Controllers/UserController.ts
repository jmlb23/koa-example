import { UserDTORequest, LoginDTO } from "../DTO/DTOS";
import { UserDTOMapper } from "../DTO/Mapper";
import Router from "koa-router";
import KoaBodyParser from "koa-bodyparser";
import { fold } from "fp-ts/lib/Either";
import { Errors } from "io-ts";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { AuthMiddleware as auth } from "./AuthMiddleware"

import * as dot from "dotenv";
import { resolve } from "path";

dot.config({ path: resolve(".env") })


const mapper = new UserDTOMapper();
const router = new Router();


router.use(
  KoaBodyParser({
    strict: true,
  })
);

router.post("/users", async (ctx, next) => {

  const parse = UserDTORequest.decode(ctx.request.body);

  await fold(
    (x: Errors) => {
      ctx.status = 400;
      ctx.response.body = {
        code: ctx.status,
        messege: `fields required: ${x
          .map((w) => w.context.map((y) => y.key).join(""))
          .join(", ")}`,
      };
    },
    async (y: { username: string; password: string; email: string }) => {
      const repo = await ctx.userRepo
      const notExist =
        (repo.filter((x) => x.username == y.username)).then(x => x.length == 0);

      const ent = await mapper.toEntity(y);
      const id = await repo.add(ent);

      ctx.response.status = notExist ? 200 : 409;
      ctx.response.body = notExist
        ? { code: 200, message: `user created with id: ${id}` }
        : { code: 409, message: "username already taken" };
    }
  )(parse);

  await next();
});

router.get("/users/:id", auth, async (ctx, next) => {
  const repo = await ctx.userRepo
  let x = await repo.get(ctx.params["id"]);
  ctx.body = { example: x };
  await next();
});

router.delete("/users/:id", auth, async (ctx, next) => {
  const id = ctx.params["id"];
  const repo = await ctx.userRepo
  const notExist = repo
    .filter((x) => x._id == id)
    .then((x) => x.length != 0);

  ctx.response.body = notExist
    ? { code: 404, message: "user not exist" }
    : {
      code: 200,
      message: `element removed with id ${await repo.remove(id)}`,
    };

  await next();
});

router.put("/users/:id", auth, async (ctx, next) => {
  const repo = await ctx.userRepo
  const id: string = ctx.params["id"];
  const parse = UserDTORequest.decode(ctx.request.body);

  fold(
    (x: Errors) => {
      ctx.status = 400;
      ctx.response.body = {
        code: ctx.status,
        messege: `fields required: ${x
          .map((w) => w.context.map((y) => y.key).join(""))
          .join(", ")}`,
      };
    },
    async (y: { username: string; password: string; email: string }) => {
      const notExist = repo
        .filter((x) => x.username == y.username)
        .then((x) => x.length == 0);

      const update = notExist ? 0 : await repo.update(id, { _id: id, ...y });
      ctx.response.status = notExist ? 404 : 200;
      ctx.response.body = notExist
        ? { code: 404, message: "user not exist" }
        : { code: 200, message: `user upated at id ${update}` };
    }
  )(parse);

  await next();
});

router.post("/users/login", async (ctx, next) => {
  const parse = LoginDTO.decode(ctx.request.body);
  const repo = await ctx.userRepo

  await fold(
    (x: Errors) => {
      ctx.status = 400;
      ctx.response.body = {
        code: ctx.status,
        messege: `fields required: ${x
          .map((w) => w.context.map((y) => y.key).join(""))
          .join(", ")}`,
      };
    },
    async (y: { username: string; password: string }) => {
      const user = (await repo
        .first((x) => x.username == y.username));
      const exist = user != null
      const passwordMatch = await (!exist
        ? Promise.resolve(false)
        : repo
          .first((x) => x.username == y.username)
          .then(async (x) => compare(y.password, x?.password ?? "")));

      ctx.response.body = passwordMatch
        ? { username: y.username, token: sign({}, process.env["secret"] as string, { algorithm: "HS512", expiresIn: "1h", subject: user?._id }) }
        : { code: 401, message: "unauthorized" };
    }
  )(parse);
  await next();
});

export const UserController = router;
