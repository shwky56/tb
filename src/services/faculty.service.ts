import { FacultyRepository } from '../repositories/faculty.repository';
import { UniversityRepository } from '../repositories/university.repository';
import { Faculty } from '../models/faculty.model';

export class FacultyService {
  private facultyRepository: FacultyRepository;
  private universityRepository: UniversityRepository;

  constructor() {
    this.facultyRepository = new FacultyRepository();
    this.universityRepository = new UniversityRepository();
  }

  async createFaculty(facultyData: {
    name: string;
    universityId: string;
    dean?: string;
    establishedYear?: number;
    image?: string;
  }): Promise<Faculty> {
    // Verify university exists
    const university = await this.universityRepository.findById(facultyData.universityId);
    if (!university) {
      throw new Error('University not found');
    }

    const faculty = await this.facultyRepository.create({
      ...facultyData,
      isDeleted: false,
    });

    return faculty;
  }

  async getFacultyById(facultyId: string): Promise<Faculty> {
    const faculty = await this.facultyRepository.findById(facultyId);
    if (!faculty) {
      throw new Error('Faculty not found');
    }
    return faculty;
  }

  async updateFaculty(facultyId: string, updates: Partial<Faculty>): Promise<Faculty> {
    // If universityId is being updated, verify it exists
    if (updates.universityId) {
      const university = await this.universityRepository.findById(updates.universityId);
      if (!university) {
        throw new Error('University not found');
      }
    }

    const faculty = await this.facultyRepository.update(facultyId, updates);
    if (!faculty) {
      throw new Error('Faculty not found');
    }
    return faculty;
  }

  async deleteFaculty(facultyId: string): Promise<void> {
    const deleted = await this.facultyRepository.softDelete(facultyId);
    if (!deleted) {
      throw new Error('Faculty not found');
    }
  }

  async listFaculties(options?: {
    universityId?: string;
    name?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ faculties: Faculty[]; total: number }> {
    return await this.facultyRepository.findAll(options);
  }

  async getFacultiesByUniversity(universityId: string): Promise<Faculty[]> {
    return await this.facultyRepository.findByUniversityId(universityId);
  }
}
