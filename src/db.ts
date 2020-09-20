import { Db } from "mongodb";
import { schemas } from "./schemas";
import { mongoClient } from "./factories";


const migration = () => {

  return {
    up(db: Db) {
      return Promise.all([
        db.createCollection("User", { validator: schemas.users.v1 }),
        db.createCollection("Article", { validator: schemas.article.v1 }),
      ]);
    },
    down(db: Db) {
      return Promise.all([
        db.collection("User").drop().then(console.error),
        db.collection("Article").drop().then(console.error)
      ]);
    }
  }
}

async function runner() {

  const client = await mongoClient()

  const db = client.db("example");

  const { up, down } = migration();

  await down(db)
  await up(db)
}





export const schemaRunner = runner