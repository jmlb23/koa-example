import { User } from "../Model/Entities";
import { hash } from "bcryptjs";

export interface Mapper<DTO, Entity> {
  toDTO: (e: Entity) => DTO;
  toEntity: (dto: DTO) => Promise<Entity>;
}

export class UserDTOMapper
  implements
    Mapper<
      {
        username: string;
        password: string;
        email: string;
      },
      User
    > {
  toDTO: (
    e: User
  ) => {
    username: string;
    password: string;
    email: string;
  } = (e) => {
    return {
      email: e.email,
      password: e.password,
      username: e.username,
    };
  };
  toEntity: (dto: {
    username: string;
    password: string;
    email: string;
  }) => Promise<User> = async (dto) => {
    const passwordHashed = await hash(dto.password, 10);
    return {
      id: Math.random().toString(),
      email: dto.email,
      password: await passwordHashed,
      username: dto.username,
    };
  };
}
