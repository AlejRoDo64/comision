import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersMockRepository } from './repositories/users-mock.repository';

@Module({
  providers: [UsersService, UsersMockRepository],
  exports: [UsersService],
})
export class UsersModule {}
