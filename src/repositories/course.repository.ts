import { Repository } from 'typeorm';
import AppDataSource from '../config/database.config';
import { Course, CourseStatus } from '../models/course.model';

export class CourseRepository {
  private repository: Repository<Course>;

  constructor() {
    this.repository = AppDataSource.getRepository(Course);
  }

  async findById(id: string): Promise<Course | null> {
    return await this.repository.findOne({
      where: { id, isDeleted: false },
      relations: ['instructor', 'modules'],
    });
  }

  async create(courseData: Partial<Course>): Promise<Course> {
    const course = this.repository.create(courseData);
    return await this.repository.save(course);
  }

  async update(id: string, courseData: Partial<Course>): Promise<Course | null> {
    await this.repository.update(id, courseData);
    return await this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { isDeleted: true });
    return result.affected !== 0;
  }

  async findAll(options?: {
    status?: CourseStatus;
    instructorId?: string;
    university?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ courses: Course[]; total: number }> {
    const queryBuilder = this.repository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .where('course.isDeleted = :isDeleted', { isDeleted: false });

    if (options?.status) {
      queryBuilder.andWhere('course.status = :status', { status: options.status });
    }

    if (options?.instructorId) {
      queryBuilder.andWhere('course.instructorId = :instructorId', {
        instructorId: options.instructorId,
      });
    }

    if (options?.university) {
      queryBuilder.andWhere('course.university = :university', { university: options.university });
    }

    if (options?.category) {
      queryBuilder.andWhere('course.category = :category', { category: options.category });
    }

    const total = await queryBuilder.getCount();

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    const courses = await queryBuilder.getMany();

    return { courses, total };
  }

  async updateStatus(courseId: string, status: CourseStatus): Promise<Course | null> {
    await this.repository.update(courseId, { status });
    return await this.findById(courseId);
  }
}
