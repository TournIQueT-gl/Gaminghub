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

import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreatePostDto, UpdatePostDto, CreateCommentDto } from './dto/post.dto';

@ApiTags('posts')
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  async createPost(
    @GetUser('id') userId: string,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.createPost(userId, createPostDto);
  }

  @Get('feed')
  @Public()
  @ApiOperation({ summary: 'Get personalized feed or public posts' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Feed retrieved successfully' })
  async getFeed(
    @GetUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.postsService.getFeed(userId, page, limit);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search posts by content or hashtags' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Search results retrieved' })
  async searchPosts(
    @Query('q') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.postsService.searchPosts(query, page, limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiResponse({ status: 200, description: 'Post retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getPost(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: string,
  ) {
    return this.postsService.getPostById(id, userId);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 403, description: 'Can only edit your own posts' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async updatePost(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(userId, id, updatePostDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete post' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 403, description: 'Can only delete your own posts' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async deletePost(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.postsService.deletePost(userId, id);
  }

  @Post(':id/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like or unlike a post' })
  @ApiResponse({ status: 200, description: 'Post like status updated' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async likePost(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.postsService.likePost(userId, id);
  }

  @Get(':id/comments')
  @Public()
  @ApiOperation({ summary: 'Get post comments' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  async getComments(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.postsService.getPostComments(id, page, limit);
  }

  @Post(':id/comments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add comment to post' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async createComment(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.postsService.createComment(userId, id, createCommentDto);
  }

  @Post('comments/:commentId/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like or unlike a comment' })
  @ApiResponse({ status: 200, description: 'Comment like status updated' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async likeComment(
    @GetUser('id') userId: string,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.postsService.likeComment(userId, commentId);
  }
}