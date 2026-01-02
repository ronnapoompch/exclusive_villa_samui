/**
 * Health Check API Endpoint
 * Phase 1.11 - System Monitoring
 * 
 * Returns comprehensive system health status
 * Used by: Uptime monitors, load balancers, deployment pipelines
 */

import { NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      message: string;
      latency?: number;
    };
    data?: {
      villas: number;
      images: number;
    };
    memory?: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

export async function GET() {
  const startTime = Date.now();

  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: {
        status: 'ok',
        message: 'Connected'
      }
    }
  };

  // Check database connectivity and data
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    // Count data
    const villaCount = await prisma.villa.count();
    const imageCount = await prisma.villaImage.count();

    health.checks.database = {
      status: 'ok',
      message: 'Connected',
      latency: dbLatency
    };

    health.checks.data = {
      villas: villaCount,
      images: imageCount
    };

    // Warn if database is slow
    if (dbLatency > 1000) {
      health.status = 'degraded';
      health.checks.database.message = `Slow response: ${dbLatency}ms`;
    }
  } catch (error) {
    health.status = 'unhealthy';
    health.checks.database = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Database connection failed'
    };
  }

  // Memory usage
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;
    const percentage = (usedMem / totalMem) * 100;

    health.checks.memory = {
      used: Math.round(usedMem / 1024 / 1024), // MB
      total: Math.round(totalMem / 1024 / 1024), // MB
      percentage: Math.round(percentage)
    };

    // Warn if memory usage is high
    if (percentage > 90) {
      health.status = 'degraded';
    }
  }

  // Response time
  const responseTime = Date.now() - startTime;

  // Determine HTTP status code
  const statusCode = health.status === 'healthy' ? 200 : 
                     health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(
    health,
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${responseTime}ms`
      }
    }
  );
}
