import { Repository } from 'typeorm';
import AppDataSource from '../config/database.config';
import { University } from '../models/university.model';

export class UniversityRepository {
  private repository: Repository<University>;

  constructor() {
    this.repository = AppDataSource.getRepository(University);
  }

  async findById(id: string): Promise<University | null> {
    return await this.repository.findOne({
      where: { id, isDeleted: false },
      relations: ['faculties', 'academicLevels'],
    });
  }

  async create(universityData: Partial<University>): Promise<University> {
    const university = this.repository.create(universityData);
    return await this.repository.save(university);
  }

  async update(id: string, universityData: Partial<University>): Promise<University | null> {
    await this.repository.update(id, universityData);
    return await this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { isDeleted: true });
    return result.affected !== 0;
  }

  async findAll(options?: {
    name?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ universities: University[]; total: number }> {
    const queryBuilder = this.repository
      .createQueryBuilder('university')
      .where('university.isDeleted = :isDeleted', { isDeleted: false });

    if (options?.name) {
      queryBuilder.andWhere('university.name LIKE :name', { name: `%${options.name}%` });
    }

    if (options?.location) {
      queryBuilder.andWhere('university.location LIKE :location', { 
        location: `%${options.location}%` 
      });
    }

    const total = await queryBuilder.getCount();

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    const universities = await queryBuilder.getMany();

    return { universities, total };
  }

  async findByName(name: string): Promise<University | null> {
    return await this.repository.findOne({
      where: { name, isDeleted: false },
    });
  }
}
