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
import { Course } from './course.model';
import { Lesson } from './lesson.model';

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 500 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'integer', default: 0 })
  orderIndex!: number;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;

  @Index('idx_module_course')
  @ManyToOne(() => Course, (course) => course.modules, { nullable: false })
  @JoinColumn({ name: 'courseId' })
  course!: Course;

  @Column({ type: 'uuid' })
  courseId!: string;

  @OneToMany(() => Lesson, (lesson) => lesson.module)
  lessons?: Lesson[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
