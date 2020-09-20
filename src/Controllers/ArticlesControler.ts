import { ArticleDTO, ArticleV } from "../DTO/DTOS";
import { ArticleMapper } from "../DTO/Mapper";
import Router from "koa-router";
import KoaBodyParser from "koa-bodyparser";
import { fold } from "fp-ts/lib/Either";
import { Errors } from "io-ts";
import { AuthMiddleware as auth } from "./AuthMiddleware"

import * as dot from "dotenv";
import { resolve } from "path";
import { Context } from "koa";


dot.config({ path: resolve(".env") })


const mapper = new ArticleMapper();
const router = new Router();


router.use(
  KoaBodyParser({
    strict: true,
  })
);

router.post("/articles", auth, async (ctx: Context, next) => {
  const parse = ArticleV.decode(ctx.request.body);
  const idUser = ctx.state.username

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
    async (y: typeof ArticleDTO) => {
      const repo = await ctx.articleRepo;
      const notExist = (await repo.filter((x) => x.id == y.title)).length == 0;

      const ent = await mapper.toEntity(y);
      console.log(idUser)
      ent.userId = idUser
      const id = await ctx.repo.add(ent);

      ctx.response.status = notExist ? 200 : 409;
      ctx.response.body = notExist
        ? { code: 200, message: `user created with id: ${id}` }
        : { code: 409, message: "username already taken" };
    }
  )(parse);

  await next();
});

// router.get("/articles/:id", auth, async (ctx, next) => {
//   let x = await ctx.articleRepo.get(ctx.params["id"]);
//   ctx.body = { example: x };
//   await next();
// });

// router.delete("/articles/:id", auth, async (ctx, next) => {
//   const id = ctx.params["id"];

//   const notExist = ctx.articleRepo
//     .filter((x) => x.id == id)
//     .then((x) => x.length != 0);

//   ctx.response.body = notExist
//     ? { code: 404, message: "user not exist" }
//     : {
//       code: 200,
//       message: `element removed with id ${await ctx.repo.remove(id)}`,
//     };

//   await next();
// });

// router.put("/articles/:id", auth, async (ctx, next) => {
//   const id: string = ctx.params["id"];
//   const parse = ArticleDTO.decode(ctx.request.body);

//   fold(
//     (x: Errors) => {
//       ctx.status = 400;
//       ctx.response.body = {
//         code: ctx.status,
//         messege: `fields required: ${x
//           .map((w) => w.context.map((y) => y.key).join(""))
//           .join(", ")}`,
//       };
//     },
//     async (y: { username: string; password: string; email: string }) => {
//       const notExist = (await ctx.articleRepo)
//         .filter((x) => x.username == y.username)
//         .then((x) => x.length == 0);

//       const update = notExist ? 0 : await ctx.repo.update(id, { id: id, ...y });
//       ctx.response.status = notExist ? 404 : 200;
//       ctx.response.body = notExist
//         ? { code: 404, message: "user not exist" }
//         : { code: 200, message: `user upated at id ${update}` };
//     }
//   )(parse);

//   await next();
// });

// router.get("/articles", auth, async (ctx, next) => {
//   const parse = ArticleDTO.decode(ctx.request.body);

//   await fold(
//     (x: Errors) => {
//       ctx.status = 400;
//       ctx.response.body = {
//         code: ctx.status,
//         messege: `fields required: ${x
//           .map((w) => w.context.map((y) => y.key).join(""))
//           .join(", ")}`,
//       };
//     },
//     async (y: { username: string; password: string }) => {

//       const notExist = (await ctx.articleRepo
//         .filter((x) => x.username == y.username))
//         .length == 0;

//       const passwordMatch = await (notExist
//         ? Promise.resolve(false)
//         : ctx.repo
//           .first((x) => x.username == y.username)
//           .then(async (x) => compare(y.password, x?.password ?? "")));

//       ctx.response.body = passwordMatch
//         ? { username: y.username, token: sign({}, process.env["secret"] as string, { algorithm: "HS512", expiresIn: "1h", jwtid: "1", subject: y.username }) }
//         : { code: 401, message: "unauthorized" };
//     }
//   )(parse);
//   await next();
// });

export const ArticlesController = router;
