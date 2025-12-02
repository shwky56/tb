import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Faculty } from './faculty.model';
import { AcademicLevel } from './academic-level.model';

@Entity('universities')
export class University {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location?: string;

  @Column({ type: 'integer', nullable: true })
  establishedYear?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  image?: string;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;

  /**
   * Relationships
   */
  @OneToMany(() => Faculty, (faculty) => faculty.university)
  faculties?: Faculty[];

  @OneToMany(() => AcademicLevel, (level) => level.university)
  academicLevels?: AcademicLevel[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
