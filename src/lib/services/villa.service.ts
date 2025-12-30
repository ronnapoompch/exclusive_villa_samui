// Villa Service - Business Logic Layer
import { Villa } from '@prisma/client';
import { VillaRepository, VillaSearchFilters } from '@/lib/repositories/villa.repository';

export interface VillaSearchResult {
  villas: Villa[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export class VillaService {
  constructor(private repository: VillaRepository) {}

  async searchVillas(
    filters: VillaSearchFilters,
    limit: number = 1000,
    offset: number = 0
  ): Promise<VillaSearchResult> {
    const [villas, total] = await Promise.all([
      this.repository.findAll(filters),
      this.repository.count(filters),
    ]);

    // Apply pagination
    const paginatedVillas = villas.slice(offset, offset + limit);

    return {
      villas: paginatedVillas,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  async getVillaById(id: string): Promise<Villa | null> {
    return this.repository.findById(id);
  }

  async getVillaBySlug(slug: string): Promise<Villa | null> {
    return this.repository.findBySlug(slug);
  }
}
