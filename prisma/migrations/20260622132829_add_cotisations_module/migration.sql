-- CreateEnum
CREATE TYPE "CotisationStatut" AS ENUM ('ACTIF', 'SUSPENDU', 'CLOTURE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'COTISATION_DUE';
ALTER TYPE "NotificationType" ADD VALUE 'COTISATION_PAYEE';
ALTER TYPE "NotificationType" ADD VALUE 'COTISATION_NOUVEAU_GROUPE';

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "cotisationGroupeId" TEXT;

-- CreateTable
CREATE TABLE "cotisation_groupes" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "montantParMembre" DOUBLE PRECISION NOT NULL,
    "statut" "CotisationStatut" NOT NULL DEFAULT 'ACTIF',
    "propertyId" TEXT,
    "createurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cotisation_groupes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotisation_membres" (
    "id" TEXT NOT NULL,
    "estTresorier" BOOLEAN NOT NULL DEFAULT false,
    "estActif" BOOLEAN NOT NULL DEFAULT true,
    "dateAdhesion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupeId" TEXT NOT NULL,
    "locataireId" TEXT NOT NULL,

    CONSTRAINT "cotisation_membres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contributions" (
    "id" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "periode" TEXT NOT NULL,
    "statut" "PaymentStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "datePaiement" TIMESTAMP(3),
    "referenceId" TEXT,
    "recuUrl" TEXT,
    "groupeId" TEXT NOT NULL,
    "membreId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cotisation_membres_groupeId_locataireId_key" ON "cotisation_membres"("groupeId", "locataireId");

-- CreateIndex
CREATE UNIQUE INDEX "contributions_referenceId_key" ON "contributions"("referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "contributions_groupeId_membreId_periode_key" ON "contributions"("groupeId", "membreId", "periode");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_cotisationGroupeId_fkey" FOREIGN KEY ("cotisationGroupeId") REFERENCES "cotisation_groupes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotisation_groupes" ADD CONSTRAINT "cotisation_groupes_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotisation_groupes" ADD CONSTRAINT "cotisation_groupes_createurId_fkey" FOREIGN KEY ("createurId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotisation_membres" ADD CONSTRAINT "cotisation_membres_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "cotisation_groupes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotisation_membres" ADD CONSTRAINT "cotisation_membres_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "cotisation_groupes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "cotisation_membres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
