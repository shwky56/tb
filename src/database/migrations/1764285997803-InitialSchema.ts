import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1764285997803 implements MigrationInterface {
    name = 'InitialSchema1764285997803'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."lessons_type_enum" AS ENUM('Video', 'Text', 'Quiz', 'Assignment', 'Document')`);
        await queryRunner.query(`CREATE TABLE "lessons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(500) NOT NULL, "content" text, "type" "public"."lessons_type_enum" NOT NULL DEFAULT 'Text', "resourceUrl" character varying(1000), "duration" integer NOT NULL DEFAULT '0', "orderIndex" integer NOT NULL DEFAULT '0', "isDeleted" boolean NOT NULL DEFAULT false, "moduleId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9b9a8d455cac672d262d7275730" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_lesson_module" ON "lessons" ("moduleId") `);
        await queryRunner.query(`CREATE TABLE "modules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(500) NOT NULL, "description" text, "orderIndex" integer NOT NULL DEFAULT '0', "isDeleted" boolean NOT NULL DEFAULT false, "courseId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7dbefd488bd96c5bf31f0ce0c95" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_module_course" ON "modules" ("courseId") `);
        await queryRunner.query(`CREATE TYPE "public"."courses_status_enum" AS ENUM('Draft', 'Published', 'Archived')`);
        await queryRunner.query(`CREATE TYPE "public"."courses_level_enum" AS ENUM('Beginner', 'Intermediate', 'Advanced')`);
        await queryRunner.query(`CREATE TABLE "courses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(500) NOT NULL, "description" text, "courseCode" character varying(50), "status" "public"."courses_status_enum" NOT NULL DEFAULT 'Draft', "level" "public"."courses_level_enum" NOT NULL DEFAULT 'Beginner', "category" character varying(255), "thumbnail" character varying(1000), "duration" integer NOT NULL DEFAULT '0', "maxStudents" integer NOT NULL DEFAULT '0', "price" numeric(10,2) NOT NULL DEFAULT '0', "university" character varying(255), "isDeleted" boolean NOT NULL DEFAULT false, "instructorId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_course_instructor" ON "courses" ("instructorId") `);
        await queryRunner.query(`CREATE TYPE "public"."enrollments_status_enum" AS ENUM('Pending', 'Active', 'Completed', 'Dropped', 'Suspended')`);
        await queryRunner.query(`CREATE TABLE "enrollments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "courseId" uuid NOT NULL, "status" "public"."enrollments_status_enum" NOT NULL DEFAULT 'Pending', "enrolledAt" TIMESTAMP, "completedAt" TIMESTAMP, "progress" integer NOT NULL DEFAULT '0', "grade" numeric(5,2), "isDeleted" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a6f2eeafcbf0dd7a69fc91e2957" UNIQUE ("userId", "courseId"), CONSTRAINT "PK_7c0f752f9fb68bf6ed7367ab00f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_enrollment_user" ON "enrollments" ("userId") `);
        await queryRunner.query(`CREATE INDEX "idx_enrollment_course" ON "enrollments" ("courseId") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('Super-admin', 'University-admin', 'Instructor', 'Student')`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('Active', 'Pending', 'Banned')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'Student', "university" character varying(255), "status" "public"."users_status_enum" NOT NULL DEFAULT 'Pending', "isDeleted" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "currentSessionId" character varying(500), "sessionLastActivity" TIMESTAMP, "deviceInfo" character varying(500), "lastLoginIp" character varying(50), "emailVerificationToken" character varying(500), "passwordResetToken" character varying(500), "passwordResetExpires" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_user_email" ON "users" ("email") `);
        await queryRunner.query(`CREATE INDEX "idx_user_session" ON "users" ("currentSessionId") `);
        await queryRunner.query(`ALTER TABLE "lessons" ADD CONSTRAINT "FK_16e7969589c0b789d9868782259" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "modules" ADD CONSTRAINT "FK_83489b37212a5a547bde8f89014" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_e6714597bea722629fa7d32124a" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_de33d443c8ae36800c37c58c929" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_60dd0ae4e21002e63a5fdefeec8" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_60dd0ae4e21002e63a5fdefeec8"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_de33d443c8ae36800c37c58c929"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_e6714597bea722629fa7d32124a"`);
        await queryRunner.query(`ALTER TABLE "modules" DROP CONSTRAINT "FK_83489b37212a5a547bde8f89014"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_16e7969589c0b789d9868782259"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_session"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_email"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_enrollment_course"`);
        await queryRunner.query(`DROP INDEX "public"."idx_enrollment_user"`);
        await queryRunner.query(`DROP TABLE "enrollments"`);
        await queryRunner.query(`DROP TYPE "public"."enrollments_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_course_instructor"`);
        await queryRunner.query(`DROP TABLE "courses"`);
        await queryRunner.query(`DROP TYPE "public"."courses_level_enum"`);
        await queryRunner.query(`DROP TYPE "public"."courses_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_module_course"`);
        await queryRunner.query(`DROP TABLE "modules"`);
        await queryRunner.query(`DROP INDEX "public"."idx_lesson_module"`);
        await queryRunner.query(`DROP TABLE "lessons"`);
        await queryRunner.query(`DROP TYPE "public"."lessons_type_enum"`);
    }

}
