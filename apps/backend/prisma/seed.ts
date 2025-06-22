import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatRoomMembership.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.tournamentMatch.deleteMany();
  await prisma.tournamentParticipant.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.clanMembership.deleteMany();
  await prisma.clan.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      id: 'admin',
      email: 'admin@gamingx.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      bio: 'Platform administrator',
      xp: 50000,
      level: 50,
      totalWins: 100,
      totalGames: 150,
      password: adminPassword,
    },
  });

  // Create test users
  const users = [];
  for (let i = 0; i < 20; i++) {
    const password = await bcrypt.hash('password123', 12);
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        username: faker.internet.userName().toLowerCase(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        bio: faker.lorem.sentence(),
        xp: faker.number.int({ min: 0, max: 10000 }),
        level: faker.number.int({ min: 1, max: 20 }),
        totalWins: faker.number.int({ min: 0, max: 50 }),
        totalGames: faker.number.int({ min: 0, max: 100 }),
        profileImageUrl: faker.image.avatar(),
        password: password,
      },
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length + 1} users`);

  // Create follows
  for (let i = 0; i < 30; i++) {
    const follower = faker.helpers.arrayElement(users);
    const following = faker.helpers.arrayElement(users);
    
    if (follower.id !== following.id) {
      try {
        await prisma.follow.create({
          data: {
            followerId: follower.id,
            followingId: following.id,
          },
        });
      } catch (error) {
        // Skip duplicate follows
      }
    }
  }

  console.log('✅ Created follow relationships');

  // Create clans
  const clans = [];
  for (let i = 0; i < 5; i++) {
    const creator = faker.helpers.arrayElement(users);
    const clan = await prisma.clan.create({
      data: {
        name: faker.company.name() + ' Gaming',
        description: faker.lorem.paragraph(),
        imageUrl: faker.image.url(),
        isPublic: faker.datatype.boolean(),
        xp: faker.number.int({ min: 0, max: 5000 }),
        level: faker.number.int({ min: 1, max: 10 }),
        creatorId: creator.id,
      },
    });

    // Add creator as leader
    await prisma.clanMembership.create({
      data: {
        clanId: clan.id,
        userId: creator.id,
        role: 'LEADER',
      },
    });

    // Add random members
    const memberCount = faker.number.int({ min: 2, max: 8 });
    for (let j = 0; j < memberCount; j++) {
      const member = faker.helpers.arrayElement(users);
      if (member.id !== creator.id) {
        try {
          await prisma.clanMembership.create({
            data: {
              clanId: clan.id,
              userId: member.id,
              role: faker.helpers.arrayElement(['MEMBER', 'CO_LEADER']),
            },
          });
        } catch (error) {
          // Skip duplicate memberships
        }
      }
    }

    clans.push(clan);
  }

  // Update clan member counts
  for (const clan of clans) {
    const memberCount = await prisma.clanMembership.count({
      where: { clanId: clan.id },
    });
    await prisma.clan.update({
      where: { id: clan.id },
      data: { memberCount },
    });
  }

  console.log(`✅ Created ${clans.length} clans`);

  // Create tournaments
  const tournaments = [];
  for (let i = 0; i < 8; i++) {
    const creator = faker.helpers.arrayElement(users);
    const startDate = faker.date.future();
    const tournament = await prisma.tournament.create({
      data: {
        name: faker.lorem.words(3) + ' Championship',
        description: faker.lorem.paragraph(),
        game: faker.helpers.arrayElement(['Fortnite', 'CS:GO', 'Valorant', 'League of Legends', 'Rocket League']),
        maxParticipants: faker.helpers.arrayElement([8, 16, 32, 64]),
        entryFee: faker.number.float({ min: 0, max: 50, fractionDigits: 2 }),
        prizePool: faker.number.float({ min: 100, max: 1000, fractionDigits: 2 }),
        format: faker.helpers.arrayElement(['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION']),
        status: faker.helpers.arrayElement(['UPCOMING', 'ACTIVE', 'COMPLETED']),
        startDate: startDate,
        endDate: faker.date.future({ refDate: startDate }),
        creatorId: creator.id,
      },
    });

    // Add participants
    const participantCount = faker.number.int({ min: 4, max: Math.min(16, tournament.maxParticipants) });
    for (let j = 0; j < participantCount; j++) {
      const participant = faker.helpers.arrayElement(users);
      try {
        await prisma.tournamentParticipant.create({
          data: {
            tournamentId: tournament.id,
            userId: participant.id,
            status: faker.helpers.arrayElement(['REGISTERED', 'ACTIVE', 'ELIMINATED']),
            seed: j + 1,
          },
        });
      } catch (error) {
        // Skip duplicate participants
      }
    }

    tournaments.push(tournament);
  }

  console.log(`✅ Created ${tournaments.length} tournaments`);

  // Create posts
  const posts = [];
  for (let i = 0; i < 50; i++) {
    const author = faker.helpers.arrayElement(users);
    const post = await prisma.post.create({
      data: {
        userId: author.id,
        content: faker.lorem.paragraph(),
        imageUrl: faker.datatype.boolean() ? faker.image.url() : null,
        hashtags: Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () => 
          '#' + faker.lorem.word()
        ),
        likeCount: faker.number.int({ min: 0, max: 100 }),
        commentCount: faker.number.int({ min: 0, max: 20 }),
        shareCount: faker.number.int({ min: 0, max: 10 }),
        isPublic: faker.datatype.boolean(),
      },
    });
    posts.push(post);
  }

  console.log(`✅ Created ${posts.length} posts`);

  // Create comments
  for (let i = 0; i < 100; i++) {
    const author = faker.helpers.arrayElement(users);
    const post = faker.helpers.arrayElement(posts);
    try {
      await prisma.comment.create({
        data: {
          userId: author.id,
          postId: post.id,
          content: faker.lorem.sentence(),
          likeCount: faker.number.int({ min: 0, max: 20 }),
        },
      });
    } catch (error) {
      // Skip if post doesn't exist
    }
  }

  console.log('✅ Created comments');

  // Create likes
  for (let i = 0; i < 200; i++) {
    const user = faker.helpers.arrayElement(users);
    const post = faker.helpers.arrayElement(posts);
    try {
      await prisma.like.create({
        data: {
          userId: user.id,
          targetId: post.id,
          targetType: 'POST',
        },
      });
    } catch (error) {
      // Skip duplicate likes
    }
  }

  console.log('✅ Created likes');

  // Create chat rooms
  const chatRooms = [];
  
  // Public rooms
  for (let i = 0; i < 3; i++) {
    const room = await prisma.chatRoom.create({
      data: {
        name: faker.lorem.words(2) + ' Chat',
        type: 'PUBLIC',
      },
    });
    chatRooms.push(room);
  }

  // Clan rooms
  for (const clan of clans) {
    const room = await prisma.chatRoom.create({
      data: {
        name: `${clan.name} Chat`,
        type: 'CLAN',
        clanId: clan.id,
      },
    });
    chatRooms.push(room);
  }

  console.log(`✅ Created ${chatRooms.length} chat rooms`);

  // Add chat room memberships and messages
  for (const room of chatRooms) {
    const memberCount = faker.number.int({ min: 3, max: 10 });
    const roomUsers = faker.helpers.arrayElements(users, memberCount);
    
    for (const user of roomUsers) {
      try {
        await prisma.chatRoomMembership.create({
          data: {
            roomId: room.id,
            userId: user.id,
          },
        });
      } catch (error) {
        // Skip duplicate memberships
      }
    }

    // Add messages
    const messageCount = faker.number.int({ min: 5, max: 20 });
    for (let i = 0; i < messageCount; i++) {
      const author = faker.helpers.arrayElement(roomUsers);
      try {
        await prisma.chatMessage.create({
          data: {
            roomId: room.id,
            userId: author.id,
            content: faker.lorem.sentence(),
            type: 'TEXT',
          },
        });
      } catch (error) {
        // Skip if user not in room
      }
    }
  }

  console.log('✅ Created chat messages');

  // Create notifications
  for (let i = 0; i < 50; i++) {
    const user = faker.helpers.arrayElement(users);
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: faker.lorem.words(3),
        message: faker.lorem.sentence(),
        type: faker.helpers.arrayElement(['GENERAL', 'FOLLOW', 'LIKE', 'COMMENT', 'TOURNAMENT', 'CLAN']),
        isRead: faker.datatype.boolean(),
        data: {
          sourceUserId: faker.helpers.arrayElement(users).id,
        },
      },
    });
  }

  console.log('✅ Created notifications');

  console.log('🎉 Database seeding completed!');
  console.log(`
Admin User:
  Email: admin@gamingx.com
  Password: admin123

Test Users:
  Any email from the generated users
  Password: password123
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });