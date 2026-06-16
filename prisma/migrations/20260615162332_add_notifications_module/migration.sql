-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'TICKET_OUVERT';
ALTER TYPE "NotificationType" ADD VALUE 'TICKET_RESOLU';
ALTER TYPE "NotificationType" ADD VALUE 'PAIEMENT_REJETE';
ALTER TYPE "NotificationType" ADD VALUE 'PAIEMENT_ECHOUE';
ALTER TYPE "NotificationType" ADD VALUE 'CONTRAT_CREE';
ALTER TYPE "NotificationType" ADD VALUE 'CONTRAT_RESILIE';
ALTER TYPE "NotificationType" ADD VALUE 'DEPENSE_CREEE';
ALTER TYPE "NotificationType" ADD VALUE 'DEPENSE_PAYEE';
ALTER TYPE "NotificationType" ADD VALUE 'MESSAGE_DIRECT';
ALTER TYPE "NotificationType" ADD VALUE 'SYSTEME';

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "expediteurId" TEXT;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_expediteurId_fkey" FOREIGN KEY ("expediteurId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
