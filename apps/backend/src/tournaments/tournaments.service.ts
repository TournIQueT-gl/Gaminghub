import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { ClansService } from '../clans/clans.service';
import { CreateTournamentDto, UpdateTournamentDto, JoinTournamentDto, SubmitMatchResultDto, CreateTeamDto } from './dto/tournament.dto';
import { TournamentStatus, TournamentParticipantStatus, MatchStatus, TournamentType } from '@prisma/client';

@Injectable()
export class TournamentsService {
  private readonly logger = new Logger(TournamentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly clansService: ClansService,
  ) {}

  async createTournament(userId: string, createTournamentDto: CreateTournamentDto) {
    const tournament = await this.prisma.tournament.create({
      data: {
        name: createTournamentDto.name,
        description: createTournamentDto.description,
        game: createTournamentDto.game,
        maxParticipants: createTournamentDto.maxParticipants,
        entryFee: createTournamentDto.entryFee,
        prizePool: createTournamentDto.prizePool,
        format: createTournamentDto.format,
        type: createTournamentDto.type || TournamentType.SOLO,
        startDate: createTournamentDto.startDate,
        endDate: createTournamentDto.endDate,
        creatorId: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    // Award XP for creating a tournament
    await this.usersService.addXP(userId, 200, 'Created a tournament');

    return {
      ...tournament,
      participantCount: tournament._count.participants,
      _count: undefined,
    };
  }

  async getTournaments(page = 1, limit = 20, status?: TournamentStatus) {
    const skip = (page - 1) * limit;

    const whereClause = status ? { status } : {};

    const [tournaments, total] = await Promise.all([
      this.prisma.tournament.findMany({
        where: whereClause,
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
          _count: {
            select: {
              participants: true,
            },
          },
        },
        orderBy: { startDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.tournament.count({ where: whereClause }),
    ]);

    return {
      tournaments: tournaments.map(tournament => ({
        ...tournament,
        participantCount: tournament._count.participants,
        _count: undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTournamentById(id: number) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
        participants: {
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
            clan: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        _count: {
          select: {
            participants: true,
            matches: true,
          },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    return {
      ...tournament,
      participantCount: tournament._count.participants,
      matchCount: tournament._count.matches,
      _count: undefined,
    };
  }

  async updateTournament(userId: string, tournamentId: number, updateTournamentDto: UpdateTournamentDto) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.creatorId !== userId) {
      throw new ForbiddenException('Only tournament creator can update tournament');
    }

    if (tournament.status !== TournamentStatus.UPCOMING) {
      throw new BadRequestException('Cannot update tournament that has already started');
    }

    const updatedTournament = await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: updateTournamentDto,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return {
      ...updatedTournament,
      participantCount: updatedTournament._count.participants,
      _count: undefined,
    };
  }

  async joinTournament(userId: string, tournamentId: number, joinTournamentDto: JoinTournamentDto) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.status !== TournamentStatus.UPCOMING) {
      throw new BadRequestException('Cannot join tournament that has already started');
    }

    if (tournament._count.participants >= tournament.maxParticipants) {
      throw new BadRequestException('Tournament is full');
    }

    // Check if user is already participating
    const existingParticipant = await this.prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId,
          userId,
        },
      },
    });

    if (existingParticipant) {
      throw new BadRequestException('Already participating in this tournament');
    }

    let teamId: number | null = null;
    if (joinTournamentDto.teamId) {
      if (tournament.type !== TournamentType.TEAM) {
        throw new BadRequestException('Cannot join with team in solo tournament');
      }
      
      // Verify user is member of the team
      const teamMember = await this.prisma.teamMember.findFirst({
        where: {
          teamId: joinTournamentDto.teamId,
          userId,
        },
        include: {
          team: true,
        },
      });

      if (!teamMember || teamMember.team.tournamentId !== tournamentId) {
        throw new BadRequestException('You are not a member of this team or team not in tournament');
      }
      teamId = joinTournamentDto.teamId;
    } else if (tournament.type === TournamentType.TEAM) {
      throw new BadRequestException('Team tournaments require a team ID');
    }

    const participant = await this.prisma.tournamentParticipant.create({
      data: {
        tournamentId,
        userId,
        teamId,
        status: TournamentParticipantStatus.REGISTERED,
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
        team: teamId ? {
          select: {
            id: true,
            name: true,
            tag: true,
            avatarUrl: true,
          },
        } : false,
        tournament: {
          select: {
            id: true,
            name: true,
            game: true,
          },
        },
      },
    });

    // Award XP for joining tournament
    await this.usersService.addXP(userId, 50, 'Joined a tournament');

    return participant;
  }

  async createTeam(userId: string, createTeamDto: CreateTeamDto) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: createTeamDto.tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.type !== TournamentType.TEAM) {
      throw new BadRequestException('Cannot create team for solo tournament');
    }

    if (tournament.status !== TournamentStatus.UPCOMING) {
      throw new BadRequestException('Cannot create team after tournament has started');
    }

    // Verify all members exist and are not already in a team for this tournament
    const members = await this.prisma.user.findMany({
      where: {
        id: { in: [userId, ...createTeamDto.memberIds] },
      },
    });

    if (members.length !== createTeamDto.memberIds.length + 1) {
      throw new BadRequestException('One or more users not found');
    }

    // Check if any member is already in a team for this tournament
    const existingTeamMembers = await this.prisma.teamMember.findMany({
      where: {
        userId: { in: [userId, ...createTeamDto.memberIds] },
        team: {
          tournamentId: createTeamDto.tournamentId,
        },
      },
    });

    if (existingTeamMembers.length > 0) {
      throw new BadRequestException('One or more users are already in a team for this tournament');
    }

    const team = await this.prisma.$transaction(async (tx) => {
      const newTeam = await tx.team.create({
        data: {
          name: createTeamDto.name,
          tag: createTeamDto.tag,
          tournamentId: createTeamDto.tournamentId,
          captainId: userId,
        },
      });

      // Add captain as team member
      await tx.teamMember.create({
        data: {
          teamId: newTeam.id,
          userId,
          role: 'CAPTAIN',
        },
      });

      // Add other members
      if (createTeamDto.memberIds.length > 0) {
        await tx.teamMember.createMany({
          data: createTeamDto.memberIds.map(memberId => ({
            teamId: newTeam.id,
            userId: memberId,
            role: 'MEMBER' as const,
          })),
        });
      }

      return tx.team.findUnique({
        where: { id: newTeam.id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  profileImageUrl: true,
                },
              },
            },
          },
          captain: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
        },
      });
    });

    return team;
  }

  async startTournament(userId: string, tournamentId: number) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        participants: true,
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.creatorId !== userId) {
      throw new ForbiddenException('Only tournament creator can start tournament');
    }

    if (tournament.status !== TournamentStatus.UPCOMING) {
      throw new BadRequestException('Tournament has already started or ended');
    }

    if (tournament.participants.length < 2) {
      throw new BadRequestException('Need at least 2 participants to start tournament');
    }

    // Update tournament status and generate bracket
    const updatedTournament = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.tournament.update({
        where: { id: tournamentId },
        data: { status: TournamentStatus.ACTIVE },
      });

      // Generate tournament bracket
      await this.generateBracket(tx, tournamentId, tournament.participants);

      return updated;
    });

    return updatedTournament;
  }

  async getTournamentBracket(tournamentId: number) {
    const matches = await this.prisma.tournamentMatch.findMany({
      where: { tournamentId },
      include: {
        player1: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
              },
            },
            clan: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        player2: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
              },
            },
            clan: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        winner: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
              },
            },
          },
        },
      },
      orderBy: [{ round: 'asc' }, { id: 'asc' }],
    });

    // Group matches by round
    const bracket = matches.reduce((acc, match) => {
      if (!acc[match.round]) {
        acc[match.round] = [];
      }
      acc[match.round].push(match);
      return acc;
    }, {} as Record<number, typeof matches>);

    return bracket;
  }

  async submitMatchResult(userId: string, matchId: number, submitResultDto: SubmitMatchResultDto) {
    const match = await this.prisma.tournamentMatch.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
        player1: {
          include: { user: true },
        },
        player2: {
          include: { user: true },
        },
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.status !== MatchStatus.SCHEDULED && match.status !== MatchStatus.ACTIVE) {
      throw new BadRequestException('Match is not active');
    }

    // Verify user is tournament creator or one of the participants
    const isCreator = match.tournament.creatorId === userId;
    const isParticipant = match.player1?.userId === userId || match.player2?.userId === userId;

    if (!isCreator && !isParticipant) {
      throw new ForbiddenException('Only tournament creator or participants can submit results');
    }

    // Validate winner is one of the participants
    if (submitResultDto.winnerId !== match.player1Id && submitResultDto.winnerId !== match.player2Id) {
      throw new BadRequestException('Winner must be one of the match participants');
    }

    const updatedMatch = await this.prisma.$transaction(async (tx) => {
      // Update match result
      const updated = await tx.tournamentMatch.update({
        where: { id: matchId },
        data: {
          winnerId: submitResultDto.winnerId,
          score: submitResultDto.score,
          status: MatchStatus.COMPLETED,
          completedAt: new Date(),
        },
        include: {
          player1: {
            include: { user: true, clan: true },
          },
          player2: {
            include: { user: true, clan: true },
          },
          winner: {
            include: { user: true, clan: true },
          },
        },
      });

      // Update participant status
      await tx.tournamentParticipant.update({
        where: { id: submitResultDto.winnerId },
        data: { status: TournamentParticipantStatus.ACTIVE },
      });

      const loserId = submitResultDto.winnerId === match.player1Id ? match.player2Id : match.player1Id;
      if (loserId) {
        await tx.tournamentParticipant.update({
          where: { id: loserId },
          data: { status: TournamentParticipantStatus.ELIMINATED },
        });
      }

      // Check if this was the final match
      const remainingMatches = await tx.tournamentMatch.count({
        where: {
          tournamentId: match.tournamentId,
          status: { in: [MatchStatus.SCHEDULED, MatchStatus.ACTIVE] },
        },
      });

      if (remainingMatches === 0) {
        // Tournament is complete
        await tx.tournament.update({
          where: { id: match.tournamentId },
          data: {
            status: TournamentStatus.COMPLETED,
            winnerId: updated.winner?.userId,
            endDate: new Date(),
          },
        });

        // Update winner status
        await tx.tournamentParticipant.update({
          where: { id: submitResultDto.winnerId },
          data: { status: TournamentParticipantStatus.WINNER },
        });

        // Award winner XP and update game stats
        if (updated.winner?.userId) {
          await this.usersService.addXP(updated.winner.userId, 500, 'Won a tournament');
          
          await tx.user.update({
            where: { id: updated.winner.userId },
            data: {
              totalWins: { increment: 1 },
              totalGames: { increment: 1 },
            },
          });

          // Award clan XP if winner represents a clan
          if (updated.winner.clanId) {
            await this.clansService.addClanXP(updated.winner.clanId, 1000, 'Member won tournament');
          }
        }

        // Update loser game stats
        const loser = updated.player1Id === submitResultDto.winnerId ? updated.player2 : updated.player1;
        if (loser?.userId) {
          await tx.user.update({
            where: { id: loser.userId },
            data: { totalGames: { increment: 1 } },
          });
        }
      } else {
        // Generate next round matches if needed
        await this.advanceToNextRound(tx, match.tournamentId, match.round);
      }

      return updated;
    });

    return updatedMatch;
  }

  async searchTournaments(query: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [tournaments, total] = await Promise.all([
      this.prisma.tournament.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { game: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
          _count: {
            select: {
              participants: true,
            },
          },
        },
        orderBy: { startDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.tournament.count({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { game: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return {
      tournaments: tournaments.map(tournament => ({
        ...tournament,
        participantCount: tournament._count.participants,
        _count: undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async generateBracket(tx: any, tournamentId: number, participants: any[]) {
    // Shuffle and seed participants
    const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
    
    // Update participant seeds
    for (let i = 0; i < shuffledParticipants.length; i++) {
      await tx.tournamentParticipant.update({
        where: { id: shuffledParticipants[i].id },
        data: { seed: i + 1 },
      });
    }

    // Generate first round matches
    const firstRoundMatches = [];
    for (let i = 0; i < shuffledParticipants.length; i += 2) {
      if (i + 1 < shuffledParticipants.length) {
        firstRoundMatches.push({
          tournamentId,
          round: 1,
          player1Id: shuffledParticipants[i].id,
          player2Id: shuffledParticipants[i + 1].id,
          status: MatchStatus.SCHEDULED,
        });
      }
    }

    // Create first round matches
    await tx.tournamentMatch.createMany({
      data: firstRoundMatches,
    });
  }

  private async advanceToNextRound(tx: any, tournamentId: number, currentRound: number) {
    // Get winners from current round
    const currentRoundMatches = await tx.tournamentMatch.findMany({
      where: {
        tournamentId,
        round: currentRound,
        status: MatchStatus.COMPLETED,
      },
    });

    const winners = currentRoundMatches
      .filter((match: any) => match.winnerId)
      .map((match: any) => match.winnerId);

    // If we have enough winners for next round, create matches
    if (winners.length >= 2 && winners.length % 2 === 0) {
      const nextRoundMatches = [];
      for (let i = 0; i < winners.length; i += 2) {
        nextRoundMatches.push({
          tournamentId,
          round: currentRound + 1,
          player1Id: winners[i],
          player2Id: winners[i + 1],
          status: MatchStatus.SCHEDULED,
        });
      }

      await tx.tournamentMatch.createMany({
        data: nextRoundMatches,
      });
    }
  }
}