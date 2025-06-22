import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { TournamentsService } from './tournaments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateTournamentDto, UpdateTournamentDto, JoinTournamentDto, SubmitMatchResultDto } from './dto/tournament.dto';
import { TournamentStatus } from '@prisma/client';

@ApiTags('tournaments')
@Controller('tournaments')
@UseGuards(JwtAuthGuard)
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tournament' })
  @ApiResponse({ status: 201, description: 'Tournament created successfully' })
  async createTournament(
    @GetUser('id') userId: string,
    @Body() createTournamentDto: CreateTournamentDto,
  ) {
    return this.tournamentsService.createTournament(userId, createTournamentDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all tournaments' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: TournamentStatus })
  @ApiResponse({ status: 200, description: 'Tournaments retrieved successfully' })
  async getTournaments(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: TournamentStatus,
  ) {
    return this.tournamentsService.getTournaments(page, limit, status);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search tournaments' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Search results retrieved' })
  async searchTournaments(
    @Query('q') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.tournamentsService.searchTournaments(query, page, limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get tournament by ID' })
  @ApiResponse({ status: 200, description: 'Tournament retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tournament not found' })
  async getTournament(@Param('id', ParseIntPipe) id: number) {
    return this.tournamentsService.getTournamentById(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tournament' })
  @ApiResponse({ status: 200, description: 'Tournament updated successfully' })
  @ApiResponse({ status: 403, description: 'Only creator can update tournament' })
  async updateTournament(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTournamentDto: UpdateTournamentDto,
  ) {
    return this.tournamentsService.updateTournament(userId, id, updateTournamentDto);
  }

  @Post(':id/join')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a tournament' })
  @ApiResponse({ status: 201, description: 'Joined tournament successfully' })
  @ApiResponse({ status: 400, description: 'Tournament is full or already started' })
  async joinTournament(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() joinTournamentDto: JoinTournamentDto,
  ) {
    return this.tournamentsService.joinTournament(userId, id, joinTournamentDto);
  }

  @Post(':id/start')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start tournament' })
  @ApiResponse({ status: 200, description: 'Tournament started successfully' })
  @ApiResponse({ status: 403, description: 'Only creator can start tournament' })
  async startTournament(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tournamentsService.startTournament(userId, id);
  }

  @Get(':id/bracket')
  @Public()
  @ApiOperation({ summary: 'Get tournament bracket' })
  @ApiResponse({ status: 200, description: 'Tournament bracket retrieved' })
  @ApiResponse({ status: 404, description: 'Tournament not found' })
  async getTournamentBracket(@Param('id', ParseIntPipe) id: number) {
    return this.tournamentsService.getTournamentBracket(id);
  }

  @Post('matches/:matchId/result')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit match result' })
  @ApiResponse({ status: 200, description: 'Match result submitted successfully' })
  @ApiResponse({ status: 403, description: 'Only participants or creator can submit results' })
  async submitMatchResult(
    @GetUser('id') userId: string,
    @Param('matchId', ParseIntPipe) matchId: number,
    @Body() submitResultDto: SubmitMatchResultDto,
  ) {
    return this.tournamentsService.submitMatchResult(userId, matchId, submitResultDto);
  }
}