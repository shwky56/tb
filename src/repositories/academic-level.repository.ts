import { Repository } from 'typeorm';
import AppDataSource from '../config/database.config';
import { AcademicLevel } from '../models/academic-level.model';

export class AcademicLevelRepository {
  private repository: Repository<AcademicLevel>;

  constructor() {
    this.repository = AppDataSource.getRepository(AcademicLevel);
  }

  async findById(id: string): Promise<AcademicLevel | null> {
    return await this.repository.findOne({
      where: { id, isDeleted: false },
      relations: ['university', 'faculty'],
    });
  }

  async create(levelData: Partial<AcademicLevel>): Promise<AcademicLevel> {
    const level = this.repository.create(levelData);
    return await this.repository.save(level);
  }

  async update(id: string, levelData: Partial<AcademicLevel>): Promise<AcademicLevel | null> {
    await this.repository.update(id, levelData);
    return await this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { isDeleted: true });
    return result.affected !== 0;
  }

  async findAll(options?: {
    universityId?: string;
    facultyId?: string;
    name?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ academicLevels: AcademicLevel[]; total: number }> {
    const queryBuilder = this.repository
      .createQueryBuilder('level')
      .leftJoinAndSelect('level.university', 'university')
      .leftJoinAndSelect('level.faculty', 'faculty')
      .where('level.isDeleted = :isDeleted', { isDeleted: false });

    if (options?.universityId) {
      queryBuilder.andWhere('level.universityId = :universityId', { 
        universityId: options.universityId 
      });
    }

    if (options?.facultyId) {
      queryBuilder.andWhere('level.facultyId = :facultyId', { 
        facultyId: options.facultyId 
      });
    }

    if (options?.name) {
      queryBuilder.andWhere('level.name LIKE :name', { name: `%${options.name}%` });
    }

    queryBuilder.orderBy('level.order', 'ASC');

    const total = await queryBuilder.getCount();

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    const academicLevels = await queryBuilder.getMany();

    return { academicLevels, total };
  }

  async findByFacultyId(facultyId: string): Promise<AcademicLevel[]> {
    return await this.repository.find({
      where: { facultyId, isDeleted: false },
      relations: ['university', 'faculty'],
      order: { order: 'ASC' },
    });
  }

  async findByUniversityId(universityId: string): Promise<AcademicLevel[]> {
    return await this.repository.find({
      where: { universityId, isDeleted: false },
      relations: ['faculty'],
      order: { order: 'ASC' },
    });
  }
}
