import {
  Controller,
  Get,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { SearchType } from './dto/search.dto';

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Global search across users, clans, and tournaments' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'type', required: false, enum: SearchType, description: 'Search type filter' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Search results retrieved' })
  async globalSearch(
    @Query('q') query: string,
    @Query('type') type?: SearchType,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.searchService.globalSearch(query, type, page, limit);
  }

  @Get('suggestions')
  @Public()
  @ApiOperation({ summary: 'Get search suggestions for autocomplete' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Search suggestions retrieved' })
  async searchSuggestions(
    @Query('q') query: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.searchService.searchSuggestions(query, limit);
  }

  @Get('users/by-game')
  @Public()
  @ApiOperation({ summary: 'Search users by favorite game' })
  @ApiQuery({ name: 'game', description: 'Game name' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Users found' })
  async searchUsersByGame(
    @Query('game') game: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.searchService.searchUsersByGame(game, page, limit);
  }

  @Get('games/popular')
  @Public()
  @ApiOperation({ summary: 'Get popular games based on user preferences' })
  @ApiResponse({ status: 200, description: 'Popular games retrieved' })
  async getPopularGames() {
    return this.searchService.getPopularGames();
  }
}