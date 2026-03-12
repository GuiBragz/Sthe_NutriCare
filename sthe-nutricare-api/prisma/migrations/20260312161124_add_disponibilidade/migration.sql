-- DropForeignKey
ALTER TABLE `tb_agendamentos` DROP FOREIGN KEY `tb_agendamentos_usuarioId_fkey`;

-- DropIndex
DROP INDEX `tb_agendamentos_usuarioId_fkey` ON `tb_agendamentos`;

-- AlterTable
ALTER TABLE `tb_agendamentos` MODIFY `usuarioId` INTEGER NULL,
    MODIFY `formaPagamento` ENUM('PIX', 'CARTAO') NULL,
    MODIFY `status` ENUM('DISPONIVEL', 'AGUARDANDO_PAGAMENTO', 'AGENDADO', 'CONFIRMADO', 'REALIZADO', 'CANCELADO_COM_CREDITO', 'CANCELADO') NOT NULL DEFAULT 'DISPONIVEL';

-- AddForeignKey
ALTER TABLE `tb_agendamentos` ADD CONSTRAINT `tb_agendamentos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `tb_usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
