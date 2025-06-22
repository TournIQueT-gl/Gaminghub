import { Module } from '@nestjs/common';
import { ClansController } from './clans.controller';
import { ClansService } from './clans.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [ClansController],
  providers: [ClansService],
  exports: [ClansService],
})
export class ClansModule {}