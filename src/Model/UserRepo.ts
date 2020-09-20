import { Repo } from "./Repo";
import { User } from "./Entities";
import { Collection } from "mongodb";
import { mongoClient } from "../factories";

class MemoryRepo implements Repo<string, User> {
  private readonly x: Array<User> = [];

  first(predicate: (e: User) => Boolean): Promise<User | null> {
    function helper(elements: User[]): User | null {
      const [head, ...tail] = elements;
      if (predicate(head)) return head;
      else return helper(tail);
    }

    return Promise.resolve(helper(this.x));
  }

  toList(): Promise<User[]> {
    return Promise.resolve(this.x);
  }

  get(username: string): Promise<User | null> {
    let w = this.x.find((x) => x.username === username);
    return Promise.resolve(w == undefined ? null : w);
  }

  add(e: User): Promise<string> {
    this.x.push(e);
    return Promise.resolve(e._id);
  }

  remove(username: string): Promise<number> {
    let index = this.x.findIndex((x) => x.username === username);
    let removed = this.x.splice(index, 1);
    return Promise.resolve(removed[0] == null ? 0 : 1);
  }

  update(id: string, e: User): Promise<number> {
    return this.remove(id).then((x) => Promise.resolve(this.x.push(e)));
  }

  addAll(e: User[]): Promise<number> {
    return e
      .map((x) => this.add(x))
      .map((x) => x.then((x) => 1))
      .reduce((x, y) => x.then((x1) => y.then((y1) => x1 + y1)));
  }

  filter(predicate: (e: User) => Boolean): Promise<User[]> {
    return Promise.resolve(this.x.filter(predicate));
  }
}


class MongoUserRepo implements Repo<string, User> {

  constructor(readonly collection: Collection) {

  }

  first(predicate: (e: User) => Boolean): Promise<User | null> {
    return this.collection.find().toArray().then((x: User[]) => x.filter(predicate)[0] ?? null)
  }

  toList(): Promise<User[]> {
    return this.collection.find({}).toArray();
  }

  get(username: string): Promise<User | null> {
    return this.collection.findOne({ username: username });
  }

  add(e: User): Promise<string> {
    return this.collection.insertOne(e).then(x => x.insertedId);
  }

  remove(username: string): Promise<number> {
    return this.collection.deleteOne({ username: username }).then(x => x.deletedCount ?? 0);
  }

  update(id: string, e: User): Promise<number> {
    return this.collection.updateOne({ $where: function () { return this._id === id } }, {
      $set: {
        "email": e.email,
        "password": e.password,
        "username": e.username
      }
    }).then(x => x.result.n);
  }

  addAll(e: User[]): Promise<number> {
    return this.collection.insertMany(e).then(x => x.result.n);
  }

  filter(predicate: (e: User) => Boolean): Promise<User[]> {
    return this.collection.find().toArray().then(x => x.filter(predicate));
  }
}


const mongoRepo: () => Promise<Repo<string, User>> = () =>
  mongoClient().then(client => new MongoUserRepo(client.db("example").collection("User")));

export const UserRepo = mongoRepo;
