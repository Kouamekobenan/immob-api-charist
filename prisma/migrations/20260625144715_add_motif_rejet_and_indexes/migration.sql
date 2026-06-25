-- AlterTable
ALTER TABLE "contributions" ADD COLUMN     "motifRejet" TEXT;

-- CreateIndex
CREATE INDEX "contributions_groupeId_periode_idx" ON "contributions"("groupeId", "periode");

-- CreateIndex
CREATE INDEX "contributions_membreId_idx" ON "contributions"("membreId");

-- CreateIndex
CREATE INDEX "cotisation_groupes_createurId_idx" ON "cotisation_groupes"("createurId");

-- CreateIndex
CREATE INDEX "cotisation_membres_locataireId_idx" ON "cotisation_membres"("locataireId");

-- CreateIndex
CREATE INDEX "tranches_paiement_contributionId_idx" ON "tranches_paiement"("contributionId");
