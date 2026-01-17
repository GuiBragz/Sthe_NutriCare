-- CreateTable
CREATE TABLE `tb_usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomeCompleto` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `tipo` ENUM('ADMIN', 'PACIENTE') NOT NULL DEFAULT 'PACIENTE',
    `telefone` VARCHAR(191) NULL,
    `fotoPerfilUrl` VARCHAR(191) NULL,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tb_usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_metas_saude` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `pesoAtual` DOUBLE NOT NULL,
    `pesoMeta` DOUBLE NOT NULL,
    `altura` DOUBLE NOT NULL,
    `metaCaloricaDiaria` INTEGER NOT NULL,
    `metaAguaDiaria` INTEGER NOT NULL,

    UNIQUE INDEX `tb_metas_saude_usuarioId_key`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_agendamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `dataHoraConsulta` DATETIME(3) NOT NULL,
    `valorPago` DECIMAL(10, 2) NOT NULL,
    `formaPagamento` ENUM('PIX', 'CARTAO') NOT NULL,
    `status` ENUM('AGUARDANDO_PAGAMENTO', 'CONFIRMADO', 'REALIZADO', 'CANCELADO_COM_CREDITO', 'CANCELADO') NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
    `observacoes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_planos_nutricionais` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `arquivoUrl` VARCHAR(191) NULL,
    `descricao` VARCHAR(191) NULL,
    `dataUpload` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_receitas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `ingredientes` TEXT NOT NULL,
    `modoPreparo` TEXT NOT NULL,
    `caloriasTotais` INTEGER NOT NULL,
    `fotoUrl` VARCHAR(191) NULL,
    `categoria` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_diario_diario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `dataRegistro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `caloriasConsumidas` INTEGER NOT NULL,
    `caloriasQueimadas` INTEGER NOT NULL,
    `aguaConsumida` INTEGER NOT NULL,
    `observacoesDia` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_metas_saude` ADD CONSTRAINT `tb_metas_saude_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `tb_usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_agendamentos` ADD CONSTRAINT `tb_agendamentos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `tb_usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_planos_nutricionais` ADD CONSTRAINT `tb_planos_nutricionais_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `tb_usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_diario_diario` ADD CONSTRAINT `tb_diario_diario_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `tb_usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
