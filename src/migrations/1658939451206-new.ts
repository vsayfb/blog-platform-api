import { MigrationInterface, QueryRunner } from "typeorm";

export class new1658939451206 implements MigrationInterface {
    name = 'new1658939451206'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "link"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "postId" uuid`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "commentId" uuid`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_c7dc378ca2844fdfe647e00e993" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_8dcb425fddadd878d80bf5fa195" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_8dcb425fddadd878d80bf5fa195"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_c7dc378ca2844fdfe647e00e993"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "commentId"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "postId"`);
        await queryRunner.query(`ALTER TABLE "notification" ADD "link" character varying NOT NULL`);
    }

}
