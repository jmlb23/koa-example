import { Repo } from "./Repo";
import { Article } from "./Entities";
import { Collection } from "mongodb";
import { mongoClient } from "../factories";

class MemoryArticleRepo implements Repo<string, Article> {
  private readonly x: Array<Article> = [];

  first(predicate: (e: Article) => Boolean): Promise<Article | null> {
    function helper(elements: Article[]): Article | null {
      const [head, ...tail] = elements;
      if (predicate(head)) return head;
      else return helper(tail);
    }

    return Promise.resolve(helper(this.x));
  }

  toList(): Promise<Article[]> {
    return Promise.resolve(this.x);
  }

  get(id: string): Promise<Article | null> {
    let w = this.x.find((x) => x.id === id);
    return Promise.resolve(w == undefined ? null : w);
  }

  add(e: Article): Promise<string> {
    this.x.push(e);
    return Promise.resolve(e.id);
  }

  remove(id: string): Promise<number> {
    let index = this.x.findIndex((x) => x.id === id);
    let removed = this.x.splice(index, 1);
    return Promise.resolve(removed[0] == null ? 0 : 1);
  }

  update(id: string, e: Article): Promise<number> {
    return this.remove(id).then((x) => Promise.resolve(this.x.push(e)));
  }

  addAll(e: Article[]): Promise<number> {
    return e
      .map((x) => this.add(x))
      .map((x) => x.then((x) => 1))
      .reduce((x, y) => x.then((x1) => y.then((y1) => x1 + y1)));
  }

  filter(predicate: (e: Article) => Boolean): Promise<Article[]> {
    return Promise.resolve(this.x.filter(predicate));
  }
}


class MongoArticleRepo implements Repo<string, Article> {

  constructor(readonly collection: Collection) {

  }

  first(predicate: (e: Article) => Boolean): Promise<Article | null> {
    return this.collection.find().toArray().then((x: Article[]) => x.filter(predicate)[0] ?? null)
  }

  toList(): Promise<Article[]> {
    return this.collection.find({}).toArray();
  }

  get(title: string): Promise<Article | null> {
    return this.collection.findOne({ title: title });
  }

  add(e: Article): Promise<string> {
    return this.collection.insertOne(e).then(x => x.insertedId);
  }

  remove(username: string): Promise<number> {
    return this.collection.deleteOne({ username: username }).then(x => x.deletedCount ?? 0);
  }

  update(id: string, e: Article): Promise<number> {
    return this.collection.updateOne({ $where: `function () { return this._id === ${id} }` }, {
      $set: {
        "body": e.body,
        "updatedAt": e.updatedAt,
        "description": e.description,
        "favorited": e.favorited,
        "favoritesCount": e.favoritesCount,
        "tagList": e.tagList,
        "title": e.title,
      }
    }).then(x => x.result.n);
  }

  addAll(e: Article[]): Promise<number> {
    return this.collection.insertMany(e).then(x => x.result.n);
  }

  filter(predicate: (e: Article) => Boolean): Promise<Article[]> {
    return this.collection.find().toArray().then(x => x.filter(predicate));
  }
}


const mongoRepo: () => Promise<Repo<string, Article>> = () =>
  mongoClient().then(client => new MongoArticleRepo(client.db("example").collection("Article")));

export const ArticleRepo = mongoRepo;
