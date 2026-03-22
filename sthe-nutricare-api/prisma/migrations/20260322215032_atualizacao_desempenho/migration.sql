-- AlterTable
ALTER TABLE `tb_agendamentos` MODIFY `status` ENUM('DISPONIVEL', 'AGUARDANDO_PAGAMENTO', 'AGENDADO', 'CONFIRMADO', 'REALIZADO', 'FALTOU', 'CANCELADO_COM_CREDITO', 'CANCELADO') NOT NULL DEFAULT 'DISPONIVEL';

-- AlterTable
ALTER TABLE `tb_diario_diario` ADD COLUMN `layoutUsado` ENUM('SIMPLES', 'COMPLEXO') NOT NULL DEFAULT 'SIMPLES',
    ADD COLUMN `pesoAtual` DOUBLE NULL,
    MODIFY `caloriasConsumidas` INTEGER NOT NULL DEFAULT 0,
    MODIFY `caloriasQueimadas` INTEGER NOT NULL DEFAULT 0,
    MODIFY `aguaConsumida` INTEGER NOT NULL DEFAULT 0,
    MODIFY `observacoesDia` TEXT NULL;

-- AlterTable
ALTER TABLE `tb_planos_nutricionais` MODIFY `descricao` TEXT NULL;

-- AlterTable
ALTER TABLE `tb_usuarios` ADD COLUMN `termosAceitos` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `tb_refeicoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `diarioId` INTEGER NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `calorias` INTEGER NOT NULL DEFAULT 0,
    `detalhes` TEXT NULL,
    `proteinas` DOUBLE NULL,
    `carboidratos` DOUBLE NULL,
    `gorduras` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_refeicoes` ADD CONSTRAINT `tb_refeicoes_diarioId_fkey` FOREIGN KEY (`diarioId`) REFERENCES `tb_diario_diario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
