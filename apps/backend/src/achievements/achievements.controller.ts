import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { AchievementsService } from './achievements.service';

@ApiTags('achievements')
@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user achievements' })
  @ApiResponse({ status: 200, description: 'User achievements retrieved' })
  async getUserAchievements(@GetUser('id') userId: string) {
    return this.achievementsService.getUserAchievements(userId);
  }

  @Get('leaderboard')
  @Public()
  @ApiOperation({ summary: 'Get achievements leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved' })
  async getLeaderboard() {
    return this.achievementsService.getLeaderboard();
  }
}