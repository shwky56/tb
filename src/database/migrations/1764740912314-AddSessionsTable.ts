import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSessionsTable1764740912314 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create sessions table
        await queryRunner.query(`
            CREATE TABLE "sessions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "sessionId" character varying(500) NOT NULL,
                "deviceInfo" character varying(500),
                "ipAddress" character varying(50),
                "lastActivity" TIMESTAMP NOT NULL DEFAULT now(),
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_sessions_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_sessions_sessionId" UNIQUE ("sessionId")
            )
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "idx_session_user" ON "sessions" ("userId")`);
        await queryRunner.query(`CREATE INDEX "idx_session_id" ON "sessions" ("sessionId")`);
        await queryRunner.query(`CREATE INDEX "idx_session_user_active" ON "sessions" ("userId", "isActive")`);

        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "sessions"
            ADD CONSTRAINT "FK_sessions_userId"
            FOREIGN KEY ("userId")
            REFERENCES "users"("id")
            ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_sessions_userId"`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "public"."idx_session_user_active"`);
        await queryRunner.query(`DROP INDEX "public"."idx_session_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_session_user"`);

        // Drop table
        await queryRunner.query(`DROP TABLE "sessions"`);
    }

}
