import { MigrationInterface, QueryRunner } from "typeorm";

export class displayName1656189223828 implements MigrationInterface {
    name = 'displayName1656189223828'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "displayName"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "account" ADD "displayName" character varying NOT NULL`);
    }

}
