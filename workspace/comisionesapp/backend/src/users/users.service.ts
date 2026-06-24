import { Injectable } from '@nestjs/common';
import { UsersMockRepository } from './repositories/users-mock.repository';
import { IUser } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersMockRepository) {}

  findByEmail(email: string): Promise<IUser | null> {
    return this.repo.findByEmail(email);
  }

  findById(id: number): Promise<IUser | null> {
    return this.repo.findById(id);
  }
}
