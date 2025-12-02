import { Repository } from 'typeorm';
import AppDataSource from '../config/database.config';
import { Faculty } from '../models/faculty.model';

export class FacultyRepository {
  private repository: Repository<Faculty>;

  constructor() {
    this.repository = AppDataSource.getRepository(Faculty);
  }

  async findById(id: string): Promise<Faculty | null> {
    return await this.repository.findOne({
      where: { id, isDeleted: false },
      relations: ['university', 'academicLevels'],
    });
  }

  async create(facultyData: Partial<Faculty>): Promise<Faculty> {
    const faculty = this.repository.create(facultyData);
    return await this.repository.save(faculty);
  }

  async update(id: string, facultyData: Partial<Faculty>): Promise<Faculty | null> {
    await this.repository.update(id, facultyData);
    return await this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { isDeleted: true });
    return result.affected !== 0;
  }

  async findAll(options?: {
    universityId?: string;
    name?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ faculties: Faculty[]; total: number }> {
    const queryBuilder = this.repository
      .createQueryBuilder('faculty')
      .leftJoinAndSelect('faculty.university', 'university')
      .leftJoinAndSelect('faculty.academicLevels', 'academicLevels')
      .where('faculty.isDeleted = :isDeleted', { isDeleted: false });

    if (options?.universityId) {
      queryBuilder.andWhere('faculty.universityId = :universityId', { 
        universityId: options.universityId 
      });
    }

    if (options?.name) {
      queryBuilder.andWhere('faculty.name LIKE :name', { name: `%${options.name}%` });
    }

    const total = await queryBuilder.getCount();

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    const faculties = await queryBuilder.getMany();

    return { faculties, total };
  }

  async findByUniversityId(universityId: string): Promise<Faculty[]> {
    return await this.repository.find({
      where: { universityId, isDeleted: false },
      relations: ['academicLevels'],
    });
  }
}
