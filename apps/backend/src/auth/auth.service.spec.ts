import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let usersService: UsersService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUsersService = {};

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: hashedPassword,
        username: 'testuser',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      });
      expect(result.password).toBeUndefined();
    });

    it('should return null when credentials are invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('should create a new user and return tokens', async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        ...registerDto,
        password: 'hashedpassword',
      });
      mockPrismaService.user.update.mockResolvedValue({});
      mockJwtService.sign.mockReturnValue('mock-token');
      mockConfigService.get.mockReturnValue('mock-secret');

      const result = await service.register(registerDto);

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe('test@example.com');
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@example.com',
          username: 'testuser',
        }),
      });
    });

    it('should throw UnauthorizedException when user already exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
      };

      mockPrismaService.user.findFirst.mockResolvedValue({ id: '1' });

      await expect(service.register(registerDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return tokens when credentials are valid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash('password123', 12);
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: hashedPassword,
        username: 'testuser',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});
      mockJwtService.sign.mockReturnValue('mock-token');
      mockConfigService.get.mockReturnValue('mock-secret');

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateJwtPayload', () => {
    it('should return user when payload is valid', async () => {
      const payload = {
        sub: '1',
        email: 'test@example.com',
        username: 'testuser',
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        isActive: true,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateJwtPayload(payload);

      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const payload = {
        sub: '1',
        email: 'test@example.com',
        username: 'testuser',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.validateJwtPayload(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const payload = {
        sub: '1',
        email: 'test@example.com',
        username: 'testuser',
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        isActive: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.validateJwtPayload(payload)).rejects.toThrow(UnauthorizedException);
    });
  });
});