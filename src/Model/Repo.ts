export declare interface Repo<I, E> {
  get(id: I): Promise<E | null>;

  add(e: E): Promise<I>;

  remove(id: I): Promise<number>;

  update(id: I, e: E): Promise<number>;

  addAll(e: Array<E>): Promise<number>;

  filter(predicate: (e: E) => Boolean): Promise<Array<E>>;

  first(predicate: (e: E) => Boolean): Promise<E | null>;

  toList(): Promise<Array<E>>;
}
