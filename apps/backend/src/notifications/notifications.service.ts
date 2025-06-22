import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/notification.dto';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createNotification(userId: string, createNotificationDto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        type: createNotificationDto.type,
        data: createNotificationDto.data,
      },
    });

    this.logger.log(`Notification created for user ${userId}: ${createNotificationDto.title}`);
    return notification;
  }

  async getUserNotifications(userId: string, page = 1, limit = 20, unreadOnly = false) {
    const skip = (page - 1) * limit;

    const whereClause = unreadOnly ? { userId, isRead: false } : { userId };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: whereClause }),
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(userId: string, notificationId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.isRead) {
      return notification;
    }

    const updatedNotification = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return updatedNotification;
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { message: `Marked ${result.count} notifications as read` };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }

  async deleteNotification(userId: string, notificationId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return { message: 'Notification deleted successfully' };
  }

  // Helper methods for creating specific notification types

  async createFollowNotification(followedUserId: string, followerName: string) {
    return this.createNotification(followedUserId, {
      title: 'New Follower',
      message: `${followerName} started following you`,
      type: NotificationType.FOLLOW,
      data: { followerName },
    });
  }

  async createLikeNotification(postOwnerId: string, likerName: string, postId: number) {
    return this.createNotification(postOwnerId, {
      title: 'Post Liked',
      message: `${likerName} liked your post`,
      type: NotificationType.LIKE,
      data: { likerName, postId },
    });
  }

  async createCommentNotification(postOwnerId: string, commenterName: string, postId: number) {
    return this.createNotification(postOwnerId, {
      title: 'New Comment',
      message: `${commenterName} commented on your post`,
      type: NotificationType.COMMENT,
      data: { commenterName, postId },
    });
  }

  async createTournamentNotification(userId: string, title: string, message: string, tournamentId: number) {
    return this.createNotification(userId, {
      title,
      message,
      type: NotificationType.TOURNAMENT,
      data: { tournamentId },
    });
  }

  async createClanNotification(userId: string, title: string, message: string, clanId: number) {
    return this.createNotification(userId, {
      title,
      message,
      type: NotificationType.CLAN,
      data: { clanId },
    });
  }

  async createSystemNotification(userId: string, title: string, message: string, data?: any) {
    return this.createNotification(userId, {
      title,
      message,
      type: NotificationType.SYSTEM,
      data,
    });
  }

  // Bulk notification methods

  async notifyAllClanMembers(clanId: number, title: string, message: string) {
    const memberships = await this.prisma.clanMembership.findMany({
      where: { clanId },
      select: { userId: true },
    });

    const notifications = memberships.map(membership => ({
      userId: membership.userId,
      title,
      message,
      type: NotificationType.CLAN,
      data: { clanId },
    }));

    await this.prisma.notification.createMany({
      data: notifications,
    });

    this.logger.log(`Sent clan notification to ${notifications.length} members of clan ${clanId}`);
    return { message: `Notification sent to ${notifications.length} clan members` };
  }

  async notifyAllTournamentParticipants(tournamentId: number, title: string, message: string) {
    const participants = await this.prisma.tournamentParticipant.findMany({
      where: { tournamentId },
      select: { userId: true },
    });

    const notifications = participants
      .filter(p => p.userId) // Filter out clan-only participants
      .map(participant => ({
        userId: participant.userId!,
        title,
        message,
        type: NotificationType.TOURNAMENT,
        data: { tournamentId },
      }));

    await this.prisma.notification.createMany({
      data: notifications,
    });

    this.logger.log(`Sent tournament notification to ${notifications.length} participants of tournament ${tournamentId}`);
    return { message: `Notification sent to ${notifications.length} tournament participants` };
  }
}