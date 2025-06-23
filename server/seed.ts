import { faker } from '@faker-js/faker';
import { storage } from './index';

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // Create sample users
    const users = [];
    for (let i = 0; i < 20; i++) {
      const user = await storage.upsertUser({
        id: `user-${i}`,
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        username: faker.internet.username(),
        displayName: faker.person.fullName(),
        bio: faker.lorem.sentence(),
        location: faker.location.city(),
        website: faker.internet.url(),
        profileImageUrl: faker.image.avatar(),
        favoriteGames: faker.helpers.arrayElements(['Valorant', 'CS2', 'League of Legends', 'Dota 2', 'Overwatch'], 3),
        level: faker.number.int({ min: 1, max: 100 }),
        xp: faker.number.int({ min: 0, max: 10000 }),
        isVerified: faker.datatype.boolean(0.2),
        gamingSetup: faker.lorem.paragraph(),
        achievements: [],
        createdAt: faker.date.past(),
        updatedAt: new Date(),
      });
      users.push(user);
    }
    console.log(`✅ Created ${users.length} users`);

    // Create clans
    const clans = [];
    for (let i = 0; i < 10; i++) {
      const clan = await storage.createClan({
        name: `${faker.company.name()} Gaming`,
        description: faker.lorem.paragraph(),
        game: faker.helpers.arrayElement(['Valorant', 'CS2', 'League of Legends']),
        logoUrl: faker.image.url(),
        bannerUrl: faker.image.url(),
        leaderId: faker.helpers.arrayElement(users).id,
        memberLimit: faker.number.int({ min: 20, max: 100 }),
        isPublic: faker.datatype.boolean(0.8),
        requirements: faker.lorem.sentence(),
        tags: faker.helpers.arrayElements(['competitive', 'casual', 'friendly', 'tournament'], 2),
        xp: faker.number.int({ min: 0, max: 50000 }),
        level: faker.number.int({ min: 1, max: 50 }),
      });
      clans.push(clan);
    }
    console.log(`✅ Created ${clans.length} clans`);

    // Add clan memberships
    for (const clan of clans) {
      const memberCount = faker.number.int({ min: 5, max: 20 });
      for (let i = 0; i < memberCount; i++) {
        const user = faker.helpers.arrayElement(users);
        try {
          await storage.joinClan(clan.id, user.id, faker.helpers.arrayElement(['member', 'moderator']));
        } catch (error) {
          // User might already be in clan, skip
        }
      }
    }
    console.log('✅ Created clan memberships');

    // Create tournaments
    const tournaments = [];
    for (let i = 0; i < 15; i++) {
      const tournament = await storage.createTournament({
        name: `${faker.company.name()} Championship`,
        description: faker.lorem.paragraphs(2),
        game: faker.helpers.arrayElement(['Valorant', 'CS2', 'League of Legends', 'Dota 2']),
        format: faker.helpers.arrayElement(['single-elimination', 'double-elimination', 'round-robin']),
        maxParticipants: faker.helpers.arrayElement([16, 32, 64, 128]),
        prizePool: faker.number.int({ min: 1000, max: 100000 }).toString(),
        currency: 'USD',
        entryFee: faker.number.int({ min: 0, max: 50 }),
        startDate: faker.date.future(),
        endDate: faker.date.future(),
        registrationDeadline: faker.date.soon(),
        rules: faker.lorem.paragraphs(3),
        status: faker.helpers.arrayElement(['upcoming', 'registration', 'ongoing', 'completed']),
        isPublic: faker.datatype.boolean(0.9),
        createdBy: faker.helpers.arrayElement(users).id,
      });
      tournaments.push(tournament);
    }
    console.log(`✅ Created ${tournaments.length} tournaments`);

    // Create posts
    const posts = [];
    for (let i = 0; i < 50; i++) {
      const post = await storage.createPost({
        userId: faker.helpers.arrayElement(users).id,
        content: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
        imageUrl: faker.datatype.boolean(0.3) ? faker.image.url() : null,
        videoUrl: faker.datatype.boolean(0.1) ? faker.internet.url() : null,
        game: faker.helpers.arrayElement(['Valorant', 'CS2', 'League of Legends', 'Dota 2', null]),
        tags: faker.helpers.arrayElements(['gaming', 'tournament', 'highlight', 'tips', 'funny'], faker.number.int({ min: 0, max: 3 })),
        visibility: faker.helpers.arrayElement(['public', 'friends', 'private']),
      });
      posts.push(post);
    }
    console.log(`✅ Created ${posts.length} posts`);

    // Create comments and likes
    for (const post of posts) {
      // Add comments
      const commentCount = faker.number.int({ min: 0, max: 10 });
      for (let i = 0; i < commentCount; i++) {
        await storage.createComment({
          postId: post.id,
          userId: faker.helpers.arrayElement(users).id,
          content: faker.lorem.sentence(),
        });
      }

      // Add likes
      const likeCount = faker.number.int({ min: 0, max: 50 });
      for (let i = 0; i < likeCount; i++) {
        const user = faker.helpers.arrayElement(users);
        try {
          await storage.toggleLike(user.id, post.id, 'post');
        } catch (error) {
          // User might have already liked, skip
        }
      }
    }
    console.log('✅ Created comments and likes');

    // Create some streams
    for (let i = 0; i < 5; i++) {
      const stream = await storage.createStream({
        streamerId: faker.helpers.arrayElement(users).id,
        title: `${faker.lorem.words(3)} - Live Stream`,
        description: faker.lorem.paragraph(),
        game: faker.helpers.arrayElement(['Valorant', 'CS2', 'League of Legends']),
        category: 'gaming',
        isPublic: true,
        allowChat: true,
        allowDonations: true,
      });

      // Add some chat messages if stream is live
      if (faker.datatype.boolean(0.5)) {
        await storage.startStream(stream.id);
        for (let j = 0; j < faker.number.int({ min: 10, max: 50 }); j++) {
          await storage.sendStreamChat({
            streamId: stream.id,
            userId: faker.helpers.arrayElement(users).id,
            message: faker.lorem.sentence(),
            messageType: 'chat',
          });
        }
      }
    }
    console.log('✅ Created streams and chat messages');

    // Create content pieces
    for (let i = 0; i < 30; i++) {
      await storage.createContent({
        creatorId: faker.helpers.arrayElement(users).id,
        type: faker.helpers.arrayElement(['video', 'clip', 'screenshot', 'guide', 'review']),
        title: faker.lorem.words(5),
        description: faker.lorem.paragraph(),
        content: faker.datatype.boolean(0.3) ? faker.lorem.paragraphs(3) : null,
        mediaUrl: faker.image.url(),
        thumbnailUrl: faker.image.url(),
        game: faker.helpers.arrayElement(['Valorant', 'CS2', 'League of Legends']),
        tags: faker.helpers.arrayElements(['tutorial', 'highlight', 'funny', 'tips', 'gameplay'], 3),
        duration: faker.number.int({ min: 30, max: 3600 }),
        resolution: faker.helpers.arrayElement(['720p', '1080p', '4K']),
        fps: faker.helpers.arrayElement([30, 60, 120]),
        visibility: 'public',
      });
    }
    console.log('✅ Created content pieces');

    // Create follows and social connections
    for (let i = 0; i < 100; i++) {
      const follower = faker.helpers.arrayElement(users);
      const following = faker.helpers.arrayElement(users);
      
      if (follower.id !== following.id) {
        try {
          await storage.followUser(follower.id, following.id);
        } catch (error) {
          // Relationship might already exist, skip
        }
      }
    }
    console.log('✅ Created social connections');

    // Create notifications
    for (const user of users.slice(0, 10)) {
      for (let i = 0; i < faker.number.int({ min: 5, max: 20 }); i++) {
        await storage.createNotification({
          userId: user.id,
          type: faker.helpers.arrayElement(['like', 'comment', 'follow', 'tournament', 'clan']),
          category: faker.helpers.arrayElement(['social', 'gaming', 'system']),
          title: faker.lorem.words(4),
          message: faker.lorem.sentence(),
          actionText: faker.helpers.arrayElement(['View', 'Join', 'Accept']),
          actionUrl: faker.internet.url(),
          priority: faker.helpers.arrayElement(['low', 'normal', 'high']),
        });
      }
    }
    console.log('✅ Created notifications');

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📊 Summary:
- ${users.length} users
- ${clans.length} clans
- ${tournaments.length} tournaments  
- ${posts.length} posts
- 5 streams
- 30 content pieces
- 100+ social connections
- 100+ notifications
    `);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedDatabase };