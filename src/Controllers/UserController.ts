import { UserDTORequest, LoginDTO, JWTDTO } from "../DTO/DTOS";
import { UserDTOMapper } from "../DTO/Mapper";
import Router from "koa-router";
import KoaBodyParser from "koa-bodyparser";
import { fold, tryCatch, Either, toError, mapLeft } from "fp-ts/lib/Either";
import { Errors } from "io-ts";
import { Context, Next } from "koa";
import { compare } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { chain } from "fp-ts/lib/Either";

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
      const notExist =
        (await ctx.repo.filter((x) => x.username == y.username)).length == 0;

      const ent = await mapper.toEntity(y);
      const id = await ctx.repo.add(ent);

      ctx.response.status = notExist ? 200 : 409;
      ctx.response.body = notExist
        ? { code: 200, message: `user created with id: ${id}` }
        : { code: 409, message: "username already taken" };
    }
  )(parse);

  await next();
});

const auth = async (ctx: Context, next: Next) => {
  let auth = ctx.get("Authorization");
  if (!auth) {
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: "you need to be logged",
    };
  } else {
    const throwable = tryCatch(() => verify(auth, process.env["secret"] as string, { algorithms: ['HS512'] }) as object, (e) => e as Error);

    const v = chain((x: object) => mapLeft((e) => e as Error)(JWTDTO.decode(x)))(throwable);

    await fold((e: Error) => {
      console.error(e)
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: "unauthorized",
      };
    }, async (c: { username: string, iat: number, exp: number }) => {
      if (c.exp <= c.iat) {
        ctx.status = 401;
        ctx.body = {
          code: 401,
          message: "unauthorized",
        };
      } else {
        await next();
      }
    })(v)

  };
};

router.get("/users/:id", auth, async (ctx, next) => {
  let x = await ctx.repo.get(ctx.params["id"]);
  ctx.body = { example: x };
  await next();
});

router.delete("/users/:id", auth, async (ctx, next) => {
  const id = ctx.params["id"];

  const notExist = ctx.repo
    .filter((x) => x.id == id)
    .then((x) => x.length != 0);

  ctx.response.body = notExist
    ? { code: 404, message: "user not exist" }
    : {
      code: 200,
      message: `element removed with id ${await ctx.repo.remove(id)}`,
    };

  await next();
});

router.put("/users/:id", auth, async (ctx, next) => {
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
      const notExist = await ctx.repo
        .filter((x) => x.username == y.username)
        .then((x) => x.length == 0);

      const update = notExist ? 0 : await ctx.repo.update(id, { id: id, ...y });
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

      const notExist = (await ctx.repo
        .filter((x) => x.username == y.username))
        .length == 0;

      const passwordMatch = await (notExist
        ? Promise.resolve(false)
        : ctx.repo
          .first((x) => x.username == y.username)
          .then(async (x) => compare(y.password, x?.password ?? "")));

      ctx.response.body = passwordMatch
        ? { username: y.username, token: sign({ username: y.username }, process.env["secret"] as string, { algorithm: "HS512", expiresIn: "1h" }) }
        : { code: 401, message: "unauthorized" };
    }
  )(parse);
  await next();
});

export const UserController = router;
