import { storage } from "../storage";
import type { InsertNotification, Notification } from "@shared/schema";

export class NotificationService {
  async createNotification(notification: InsertNotification): Promise<Notification> {
    return await storage.createNotification(notification);
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await storage.getUserNotifications(userId);
  }

  async markAsRead(id: number, userId: string): Promise<void> {
    await storage.markNotificationAsRead(id, userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await storage.markAllNotificationsAsRead(userId);
  }

  async createSystemNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any
  ): Promise<Notification> {
    return await this.createNotification({
      userId,
      type,
      title,
      message,
      data,
    });
  }

  // Specific notification creators
  async notifyPostLike(postOwnerId: string, likerName: string, postId: number): Promise<void> {
    await this.createNotification({
      userId: postOwnerId,
      type: "post_like",
      title: "Post Liked",
      message: `${likerName} liked your post`,
      data: { postId, likerName },
    });
  }

  async notifyPostComment(postOwnerId: string, commenterName: string, postId: number): Promise<void> {
    await this.createNotification({
      userId: postOwnerId,
      type: "post_comment",
      title: "New Comment",
      message: `${commenterName} commented on your post`,
      data: { postId, commenterName },
    });
  }

  async notifyFollowUser(followedUserId: string, followerName: string): Promise<void> {
    await this.createNotification({
      userId: followedUserId,
      type: "user_follow",
      title: "New Follower",
      message: `${followerName} started following you`,
      data: { followerName },
    });
  }
}

export const notificationService = new NotificationService();
