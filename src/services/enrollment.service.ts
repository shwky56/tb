import { EnrollmentRepository } from '../repositories/enrollment.repository';
import { CourseRepository } from '../repositories/course.repository';
import { Enrollment, EnrollmentStatus } from '../models/enrollment.model';

export class EnrollmentService {
  private enrollmentRepository: EnrollmentRepository;
  private courseRepository: CourseRepository;

  constructor() {
    this.enrollmentRepository = new EnrollmentRepository();
    this.courseRepository = new CourseRepository();
  }

  async enrollStudent(userId: string, courseId: string): Promise<Enrollment> {
    // Check if course exists and is published
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    if (course.status !== 'Published') {
      throw new Error('Course is not available for enrollment');
    }

    // Check if already enrolled
    const existingEnrollment = await this.enrollmentRepository.findByUserAndCourse(
      userId,
      courseId
    );
    if (existingEnrollment) {
      throw new Error('Already enrolled in this course');
    }

    // Create enrollment
    const enrollment = await this.enrollmentRepository.create({
      userId,
      courseId,
      status: 'Active',
      enrolledAt: new Date(),
      progress: 0,
      isDeleted: false,
    });

    return enrollment;
  }

  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    return await this.enrollmentRepository.findByUser(userId);
  }

  async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    return await this.enrollmentRepository.findByCourse(courseId);
  }

  async updateEnrollmentStatus(
    enrollmentId: string,
    status: EnrollmentStatus
  ): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.updateStatus(enrollmentId, status);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // If completed, set completion date
    if (status === 'Completed') {
      await this.enrollmentRepository.update(enrollmentId, {
        completedAt: new Date(),
        progress: 100,
      });
    }

    return enrollment;
  }

  async updateProgress(enrollmentId: string, progress: number): Promise<Enrollment> {
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }

    const enrollment = await this.enrollmentRepository.updateProgress(enrollmentId, progress);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Auto-complete if progress reaches 100%
    if (progress === 100 && enrollment.status !== 'Completed') {
      await this.updateEnrollmentStatus(enrollmentId, 'Completed');
    }

    return enrollment;
  }
}
