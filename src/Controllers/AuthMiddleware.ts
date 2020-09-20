import { Context, Next } from "koa";
import { tryCatch, chain, mapLeft, fold } from "fp-ts/lib/Either";
import { verify } from "jsonwebtoken";
import { JWTDTO } from "../DTO/DTOS";

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
        message: `unauthorized`,
      };
    }, async (c: { sub: string, iat: number, exp: number }) => {
      if (c.exp <= c.iat) {
        ctx.status = 401;
        ctx.body = {
          code: 401,
          message: "unauthorized",
        };
      } else {
        ctx.state.username = c.sub
        await next();
      }
    })(v)

  };
};

export const AuthMiddleware = auth