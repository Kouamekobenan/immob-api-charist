-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PARTIEL';

-- AlterTable
ALTER TABLE "contributions" ADD COLUMN     "montantPaye" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "tranches_paiement" (
    "id" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "datePaiement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referenceId" TEXT,
    "recuUrl" TEXT,
    "contributionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tranches_paiement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tranches_paiement_referenceId_key" ON "tranches_paiement"("referenceId");

-- AddForeignKey
ALTER TABLE "tranches_paiement" ADD CONSTRAINT "tranches_paiement_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "contributions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
