import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { ClansService } from './clans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateClanDto, UpdateClanDto, UpdateMemberRoleDto } from './dto/clan.dto';

@ApiTags('clans')
@Controller('clans')
@UseGuards(JwtAuthGuard)
export class ClansController {
  constructor(private readonly clansService: ClansService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new clan' })
  @ApiResponse({ status: 201, description: 'Clan created successfully' })
  @ApiResponse({ status: 400, description: 'User already in clan or name taken' })
  async createClan(
    @GetUser('id') userId: string,
    @Body() createClanDto: CreateClanDto,
  ) {
    return this.clansService.createClan(userId, createClanDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all public clans' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'isPublic', required: false, type: 'boolean' })
  @ApiResponse({ status: 200, description: 'Clans retrieved successfully' })
  async getClans(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('isPublic') isPublic?: string,
  ) {
    const isPublicBool = isPublic === 'true' ? true : isPublic === 'false' ? false : undefined;
    return this.clansService.getClans(page, limit, isPublicBool);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search clans by name or description' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Search results retrieved' })
  async searchClans(
    @Query('q') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.clansService.searchClans(query, page, limit);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user clan membership' })
  @ApiResponse({ status: 200, description: 'User clan membership retrieved' })
  async getUserClan(@GetUser('id') userId: string) {
    return this.clansService.getUserClanMembership(userId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get clan by ID' })
  @ApiResponse({ status: 200, description: 'Clan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Clan not found' })
  async getClan(@Param('id', ParseIntPipe) id: number) {
    return this.clansService.getClanById(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update clan details' })
  @ApiResponse({ status: 200, description: 'Clan updated successfully' })
  @ApiResponse({ status: 403, description: 'Only leaders and co-leaders can update clan' })
  async updateClan(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClanDto: UpdateClanDto,
  ) {
    return this.clansService.updateClan(userId, id, updateClanDto);
  }

  @Post(':id/join')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a clan' })
  @ApiResponse({ status: 201, description: 'Joined clan successfully' })
  @ApiResponse({ status: 400, description: 'Already in a clan' })
  @ApiResponse({ status: 403, description: 'Cannot join private clan' })
  async joinClan(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.clansService.joinClan(userId, id);
  }

  @Delete(':id/leave')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave a clan' })
  @ApiResponse({ status: 200, description: 'Left clan successfully' })
  @ApiResponse({ status: 404, description: 'Not a member of this clan' })
  async leaveClan(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.clansService.leaveClan(userId, id);
  }

  @Put(':id/members/:memberId/role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update member role' })
  @ApiResponse({ status: 200, description: 'Member role updated successfully' })
  @ApiResponse({ status: 403, description: 'Only leaders can change roles' })
  async updateMemberRole(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) clanId: number,
    @Param('memberId') memberId: string,
    @Body() updateRoleDto: UpdateMemberRoleDto,
  ) {
    return this.clansService.updateMemberRole(userId, clanId, memberId, updateRoleDto);
  }

  @Delete(':id/members/:memberId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove member from clan' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async removeMember(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) clanId: number,
    @Param('memberId') memberId: string,
  ) {
    return this.clansService.removeMember(userId, clanId, memberId);
  }
}