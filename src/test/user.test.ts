import { schemaRunner } from "../db";
import { UserRepo } from "../Model/UserRepo";

beforeEach(async () => {
  await schemaRunner();
})

describe("on add user", () => {
  it("should return a valid id", async () => {
    const repo = await UserRepo();
    const response = await repo.add({
      _id: "example",
      email: "example@mail.com",
      password: "123456",
      username: "123456"
    });
    expect(response.length).toBeGreaterThan(0)
  });
});

describe("on use first with a predicate matching a existent user", () => {
  it("should return a not null user", async () => {
    const repo = await UserRepo();
    const e = {
      _id: "example",
      email: "example@mail.com",
      password: "123456",
      username: "123456"
    }
    await repo.add(e);
    const user = await repo.first(x => x._id === "example")
    expect(user).toEqual(e)
  });
});

describe("on use a filter matching a existent user", () => {
  it("should return a not null user", async () => {
    const repo = await UserRepo();
    const e = {
      _id: "example",
      email: "example@mail.com",
      password: "123456",
      username: "123456"
    }
    await repo.add(e);
    const user = await repo.filter(x => x._id === "example")
    expect(user).toEqual([e])
  });
});