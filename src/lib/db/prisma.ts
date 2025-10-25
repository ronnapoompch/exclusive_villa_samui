import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: 'minimal',
  })
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma

/**
 * Lightweight generic delegate interface (minimal surface used by helpers)
 * เราไม่ผูกกับ Prisma internal types โดยตรงเพื่อลด coupling และให้ทดสอบง่าย
 * (อ้างอิง: docs/coding-standards.md - หลีกเลี่ยง tight coupling / ใช้ abstraction ที่จำเป็นเท่านั้น)
 */
interface PrismaModel<T = unknown, W = unknown, Incl = unknown, Ord = unknown, Upd = unknown> {
  update: (args: { where: W; data: Upd }) => Promise<T>
  count: (args: { where?: W }) => Promise<number>
  findMany: (args: {
    where?: W
    include?: Incl
    orderBy?: Ord
    skip?: number
    take?: number
    select?: unknown // เผื่อรองรับอนาคต (ไม่ enforce พร้อม include)
  }) => Promise<T[]>
}

// Utility functions for common database operations
/**
 * Execute a transaction (callback style) with automatic rollback on throw
 * NOTE: ใช้รูปแบบตรงจาก Prisma 5 callback API เพื่อความเข้ากันได้ในอนาคต
 */
export async function executeTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  // แม้ Prisma จำกัด surface ภายใน callback เราให้ type เป็น PrismaClient เต็มเพื่อ DX
  return prisma.$transaction(async (tx) => fn(tx as unknown as PrismaClient))
}

// Soft delete helper
/**
 * Soft delete helper – สมมติว่าโมเดลมี field deletedAt: Date | null
 * ควรแน่ใจว่า schema มีฟิลด์นี้ก่อนเรียกใช้ (Fail early responsibility อยู่ที่ caller)
 */
export async function softDelete<T, W, U extends Record<string, unknown>, M extends PrismaModel<T, W, any, any, U>>(
  model: M,
  where: W,
  deletedField?: keyof U
): Promise<T> {
  const field = (deletedField ?? ('deletedAt' as keyof U))
  return model.update({
    where,
    data: {
      [field]: new Date()
    } as unknown as U
  })
}

// Check if record exists
/**
 * ตรวจสอบการมีอยู่ของเรคคอร์ดอย่างประหยัด (COUNT 1 strategy)
 */
export async function exists<T, W, M extends PrismaModel<T, W>>(
  model: M,
  where: W
): Promise<boolean> {
  const count = await model.count({ where })
  return count > 0
}

// Pagination helper
export interface PaginationParams {
  page?: number
  limit?: number
  orderBy?: Record<string, 'asc' | 'desc'>
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface PaginateOptions<W = unknown, Incl = unknown, Ord = unknown> {
  where?: W
  include?: Incl
  orderBy?: Ord
  select?: unknown
}

/**
 * Generic pagination utility (ป้องกัน over-fetch + ควบคุม boundary)
 * - บังคับ limit สูงสุด (DEFAULT_MAX_LIMIT) เพื่อลด memory pressure / DOS vector
 * - ปรับ page < 1 ให้เป็น 1 ตามหลัก defensive programming
 */
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const DEFAULT_MAX_LIMIT = 100

export async function paginate<T, W, Incl, Ord>(
  model: PrismaModel<T, W, Incl, Ord>,
  params: PaginationParams & PaginateOptions<W, Incl, Ord>
): Promise<PaginatedResult<T>> {
  const rawPage = params.page ?? DEFAULT_PAGE
  const rawLimit = params.limit ?? DEFAULT_LIMIT
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : DEFAULT_PAGE
  const limitBase = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.floor(rawLimit) : DEFAULT_LIMIT
  const limit = Math.min(limitBase, DEFAULT_MAX_LIMIT)
  const skip = (page - 1) * limit

  const [data, total] = await Promise.all([
    model.findMany({
      where: params.where,
      include: params.include,
      orderBy: params.orderBy,
      skip,
      take: limit,
      // select (ถ้ามี) จะถูกละเว้นถ้าคู่ include/select ไม่รองรับใน delegate – ผู้ใช้ต้องดูแลเอง
      select: params.select
    }),
    model.count({ where: params.where })
  ])

  const totalPages = total === 0 ? 1 : Math.ceil(total / limit)

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }
}