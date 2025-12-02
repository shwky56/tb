import { UniversityRepository } from '../repositories/university.repository';
import { University } from '../models/university.model';

export class UniversityService {
  private universityRepository: UniversityRepository;

  constructor() {
    this.universityRepository = new UniversityRepository();
  }

  async createUniversity(universityData: {
    name: string;
    location?: string;
    establishedYear?: number;
    description?: string;
    image?: string;
  }): Promise<University> {
    // Check if university with same name exists
    const existing = await this.universityRepository.findByName(universityData.name);
    if (existing) {
      throw new Error('University with this name already exists');
    }

    const university = await this.universityRepository.create({
      ...universityData,
      isDeleted: false,
    });

    return university;
  }

  async getUniversityById(universityId: string): Promise<University> {
    const university = await this.universityRepository.findById(universityId);
    if (!university) {
      throw new Error('University not found');
    }
    return university;
  }

  async updateUniversity(universityId: string, updates: Partial<University>): Promise<University> {
    // If name is being updated, check for duplicates
    if (updates.name) {
      const existing = await this.universityRepository.findByName(updates.name);
      if (existing && existing.id !== universityId) {
        throw new Error('University with this name already exists');
      }
    }

    const university = await this.universityRepository.update(universityId, updates);
    if (!university) {
      throw new Error('University not found');
    }
    return university;
  }

  async deleteUniversity(universityId: string): Promise<void> {
    const deleted = await this.universityRepository.softDelete(universityId);
    if (!deleted) {
      throw new Error('University not found');
    }
  }

  async listUniversities(options?: {
    name?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ universities: University[]; total: number }> {
    return await this.universityRepository.findAll(options);
  }
}
