import { storage } from "../storage";
import { notificationService } from "./notifications";
import type { Clan, ClanMembership } from "@shared/schema";

export class ClanService {
  async createClan(clanData: any, leaderId: string): Promise<Clan> {
    const clan = await storage.createClan({
      ...clanData,
      leaderId,
    });

    // Create notification for clan creation
    await notificationService.createNotification({
      userId: leaderId,
      type: "clan_created",
      title: "Clan Created",
      message: `Your clan "${clan.name}" has been created successfully!`,
      data: { clanId: clan.id },
    });

    return clan;
  }

  async joinClan(clanId: number, userId: string): Promise<ClanMembership> {
    const clan = await storage.getClanById(clanId);
    if (!clan) {
      throw new Error("Clan not found");
    }

    if (!clan.isPublic) {
      throw new Error("This clan requires an invitation");
    }

    // Check if user is already in a clan
    const existingMembership = await storage.getUserClanMembership(userId);
    if (existingMembership) {
      throw new Error("You are already a member of a clan");
    }

    const membership = await storage.joinClan(clanId, userId);

    // Create notifications
    await notificationService.createNotification({
      userId,
      type: "clan_joined",
      title: "Clan Joined",
      message: `Welcome to ${clan.name}!`,
      data: { clanId, membershipId: membership.id },
    });

    // Notify clan leader
    await notificationService.createNotification({
      userId: clan.leaderId,
      type: "clan_member_joined",
      title: "New Clan Member",
      message: `A new member has joined ${clan.name}!`,
      data: { clanId, newMemberId: userId },
    });

    return membership;
  }

  async awardClanXP(clanId: number, xp: number, reason: string): Promise<void> {
    await storage.updateClanXP(clanId, xp);

    // Get clan members to notify them
    const members = await storage.getClanMembers(clanId);
    const clan = await storage.getClanById(clanId);

    if (clan) {
      for (const member of members) {
        await notificationService.createNotification({
          userId: member.userId,
          type: "clan_xp_awarded",
          title: "Clan XP Earned",
          message: `${clan.name} earned ${xp} XP for ${reason}!`,
          data: { clanId, xpAmount: xp, reason },
        });
      }
    }
  }

  async promoteToCoLeader(clanId: number, userId: string, promotedBy: string): Promise<void> {
    const clan = await storage.getClanById(clanId);
    if (!clan) {
      throw new Error("Clan not found");
    }

    if (clan.leaderId !== promotedBy) {
      throw new Error("Only clan leaders can promote members");
    }

    // Update membership role - this would require a new method in storage
    // For now, we'll create a notification
    await notificationService.createNotification({
      userId,
      type: "clan_promotion",
      title: "Clan Promotion",
      message: `You have been promoted to Co-Leader of ${clan.name}!`,
      data: { clanId, newRole: "co-leader" },
    });
  }

  async getClanLeaderboard(): Promise<Clan[]> {
    return await storage.getClans(); // Already ordered by XP
  }
}

export const clanService = new ClanService();
