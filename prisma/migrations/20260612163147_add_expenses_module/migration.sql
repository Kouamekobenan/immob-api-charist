-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('PRESTATAIRE', 'PERSONNEL', 'FOURNITURES', 'CHARGES_COMMUNES', 'ASSURANCE', 'TAXE_IMPOT', 'AUTRE');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('EN_ATTENTE', 'PAYEE', 'ANNULEE');

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "montant" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categorie" "ExpenseCategory" NOT NULL,
    "statut" "ExpenseStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "beneficiaireNom" TEXT NOT NULL,
    "referenceId" TEXT,
    "justificatifUrl" TEXT,
    "payeurId" TEXT NOT NULL,
    "beneficiaireId" TEXT,
    "propertyId" TEXT,
    "ticketId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "expenses_ticketId_key" ON "expenses"("ticketId");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_payeurId_fkey" FOREIGN KEY ("payeurId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_beneficiaireId_fkey" FOREIGN KEY ("beneficiaireId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
