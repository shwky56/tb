import { Repository } from 'typeorm';
import AppDataSource from '../config/database.config';
import { Enrollment, EnrollmentStatus } from '../models/enrollment.model';

export class EnrollmentRepository {
  private repository: Repository<Enrollment>;

  constructor() {
    this.repository = AppDataSource.getRepository(Enrollment);
  }

  async findById(id: string): Promise<Enrollment | null> {
    return await this.repository.findOne({
      where: { id, isDeleted: false },
      relations: ['user', 'course'],
    });
  }

  async create(enrollmentData: Partial<Enrollment>): Promise<Enrollment> {
    const enrollment = this.repository.create(enrollmentData);
    return await this.repository.save(enrollment);
  }

  async update(id: string, enrollmentData: Partial<Enrollment>): Promise<Enrollment | null> {
    await this.repository.update(id, enrollmentData);
    return await this.findById(id);
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null> {
    return await this.repository.findOne({
      where: { userId, courseId, isDeleted: false },
      relations: ['course'],
    });
  }

  async findByUser(userId: string): Promise<Enrollment[]> {
    return await this.repository.find({
      where: { userId, isDeleted: false },
      relations: ['course', 'course.instructor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCourse(courseId: string): Promise<Enrollment[]> {
    return await this.repository.find({
      where: { courseId, isDeleted: false },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(enrollmentId: string, status: EnrollmentStatus): Promise<Enrollment | null> {
    await this.repository.update(enrollmentId, { status });
    return await this.findById(enrollmentId);
  }

  async updateProgress(enrollmentId: string, progress: number): Promise<Enrollment | null> {
    await this.repository.update(enrollmentId, { progress });
    return await this.findById(enrollmentId);
  }
}
