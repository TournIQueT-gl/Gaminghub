import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.prisma.$connect();
      this.logger.log('Database connected successfully');
      
      // Test the connection
      await this.prisma.$queryRaw`SELECT 1`;
      this.logger.log('Database health check passed');
    } catch (error) {
      this.logger.error('Database connection failed:', error.message);
      // Don't throw error to allow app to start without database
      this.logger.warn('Application starting without database connection');
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}