import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('GamingX API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = app.get(PrismaService);
    
    await app.init();

    // Clean database
    await prisma.cleanDatabase();
  });

  afterAll(async () => {
    await prisma.cleanDatabase();
    await app.close();
  });

  describe('Health Check', () => {
    it('/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBeDefined();
          expect(res.body.services).toBeDefined();
        });
    });
  });

  describe('Authentication', () => {
    it('/auth/register (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.user).toBeDefined();
          expect(res.body.user.email).toBe('test@example.com');
          authToken = res.body.accessToken;
          testUser = res.body.user;
        });
    });

    it('/auth/login (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.user.email).toBe('test@example.com');
        });
    });

    it('/auth/me (GET)', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('test@example.com');
        });
    });
  });

  describe('Posts', () => {
    let postId: number;

    it('/posts (POST)', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'This is a test post!',
          hashtags: ['test', 'gaming'],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.content).toBe('This is a test post!');
          expect(res.body.hashtags).toEqual(['test', 'gaming']);
          postId = res.body.id;
        });
    });

    it('/posts/feed (GET)', () => {
      return request(app.getHttpServer())
        .get('/posts/feed')
        .expect(200)
        .expect((res) => {
          expect(res.body.posts).toBeDefined();
          expect(Array.isArray(res.body.posts)).toBe(true);
        });
    });

    it('/posts/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/posts/${postId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(postId);
          expect(res.body.content).toBe('This is a test post!');
        });
    });

    it('/posts/:id/like (POST)', () => {
      return request(app.getHttpServer())
        .post(`/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.liked).toBe(true);
        });
    });

    it('/posts/:id/comments (POST)', () => {
      return request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Great post!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.content).toBe('Great post!');
          expect(res.body.postId).toBe(postId);
        });
    });
  });

  describe('Users', () => {
    it('/users/me (GET)', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('test@example.com');
          expect(res.body.username).toBe('testuser');
        });
    });

    it('/users/me (PUT)', () => {
      return request(app.getHttpServer())
        .put('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bio: 'Updated bio for testing',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.bio).toBe('Updated bio for testing');
        });
    });

    it('/users/search (GET)', () => {
      return request(app.getHttpServer())
        .get('/users/search?q=test')
        .expect(200)
        .expect((res) => {
          expect(res.body.users).toBeDefined();
          expect(Array.isArray(res.body.users)).toBe(true);
        });
    });
  });

  describe('Clans', () => {
    let clanId: number;

    it('/clans (POST)', () => {
      return request(app.getHttpServer())
        .post('/clans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Clan',
          description: 'A clan for testing',
          isPublic: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('Test Clan');
          expect(res.body.description).toBe('A clan for testing');
          clanId = res.body.id;
        });
    });

    it('/clans (GET)', () => {
      return request(app.getHttpServer())
        .get('/clans')
        .expect(200)
        .expect((res) => {
          expect(res.body.clans).toBeDefined();
          expect(Array.isArray(res.body.clans)).toBe(true);
          expect(res.body.clans.length).toBeGreaterThan(0);
        });
    });

    it('/clans/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/clans/${clanId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(clanId);
          expect(res.body.name).toBe('Test Clan');
        });
    });
  });

  describe('Tournaments', () => {
    let tournamentId: number;

    it('/tournaments (POST)', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);

      return request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Tournament',
          description: 'A tournament for testing',
          game: 'Test Game',
          maxParticipants: 8,
          startDate: startDate.toISOString(),
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('Test Tournament');
          expect(res.body.game).toBe('Test Game');
          tournamentId = res.body.id;
        });
    });

    it('/tournaments (GET)', () => {
      return request(app.getHttpServer())
        .get('/tournaments')
        .expect(200)
        .expect((res) => {
          expect(res.body.tournaments).toBeDefined();
          expect(Array.isArray(res.body.tournaments)).toBe(true);
        });
    });

    it('/tournaments/:id/join (POST)', () => {
      return request(app.getHttpServer())
        .post(`/tournaments/${tournamentId}/join`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(201)
        .expect((res) => {
          expect(res.body.tournamentId).toBe(tournamentId);
          expect(res.body.userId).toBe(testUser.id);
        });
    });
  });

  describe('Notifications', () => {
    it('/notifications (GET)', () => {
      return request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.notifications).toBeDefined();
          expect(Array.isArray(res.body.notifications)).toBe(true);
        });
    });

    it('/notifications/unread-count (GET)', () => {
      return request(app.getHttpServer())
        .get('/notifications/unread-count')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.unreadCount).toBeDefined();
          expect(typeof res.body.unreadCount).toBe('number');
        });
    });
  });
});