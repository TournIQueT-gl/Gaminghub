import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealthStatus() {
    const startTime = Date.now();
    
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        message: 'All systems operational',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
          database: {
            status: 'healthy',
            responseTime: `${dbResponseTime}ms`,
          },
          api: {
            status: 'healthy',
            responseTime: `${Date.now() - startTime}ms`,
          },
        },
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
          database: {
            status: 'unhealthy',
            error: error.message,
          },
          api: {
            status: 'healthy',
            responseTime: `${Date.now() - startTime}ms`,
          },
        },
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
      };
    }
  }
}