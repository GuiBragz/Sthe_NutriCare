/*
  Warnings:

  - You are about to drop the column `altura` on the `tb_metas_saude` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tb_metas_saude` DROP COLUMN `altura`;

-- AlterTable
ALTER TABLE `tb_usuarios` ADD COLUMN `altura` DOUBLE NULL,
    ADD COLUMN `dataNascimento` VARCHAR(191) NULL,
    ADD COLUMN `objetivos` VARCHAR(191) NULL,
    ADD COLUMN `sexo` VARCHAR(191) NULL;
