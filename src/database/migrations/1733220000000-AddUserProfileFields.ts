import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserProfileFields1733220000000 implements MigrationInterface {
    name = 'AddUserProfileFields1733220000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "phoneNumber" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "dateOfBirth" date`);
        await queryRunner.query(`ALTER TABLE "users" ADD "address" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "city" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "country" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "bio" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bio"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "dateOfBirth"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phoneNumber"`);
    }

}
