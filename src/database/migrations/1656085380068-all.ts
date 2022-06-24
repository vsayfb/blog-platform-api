import { MigrationInterface, QueryRunner } from "typeorm";

export class all1656085380068 implements MigrationInterface {
    name = 'all1656085380068'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b" UNIQUE ("name"), CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "titleImage" character varying, "url" character varying NOT NULL, "content" character varying NOT NULL, "published" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "authorId" uuid, CONSTRAINT "UQ_2d4cb7f2ff3bcc12f0639d8f86d" UNIQUE ("url"), CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."account_via_enum" AS ENUM('local', 'google')`);
        await queryRunner.query(`CREATE TABLE "account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "displayName" character varying NOT NULL, "email" character varying NOT NULL, "image" character varying, "password" character varying NOT NULL, "via" "public"."account_via_enum" NOT NULL DEFAULT 'local', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_41dfcb70af895ddf9a53094515b" UNIQUE ("username"), CONSTRAINT "UQ_4c8f96ccf523e9a3faefd5bdd4c" UNIQUE ("email"), CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "code" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "receiver" character varying NOT NULL, "senderTime" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3aab60cbcf5684b4a89fb46147e" UNIQUE ("code"), CONSTRAINT "UQ_a583ad47be5e8885e39ebe24d77" UNIQUE ("receiver"), CONSTRAINT "PK_367e70f79a9106b8e802e1a9825" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post_tags_tag" ("postId" uuid NOT NULL, "tagId" uuid NOT NULL, CONSTRAINT "PK_e9b7b8e6a07bdccb6a954171676" PRIMARY KEY ("postId", "tagId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b651178cc41334544a7a9601c4" ON "post_tags_tag" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_41e7626b9cc03c5c65812ae55e" ON "post_tags_tag" ("tagId") `);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0" FOREIGN KEY ("authorId") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_tags_tag" ADD CONSTRAINT "FK_b651178cc41334544a7a9601c45" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_tags_tag" ADD CONSTRAINT "FK_41e7626b9cc03c5c65812ae55e8" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_tags_tag" DROP CONSTRAINT "FK_41e7626b9cc03c5c65812ae55e8"`);
        await queryRunner.query(`ALTER TABLE "post_tags_tag" DROP CONSTRAINT "FK_b651178cc41334544a7a9601c45"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_41e7626b9cc03c5c65812ae55e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b651178cc41334544a7a9601c4"`);
        await queryRunner.query(`DROP TABLE "post_tags_tag"`);
        await queryRunner.query(`DROP TABLE "code"`);
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP TYPE "public"."account_via_enum"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "tag"`);
    }

}
