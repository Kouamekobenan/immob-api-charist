-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'BAILLEUR', 'GERANT', 'LOCATAIRE', 'PRESTATAIRE');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OUVERT', 'ASSIGNE', 'EN_COURS', 'RESOLU', 'CLOTURE');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('FAIBLE', 'MOYEN', 'CRITIQUE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('EN_ATTENTE', 'PAYE', 'ECHOUE', 'REJETE');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APPARTEMENT', 'STUDIO', 'VILLA', 'MAGASIN', 'AUTRE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TICKET_STATUT_CHANGE', 'NOUVEAU_TICKET_ASSIGNE', 'LOYER_DISPONIBLE', 'PAIEMENT_VALIDE', 'RAPPEL_IMPAYE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'LOCATAIRE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "adresse" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL DEFAULT 'APPARTEMENT',
    "loyerDeBase" DOUBLE PRECISION NOT NULL,
    "charges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estOccupe" BOOLEAN NOT NULL DEFAULT false,
    "bailleurId" TEXT NOT NULL,
    "gerantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "loyerTotal" DOUBLE PRECISION NOT NULL,
    "estActif" BOOLEAN NOT NULL DEFAULT true,
    "propertyId" TEXT NOT NULL,
    "locataireId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photos" TEXT[],
    "urgence" "UrgencyLevel" NOT NULL DEFAULT 'MOYEN',
    "statut" "TicketStatus" NOT NULL DEFAULT 'OUVERT',
    "propertyId" TEXT NOT NULL,
    "locataireId" TEXT NOT NULL,
    "prestataireId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "datePaiement" TIMESTAMP(3),
    "periode" TEXT NOT NULL,
    "statut" "PaymentStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "referenceId" TEXT,
    "recuUrl" TEXT,
    "contractId" TEXT NOT NULL,
    "locataireId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "table" TEXT NOT NULL,
    "enregistrementId" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "ipAdresse" TEXT,
    "userAgent" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "estLu" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "payments_referenceId_key" ON "payments"("referenceId");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_bailleurId_fkey" FOREIGN KEY ("bailleurId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_gerantId_fkey" FOREIGN KEY ("gerantId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_prestataireId_fkey" FOREIGN KEY ("prestataireId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_locataireId_fkey" FOREIGN KEY ("locataireId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
