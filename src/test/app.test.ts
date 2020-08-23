import request from "supertest";
import { app } from "../server";

describe("on call root", () => {
  it("should return 404", async () => {
    const x = await request(app.callback()).post("/");
    expect(x.status).toBe(404);
  });
});

describe("on call /user with a empty body", () => {
  it("should return 400", async () => {
    const x = await request(app.callback()).post("/users");
    expect(x.status).toBe(400);
  });
});

describe("on call /user with a valid body", () => {
  it("should return 200", async () => {
    const x = await request(app.callback())
      .post("/users")
      .type("application/json")
      .send(
        `{"username": "jmlb23", "email": "jmlb13@outlook.com", "password": "def456.."}`
      );
    expect(x.status).toBe(200);
  });
});
