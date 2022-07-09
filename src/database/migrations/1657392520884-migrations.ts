import { MigrationInterface, QueryRunner } from "typeorm";

export class migrations1657392520884 implements MigrationInterface {
    name = 'migrations1657392520884'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "reply" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "authorId" uuid, "postId" uuid, "toId" uuid, CONSTRAINT "PK_94fa9017051b40a71e000a2aff9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reply" ADD CONSTRAINT "FK_9c7aa85b4b2be67c1b7235d03fe" FOREIGN KEY ("authorId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reply" ADD CONSTRAINT "FK_650bb493bc96cdc1c6a95d50ccd" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reply" ADD CONSTRAINT "FK_2e7a2c60eabefefab485cd43e6d" FOREIGN KEY ("toId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reply" DROP CONSTRAINT "FK_2e7a2c60eabefefab485cd43e6d"`);
        await queryRunner.query(`ALTER TABLE "reply" DROP CONSTRAINT "FK_650bb493bc96cdc1c6a95d50ccd"`);
        await queryRunner.query(`ALTER TABLE "reply" DROP CONSTRAINT "FK_9c7aa85b4b2be67c1b7235d03fe"`);
        await queryRunner.query(`DROP TABLE "reply"`);
    }

}
