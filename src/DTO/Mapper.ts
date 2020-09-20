import { User, Article } from "../Model/Entities";
import { hash } from "bcryptjs";
import { v1 } from "uuid";
import { ArticleDTO } from "./DTOS";
// import { ArticleDTO } from "./DTOS";

export interface Mapper<DTO, Entity> {
  toDTO(e: Entity): DTO;
  toEntity(dto: DTO): Entity;
}

export interface AsyncMapper<DTO, Entity> {
  toDTO(e: Entity): DTO;
  toEntity(dto: DTO): Promise<Entity>;
}

export class UserDTOMapper implements
  AsyncMapper<{ username: string; password: string; email: string; }, User> {

  toDTO(e: User): { username: string; password: string; email: string; } {
    return {
      email: e.email,
      password: e.password,
      username: e.username,
    };
  };

  async toEntity(dto: { username: string; password: string; email: string; }): Promise<User> {
    const passwordHashed = await hash(dto.password, 10);
    return {
      _id: v1(),
      email: dto.email,
      password: await passwordHashed,
      username: dto.username,
    };
  };
}

export class ArticleMapper implements
  Mapper<typeof ArticleDTO, Article> {

  toDTO(e: Article): typeof ArticleDTO {
    return {
      body: e.body,
      createdAt: e.createdAt,
      description: e.description,
      tagList: e.tagList,
      title: e.title
    };
  };

  toEntity(dto: typeof ArticleDTO): Article {
    return {
      body: dto.body,
      description: dto.description,
      title: dto.title,
      tagList: dto.tagList,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      favorited: false,
      favoritesCount: 0,
      id: v1(),
    };
  };
}
