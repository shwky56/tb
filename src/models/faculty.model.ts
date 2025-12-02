import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { University } from './university.model';
import { AcademicLevel } from './academic-level.model';

@Entity('faculties')
export class Faculty {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  dean?: string;

  @Column({ type: 'integer', nullable: true })
  establishedYear?: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  image?: string;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;

  /**
   * University relationship
   */
  @Index('idx_faculty_university')
  @ManyToOne(() => University, (university) => university.faculties, { nullable: false })
  @JoinColumn({ name: 'universityId' })
  university!: University;

  @Column({ type: 'uuid' })
  universityId!: string;

  /**
   * Academic Levels relationship
   */
  @OneToMany(() => AcademicLevel, (level) => level.faculty)
  academicLevels?: AcademicLevel[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
