import { CourseRepository } from '../repositories/course.repository';
import { Course, CourseStatus } from '../models/course.model';

export class CourseService {
  private courseRepository: CourseRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
  }

  async createCourse(courseData: {
    title: string;
    description?: string;
    courseCode?: string;
    level?: string;
    category?: string;
    duration?: number;
    maxStudents?: number;
    price?: number;
    university?: string;
    instructorId: string;
  }): Promise<Course> {
    const course = await this.courseRepository.create({
      ...courseData,
      status: 'Draft',
      isDeleted: false,
    } as any);

    return course;
  }

  async getCourseById(courseId: string): Promise<Course> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  }

  async updateCourse(courseId: string, updates: Partial<Course>): Promise<Course> {
    const course = await this.courseRepository.update(courseId, updates);
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  }

  async deleteCourse(courseId: string): Promise<void> {
    const deleted = await this.courseRepository.softDelete(courseId);
    if (!deleted) {
      throw new Error('Course not found');
    }
  }

  async listCourses(options?: {
    status?: CourseStatus;
    instructorId?: string;
    university?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ courses: Course[]; total: number }> {
    return await this.courseRepository.findAll(options);
  }

  async publishCourse(courseId: string): Promise<Course> {
    const course = await this.courseRepository.updateStatus(courseId, 'Published');
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  }

  async archiveCourse(courseId: string): Promise<Course> {
    const course = await this.courseRepository.updateStatus(courseId, 'Archived');
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  }
}
