// Villa Repository - Data Access Layer
import { PrismaClient, Villa, Prisma } from '@prisma/client';

export interface IVillaRepository {
  findAll(filters?: VillaSearchFilters): Promise<Villa[]>;
  findById(id: string): Promise<Villa | null>;
  findBySlug(slug: string): Promise<Villa | null>;
  count(filters?: VillaSearchFilters): Promise<number>;
}

export interface VillaSearchFilters {
  location?: string;
  bedrooms?: number;
  guests?: number;
  beachfront?: boolean;
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export class VillaRepository implements IVillaRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters?: VillaSearchFilters): Promise<Villa[]> {
    const where: Prisma.VillaWhereInput = this.buildWhereClause(filters);

    return this.prisma.villa.findMany({
      where,
      include: {
        villaImages: true,
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findById(id: string): Promise<Villa | null> {
    return this.prisma.villa.findUnique({
      where: { id },
      include: {
        villaImages: true,
      },
    });
  }

  async findBySlug(slug: string): Promise<Villa | null> {
    return this.prisma.villa.findUnique({
      where: { slug },
      include: {
        villaImages: true,
      },
    });
  }

  async count(filters?: VillaSearchFilters): Promise<number> {
    const where = this.buildWhereClause(filters);
    return this.prisma.villa.count({ where });
  }

  private buildWhereClause(filters?: VillaSearchFilters): Prisma.VillaWhereInput {
    if (!filters) return {};

    const where: Prisma.VillaWhereInput = {};

    if (filters.location && filters.location !== 'All Locations') {
      where.location = {
        contains: filters.location,
        mode: 'insensitive',
      };
    }

    if (filters.bedrooms && filters.bedrooms > 0) {
      where.bedrooms = { gte: filters.bedrooms };
    }

    if (filters.guests && filters.guests > 0) {
      where.maxGuests = { gte: filters.guests };
    }

    if (filters.beachfront !== undefined) {
      where.beachfront = filters.beachfront;
    }

    if (filters.featured !== undefined) {
      where.featured = filters.featured;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
