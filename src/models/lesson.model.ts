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
import { Module } from './module.model';

export type LessonType = 'Video' | 'Text' | 'Quiz' | 'Assignment' | 'Document';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 500 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({
    type: 'enum',
    enum: ['Video', 'Text', 'Quiz', 'Assignment', 'Document'],
    default: 'Text',
  })
  type!: LessonType;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  resourceUrl?: string;

  @Column({ type: 'integer', default: 0 })
  duration!: number; // Duration in minutes

  @Column({ type: 'integer', default: 0 })
  orderIndex!: number;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;

  @Index('idx_lesson_module')
  @ManyToOne(() => Module, (module) => module.lessons, { nullable: false })
  @JoinColumn({ name: 'moduleId' })
  module!: Module;

  @Column({ type: 'uuid' })
  moduleId!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
