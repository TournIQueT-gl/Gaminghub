import { Module } from '@nestjs/common';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';
import { UsersModule } from '../users/users.module';
import { ClansModule } from '../clans/clans.module';

@Module({
  imports: [UsersModule, ClansModule],
  controllers: [TournamentsController],
  providers: [TournamentsService],
  exports: [TournamentsService],
})
export class TournamentsModule {}