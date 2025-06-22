import { storage } from "../storage";
import { notificationService } from "./notifications";
import type { Tournament, TournamentParticipant, TournamentMatch } from "@shared/schema";

export class TournamentService {
  async createTournament(tournamentData: any, creatorId: string): Promise<Tournament> {
    const tournament = await storage.createTournament({
      ...tournamentData,
      createdBy: creatorId,
    });

    // Create notification for tournament creation
    await notificationService.createNotification({
      userId: creatorId,
      type: "tournament_created",
      title: "Tournament Created",
      message: `Your tournament "${tournament.name}" has been created successfully!`,
      data: { tournamentId: tournament.id },
    });

    return tournament;
  }

  async joinTournament(tournamentId: number, userId: string, clanId?: number): Promise<TournamentParticipant> {
    const tournament = await storage.getTournamentById(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.status !== "registering") {
      throw new Error("Tournament registration is closed");
    }

    if (tournament.currentParticipants >= tournament.maxParticipants) {
      throw new Error("Tournament is full");
    }

    const participant = await storage.joinTournament(tournamentId, userId, clanId);

    // Create notification
    await notificationService.createNotification({
      userId,
      type: "tournament_joined",
      title: "Tournament Joined",
      message: `You have successfully joined "${tournament.name}"!`,
      data: { tournamentId, participantId: participant.id },
    });

    // Check if tournament is full and start if needed
    const updatedTournament = await storage.getTournamentById(tournamentId);
    if (updatedTournament && updatedTournament.currentParticipants >= updatedTournament.maxParticipants) {
      await this.startTournament(tournamentId);
    }

    return participant;
  }

  async startTournament(tournamentId: number): Promise<void> {
    const participants = await storage.getTournamentParticipants(tournamentId);
    
    if (participants.length < 2) {
      throw new Error("Not enough participants to start tournament");
    }

    // Generate first round matches
    await this.generateBracket(tournamentId, participants);

    // Notify all participants
    for (const participant of participants) {
      if (participant.userId) {
        await notificationService.createNotification({
          userId: participant.userId,
          type: "tournament_started",
          title: "Tournament Started",
          message: "Your tournament has begun! Check your matches.",
          data: { tournamentId, participantId: participant.id },
        });
      }
    }
  }

  private async generateBracket(tournamentId: number, participants: TournamentParticipant[]): Promise<void> {
    // Simple single-elimination bracket generation
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        await storage.createTournamentMatch({
          tournamentId,
          round: 1,
          participant1Id: shuffled[i].id,
          participant2Id: shuffled[i + 1].id,
          winnerId: null,
          score: null,
          status: "pending",
          scheduledAt: new Date(),
          completedAt: null,
        });
      }
    }
  }

  async recordMatchResult(matchId: number, winnerId: number, score: any, reportedBy: string): Promise<void> {
    const match = await storage.updateMatchResult(matchId, winnerId, score);

    // Notify participants about match result
    // This would require getting match details and participant user IDs
    // Implementation would depend on match data structure
  }

  async advanceTournament(tournamentId: number): Promise<void> {
    // Check if current round is complete
    // Generate next round matches
    // This is a simplified version - full implementation would be more complex
  }
}

export const tournamentService = new TournamentService();
