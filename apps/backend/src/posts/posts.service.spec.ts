import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

describe('PostsService', () => {
  let service: PostsService;
  let prismaService: PrismaService;
  let usersService: UsersService;

  const mockPrismaService = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    comment: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    like: {
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    follow: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockUsersService = {
    addXP: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prismaService = module.get<PrismaService>(PrismaService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPost', () => {
    it('should create a post and award XP', async () => {
      const userId = 'user1';
      const createPostDto = {
        content: 'Test post content',
        hashtags: ['test', 'gaming'],
      };

      const mockPost = {
        id: 1,
        userId,
        content: 'Test post content',
        hashtags: ['test', 'gaming'],
        user: { id: userId, username: 'testuser' },
        _count: { likes: 0, comments: 0 },
      };

      mockPrismaService.post.create.mockResolvedValue(mockPost);
      mockUsersService.addXP.mockResolvedValue({});

      const result = await service.createPost(userId, createPostDto);

      expect(result).toEqual(mockPost);
      expect(mockPrismaService.post.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          content: 'Test post content',
          hashtags: ['test', 'gaming'],
        }),
        include: expect.any(Object),
      });
      expect(mockUsersService.addXP).toHaveBeenCalledWith(userId, 10, 'Created a post');
    });
  });

  describe('getPostById', () => {
    it('should return a post when found', async () => {
      const postId = 1;
      const userId = 'user1';
      const mockPost = {
        id: postId,
        content: 'Test post',
        user: { id: 'author1', username: 'author' },
        likes: [],
        _count: { likes: 0, comments: 0 },
      };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      const result = await service.getPostById(postId, userId);

      expect(result).toEqual({
        ...mockPost,
        isLiked: false,
        likes: undefined,
      });
    });

    it('should throw NotFoundException when post not found', async () => {
      const postId = 999;
      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.getPostById(postId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePost', () => {
    it('should update post when user is the owner', async () => {
      const userId = 'user1';
      const postId = 1;
      const updateDto = { content: 'Updated content' };

      const mockPost = { id: postId, userId, content: 'Original content' };
      const mockUpdatedPost = { id: postId, userId, content: 'Updated content', user: {}, _count: {} };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.post.update.mockResolvedValue(mockUpdatedPost);

      const result = await service.updatePost(userId, postId, updateDto);

      expect(result).toEqual(mockUpdatedPost);
      expect(mockPrismaService.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: updateDto,
        include: expect.any(Object),
      });
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      const userId = 'user1';
      const postId = 1;
      const updateDto = { content: 'Updated content' };

      const mockPost = { id: postId, userId: 'otheruser', content: 'Original content' };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      await expect(service.updatePost(userId, postId, updateDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('likePost', () => {
    it('should like a post when not already liked', async () => {
      const userId = 'user1';
      const postId = 1;

      const mockPost = { id: postId, userId: 'author1' };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.like.findUnique.mockResolvedValue(null);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          like: { create: jest.fn() },
          post: { update: jest.fn() },
        });
      });
      mockUsersService.addXP.mockResolvedValue({});

      const result = await service.likePost(userId, postId);

      expect(result).toEqual({ liked: true, message: 'Post liked' });
      expect(mockUsersService.addXP).toHaveBeenCalledWith('author1', 5, 'Received a like on post');
    });

    it('should unlike a post when already liked', async () => {
      const userId = 'user1';
      const postId = 1;

      const mockPost = { id: postId, userId: 'author1' };
      const mockLike = { id: 1, userId, targetId: postId };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.like.findUnique.mockResolvedValue(mockLike);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          like: { delete: jest.fn() },
          post: { update: jest.fn() },
        });
      });

      const result = await service.likePost(userId, postId);

      expect(result).toEqual({ liked: false, message: 'Post unliked' });
    });

    it('should throw NotFoundException when post not found', async () => {
      const userId = 'user1';
      const postId = 999;

      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.likePost(userId, postId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createComment', () => {
    it('should create a comment and award XP', async () => {
      const userId = 'user1';
      const postId = 1;
      const createCommentDto = { content: 'Great post!' };

      const mockPost = { id: postId, userId: 'author1' };
      const mockComment = {
        id: 1,
        userId,
        postId,
        content: 'Great post!',
        user: { id: userId, username: 'testuser' },
      };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          comment: { create: jest.fn().mockResolvedValue(mockComment) },
          post: { update: jest.fn() },
        });
      });
      mockUsersService.addXP.mockResolvedValue({});

      const result = await service.createComment(userId, postId, createCommentDto);

      expect(result).toEqual(mockComment);
      expect(mockUsersService.addXP).toHaveBeenCalledWith(userId, 5, 'Created a comment');
      expect(mockUsersService.addXP).toHaveBeenCalledWith('author1', 3, 'Received a comment on post');
    });

    it('should throw NotFoundException when post not found', async () => {
      const userId = 'user1';
      const postId = 999;
      const createCommentDto = { content: 'Great post!' };

      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.createComment(userId, postId, createCommentDto)).rejects.toThrow(NotFoundException);
    });
  });
});