import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { University } from './university.model';
import { Faculty } from './faculty.model';

@Entity('academic_levels')
export class AcademicLevel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'integer' })
  order!: number;

  @Column({ type: 'integer', nullable: true })
  duration?: number; // Duration in years or semesters

  @Column({ type: 'integer', nullable: true })
  requiredCredits?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;

  /**
   * University relationship
   */
  @Index('idx_academic_level_university')
  @ManyToOne(() => University, (university) => university.academicLevels, { nullable: false })
  @JoinColumn({ name: 'universityId' })
  university!: University;

  @Column({ type: 'uuid' })
  universityId!: string;

  /**
   * Faculty relationship
   */
  @Index('idx_academic_level_faculty')
  @ManyToOne(() => Faculty, (faculty) => faculty.academicLevels, { nullable: false })
  @JoinColumn({ name: 'facultyId' })
  faculty!: Faculty;

  @Column({ type: 'uuid' })
  facultyId!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
