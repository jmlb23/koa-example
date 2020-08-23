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
