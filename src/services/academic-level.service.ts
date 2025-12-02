import { AcademicLevelRepository } from '../repositories/academic-level.repository';
import { UniversityRepository } from '../repositories/university.repository';
import { FacultyRepository } from '../repositories/faculty.repository';
import { AcademicLevel } from '../models/academic-level.model';

export class AcademicLevelService {
  private academicLevelRepository: AcademicLevelRepository;
  private universityRepository: UniversityRepository;
  private facultyRepository: FacultyRepository;

  constructor() {
    this.academicLevelRepository = new AcademicLevelRepository();
    this.universityRepository = new UniversityRepository();
    this.facultyRepository = new FacultyRepository();
  }

  async createAcademicLevel(levelData: {
    name: string;
    order: number;
    universityId: string;
    facultyId: string;
    duration?: number;
    requiredCredits?: number;
    description?: string;
  }): Promise<AcademicLevel> {
    // Verify university exists
    const university = await this.universityRepository.findById(levelData.universityId);
    if (!university) {
      throw new Error('University not found');
    }

    // Verify faculty exists and belongs to the university
    const faculty = await this.facultyRepository.findById(levelData.facultyId);
    if (!faculty) {
      throw new Error('Faculty not found');
    }
    if (faculty.universityId !== levelData.universityId) {
      throw new Error('Faculty does not belong to the specified university');
    }

    const level = await this.academicLevelRepository.create({
      ...levelData,
      isDeleted: false,
    });

    return level;
  }

  async getAcademicLevelById(levelId: string): Promise<AcademicLevel> {
    const level = await this.academicLevelRepository.findById(levelId);
    if (!level) {
      throw new Error('Academic level not found');
    }
    return level;
  }

  async updateAcademicLevel(levelId: string, updates: Partial<AcademicLevel>): Promise<AcademicLevel> {
    // If universityId or facultyId is being updated, verify relationships
    if (updates.universityId || updates.facultyId) {
      const currentLevel = await this.academicLevelRepository.findById(levelId);
      if (!currentLevel) {
        throw new Error('Academic level not found');
      }

      const universityId = updates.universityId || currentLevel.universityId;
      const facultyId = updates.facultyId || currentLevel.facultyId;

      const university = await this.universityRepository.findById(universityId);
      if (!university) {
        throw new Error('University not found');
      }

      const faculty = await this.facultyRepository.findById(facultyId);
      if (!faculty) {
        throw new Error('Faculty not found');
      }

      if (faculty.universityId !== universityId) {
        throw new Error('Faculty does not belong to the specified university');
      }
    }

    const level = await this.academicLevelRepository.update(levelId, updates);
    if (!level) {
      throw new Error('Academic level not found');
    }
    return level;
  }

  async deleteAcademicLevel(levelId: string): Promise<void> {
    const deleted = await this.academicLevelRepository.softDelete(levelId);
    if (!deleted) {
      throw new Error('Academic level not found');
    }
  }

  async listAcademicLevels(options?: {
    universityId?: string;
    facultyId?: string;
    name?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ academicLevels: AcademicLevel[]; total: number }> {
    return await this.academicLevelRepository.findAll(options);
  }

  async getAcademicLevelsByFaculty(facultyId: string): Promise<AcademicLevel[]> {
    return await this.academicLevelRepository.findByFacultyId(facultyId);
  }

  async getAcademicLevelsByUniversity(universityId: string): Promise<AcademicLevel[]> {
    return await this.academicLevelRepository.findByUniversityId(universityId);
  }
}
