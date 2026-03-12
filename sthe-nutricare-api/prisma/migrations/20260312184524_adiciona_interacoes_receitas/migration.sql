-- AlterTable
ALTER TABLE `tb_receitas` ADD COLUMN `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `tb_receita_likes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `receitaId` INTEGER NOT NULL,

    UNIQUE INDEX `tb_receita_likes_usuarioId_receitaId_key`(`usuarioId`, `receitaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_receita_favoritas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `receitaId` INTEGER NOT NULL,

    UNIQUE INDEX `tb_receita_favoritas_usuarioId_receitaId_key`(`usuarioId`, `receitaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_comentarios_receita` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `texto` TEXT NOT NULL,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuarioId` INTEGER NOT NULL,
    `receitaId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_receita_likes` ADD CONSTRAINT `tb_receita_likes_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `tb_usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_receita_likes` ADD CONSTRAINT `tb_receita_likes_receitaId_fkey` FOREIGN KEY (`receitaId`) REFERENCES `tb_receitas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_receita_favoritas` ADD CONSTRAINT `tb_receita_favoritas_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `tb_usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_receita_favoritas` ADD CONSTRAINT `tb_receita_favoritas_receitaId_fkey` FOREIGN KEY (`receitaId`) REFERENCES `tb_receitas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_comentarios_receita` ADD CONSTRAINT `tb_comentarios_receita_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `tb_usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_comentarios_receita` ADD CONSTRAINT `tb_comentarios_receita_receitaId_fkey` FOREIGN KEY (`receitaId`) REFERENCES `tb_receitas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
