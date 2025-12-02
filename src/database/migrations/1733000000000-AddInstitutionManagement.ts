import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInstitutionManagement1733000000000 implements MigrationInterface {
    name = 'AddInstitutionManagement1733000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create universities table
        await queryRunner.query(`
            CREATE TABLE "universities" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "location" character varying(500),
                "establishedYear" integer,
                "description" text,
                "image" character varying(1000),
                "isDeleted" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_universities" PRIMARY KEY ("id")
            )
        `);

        // Create faculties table
        await queryRunner.query(`
            CREATE TABLE "faculties" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "dean" character varying(255),
                "establishedYear" integer,
                "image" character varying(1000),
                "isDeleted" boolean NOT NULL DEFAULT false,
                "universityId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_faculties" PRIMARY KEY ("id")
            )
        `);

        // Create index on faculty universityId
        await queryRunner.query(`
            CREATE INDEX "idx_faculty_university" ON "faculties" ("universityId")
        `);

        // Create academic_levels table
        await queryRunner.query(`
            CREATE TABLE "academic_levels" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "order" integer NOT NULL,
                "duration" integer,
                "requiredCredits" integer,
                "description" text,
                "isDeleted" boolean NOT NULL DEFAULT false,
                "universityId" uuid NOT NULL,
                "facultyId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_academic_levels" PRIMARY KEY ("id")
            )
        `);

        // Create indexes on academic_levels
        await queryRunner.query(`
            CREATE INDEX "idx_academic_level_university" ON "academic_levels" ("universityId")
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_academic_level_faculty" ON "academic_levels" ("facultyId")
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "faculties" 
            ADD CONSTRAINT "FK_faculties_university" 
            FOREIGN KEY ("universityId") 
            REFERENCES "universities"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "academic_levels" 
            ADD CONSTRAINT "FK_academic_levels_university" 
            FOREIGN KEY ("universityId") 
            REFERENCES "universities"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "academic_levels" 
            ADD CONSTRAINT "FK_academic_levels_faculty" 
            FOREIGN KEY ("facultyId") 
            REFERENCES "faculties"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "academic_levels" DROP CONSTRAINT "FK_academic_levels_faculty"
        `);

        await queryRunner.query(`
            ALTER TABLE "academic_levels" DROP CONSTRAINT "FK_academic_levels_university"
        `);

        await queryRunner.query(`
            ALTER TABLE "faculties" DROP CONSTRAINT "FK_faculties_university"
        `);

        // Drop indexes
        await queryRunner.query(`
            DROP INDEX "public"."idx_academic_level_faculty"
        `);

        await queryRunner.query(`
            DROP INDEX "public"."idx_academic_level_university"
        `);

        await queryRunner.query(`
            DROP INDEX "public"."idx_faculty_university"
        `);

        // Drop tables
        await queryRunner.query(`DROP TABLE "academic_levels"`);
        await queryRunner.query(`DROP TABLE "faculties"`);
        await queryRunner.query(`DROP TABLE "universities"`);
    }
}
