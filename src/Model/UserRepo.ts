import { Repo } from "./Repo";
import { User } from "./Entities";

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
    return Promise.resolve(e.id);
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

export const UserRepo = MemoryRepo;
