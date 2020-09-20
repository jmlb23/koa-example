import * as t from "io-ts";

export const UserDTORequest = t.type({
  email: t.string,
  password: t.string,
  username: t.string,
});

export const UserDTOResponse = t.type({
  id: t.number,
  email: t.string,
  username: t.string,
});

export const LoginDTO = t.type({
  username: t.string,
  password: t.string,
});


export const JWTDTO = t.type({
  sub: t.string,
  iat: t.number,
  exp: t.number
});


export const ArticleV = t.type({
  title: t.string,
  description: t.string,
  body: t.string,
  tagList: t.array(t.string),
  createdAt: t.number,
});


export const ArticleDTO = ArticleV._A;