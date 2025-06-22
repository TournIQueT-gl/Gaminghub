import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreatePostDto, UpdatePostDto, CreateCommentDto } from './dto/post.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async createPost(userId: string, createPostDto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        userId,
        content: createPostDto.content,
        imageUrl: createPostDto.imageUrl,
        hashtags: createPostDto.hashtags || [],
        isPublic: createPostDto.isPublic ?? true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            level: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Award XP for creating a post
    await this.usersService.addXP(userId, 10, 'Created a post');

    return post;
  }

  async getFeed(userId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    let whereClause: Prisma.PostWhereInput = {
      isPublic: true,
    };

    // If user is logged in, include posts from followed users
    if (userId) {
      const followingIds = await this.prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });

      whereClause = {
        OR: [
          { isPublic: true },
          { userId: { in: [userId, ...followingIds.map(f => f.followingId)] } },
        ],
      };
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              level: true,
            },
          },
          likes: userId ? {
            where: { userId },
            select: { id: true },
          } : false,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where: whereClause }),
    ]);

    // Add isLiked field for authenticated users
    const postsWithLikeStatus = posts.map(post => ({
      ...post,
      isLiked: userId ? post.likes.length > 0 : false,
      likes: undefined, // Remove the likes array from response
    }));

    return {
      posts: postsWithLikeStatus,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPostById(id: number, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            level: true,
          },
        },
        likes: userId ? {
          where: { userId },
          select: { id: true },
        } : false,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      ...post,
      isLiked: userId ? post.likes.length > 0 : false,
      likes: undefined,
    };
  }

  async getUserPosts(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              level: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where: { userId } }),
    ]);

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updatePost(userId: string, postId: number, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: updatePostDto,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            level: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return updatedPost;
  }

  async deletePost(userId: string, postId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { message: 'Post deleted successfully' };
  }

  async likePost(userId: string, postId: number) {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if already liked
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_targetId_targetType: {
          userId,
          targetId: postId,
          targetType: 'POST',
        },
      },
    });

    if (existingLike) {
      // Unlike the post
      await this.prisma.$transaction([
        this.prisma.like.delete({
          where: {
            userId_targetId_targetType: {
              userId,
              targetId: postId,
              targetType: 'POST',
            },
          },
        }),
        this.prisma.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);

      return { liked: false, message: 'Post unliked' };
    } else {
      // Like the post
      await this.prisma.$transaction([
        this.prisma.like.create({
          data: {
            userId,
            targetId: postId,
            targetType: 'POST',
          },
        }),
        this.prisma.post.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
        }),
      ]);

      // Award XP to post owner if not self-like
      if (post.userId !== userId) {
        await this.usersService.addXP(post.userId, 5, 'Received a like on post');
      }

      return { liked: true, message: 'Post liked' };
    }
  }

  async getPostComments(postId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              level: true,
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({ where: { postId } }),
    ]);

    return {
      comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createComment(userId: string, postId: number, createCommentDto: CreateCommentDto) {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          userId,
          postId,
          content: createCommentDto.content,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              level: true,
            },
          },
        },
      });

      // Update comment count
      await tx.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      });

      return newComment;
    });

    // Award XP for commenting
    await this.usersService.addXP(userId, 5, 'Created a comment');

    // Award XP to post owner if not self-comment
    if (post.userId !== userId) {
      await this.usersService.addXP(post.userId, 3, 'Received a comment on post');
    }

    return comment;
  }

  async likeComment(userId: string, commentId: number) {
    // Check if comment exists
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if already liked
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_targetId_targetType: {
          userId,
          targetId: commentId,
          targetType: 'COMMENT',
        },
      },
    });

    if (existingLike) {
      // Unlike the comment
      await this.prisma.$transaction([
        this.prisma.like.delete({
          where: {
            userId_targetId_targetType: {
              userId,
              targetId: commentId,
              targetType: 'COMMENT',
            },
          },
        }),
        this.prisma.comment.update({
          where: { id: commentId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);

      return { liked: false, message: 'Comment unliked' };
    } else {
      // Like the comment
      await this.prisma.$transaction([
        this.prisma.like.create({
          data: {
            userId,
            targetId: commentId,
            targetType: 'COMMENT',
          },
        }),
        this.prisma.comment.update({
          where: { id: commentId },
          data: { likeCount: { increment: 1 } },
        }),
      ]);

      // Award XP to comment owner if not self-like
      if (comment.userId !== userId) {
        await this.usersService.addXP(comment.userId, 2, 'Received a like on comment');
      }

      return { liked: true, message: 'Comment liked' };
    }
  }

  async searchPosts(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          AND: [
            { isPublic: true },
            {
              OR: [
                { content: { contains: query, mode: 'insensitive' } },
                { hashtags: { has: query } },
              ],
            },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              level: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({
        where: {
          AND: [
            { isPublic: true },
            {
              OR: [
                { content: { contains: query, mode: 'insensitive' } },
                { hashtags: { has: query } },
              ],
            },
          ],
        },
      }),
    ]);

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}