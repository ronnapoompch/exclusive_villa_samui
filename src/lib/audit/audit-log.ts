import prisma from '@/lib/db/prisma'
import type { EntityType } from '@prisma/client'

/**
 * Audit logging service following security-rules.md A09:2021 monitoring patterns
 * Implements comprehensive logging for security events
 */

export interface AuditLogData {
  action: string
  entityType: EntityType
  entityId: string
  userId?: string
  ipAddress: string
  userAgent?: string
  metadata?: Record<string, any>
}

/**
 * Create audit log entry
 */
export async function auditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        userId: data.userId || null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent || null,
        metadata: data.metadata as any || undefined
      }
    })
  } catch (error) {
    console.error('Audit log creation failed:', error)
    // Don't throw - audit logging should not break the main flow
  }
}

/**
 * Log authentication events
 */
export async function auditAuth(
  action: 'login.success' | 'login.failed' | 'login.locked' | 'logout' | 'register',
  userId?: string,
  email?: string,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await auditLog({
    action,
    entityType: 'USER',
    entityId: userId || 'anonymous',
    userId,
    ipAddress: ipAddress || 'unknown',
    userAgent,
    metadata: {
      email,
      ...metadata
    }
  })
}

/**
 * Log data access events
 */
export async function auditDataAccess(
  action: string,
  entityType: EntityType,
  entityId: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await auditLog({
    action,
    entityType,
    entityId,
    userId,
    ipAddress: ipAddress || 'unknown',
    userAgent
  })
}

/**
 * Query audit logs with filters
 */
export async function getAuditLogs(filters: {
  userId?: string
  action?: string
  entityType?: EntityType
  startDate?: Date
  endDate?: Date
  limit?: number
}) {
  return await prisma.auditLog.findMany({
    where: {
      userId: filters.userId,
      action: filters.action ? { contains: filters.action } : undefined,
      entityType: filters.entityType,
      createdAt: {
        gte: filters.startDate,
        lte: filters.endDate
      }
    },
    orderBy: { createdAt: 'desc' },
    take: filters.limit || 100,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  })
}