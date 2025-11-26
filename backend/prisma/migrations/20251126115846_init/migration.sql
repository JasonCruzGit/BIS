-- CreateEnum
CREATE TYPE "DocumentRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SECRETARY', 'CPDO', 'TREASURER', 'SK', 'STAFF');

-- CreateEnum
CREATE TYPE "ResidencyStatus" AS ENUM ('NEW', 'RETURNING', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('INDIGENCY', 'RESIDENCY', 'CLEARANCE', 'SOLO_PARENT', 'GOOD_MORAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BlotterCategory" AS ENUM ('DOMESTIC_DISPUTE', 'THEFT', 'BARANGAY_DISPUTE', 'YOUTH_RELATED', 'PROPERTY_DISPUTE', 'OTHER');

-- CreateEnum
CREATE TYPE "BlotterStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "FinancialType" AS ENUM ('BUDGET', 'EXPENSE', 'ALLOCATION', 'INCOME');

-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('GENERAL', 'EVENT', 'EMERGENCY', 'NOTICE');

-- CreateEnum
CREATE TYPE "DisasterStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InventoryLogType" AS ENUM ('ADD', 'REMOVE', 'RELEASE', 'RETURN', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residents" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT NOT NULL,
    "suffix" TEXT,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "sex" TEXT NOT NULL,
    "civil_status" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contact_no" TEXT NOT NULL,
    "occupation" TEXT,
    "education" TEXT,
    "id_photo" TEXT,
    "residency_status" "ResidencyStatus" NOT NULL DEFAULT 'NEW',
    "household_id" TEXT,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "residents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "households" (
    "id" TEXT NOT NULL,
    "household_number" TEXT NOT NULL,
    "head_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "income" DECIMAL(12,2),
    "living_conditions" TEXT,
    "household_size" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "households_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "document_number" TEXT NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "resident_id" TEXT NOT NULL,
    "issued_by" TEXT NOT NULL,
    "issued_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purpose" TEXT,
    "template" TEXT,
    "file_path" TEXT,
    "request_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_requests" (
    "id" TEXT NOT NULL,
    "request_number" TEXT NOT NULL,
    "resident_id" TEXT NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "purpose" TEXT,
    "status" "DocumentRequestStatus" NOT NULL DEFAULT 'PENDING',
    "fee" DECIMAL(10,2),
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "payment_method" TEXT,
    "payment_reference" TEXT,
    "notes" TEXT,
    "rejected_reason" TEXT,
    "processed_by" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "incident_number" TEXT NOT NULL,
    "complainant_id" TEXT NOT NULL,
    "respondent_id" TEXT,
    "narrative" TEXT NOT NULL,
    "incident_date" TIMESTAMP(3) NOT NULL,
    "actions_taken" TEXT,
    "status" "IncidentStatus" NOT NULL DEFAULT 'PENDING',
    "hearing_date" TIMESTAMP(3),
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" DECIMAL(12,2) NOT NULL,
    "contractor" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "progress_photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "officials" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "term_start" TIMESTAMP(3) NOT NULL,
    "term_end" TIMESTAMP(3),
    "contact_no" TEXT NOT NULL,
    "email" TEXT,
    "photo" TEXT,
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "officials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "official_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time_in" TIMESTAMP(3),
    "time_out" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blotter_entries" (
    "id" TEXT NOT NULL,
    "entry_number" TEXT NOT NULL,
    "resident_id" TEXT NOT NULL,
    "category" "BlotterCategory" NOT NULL,
    "narrative" TEXT NOT NULL,
    "incident_date" TIMESTAMP(3) NOT NULL,
    "status" "BlotterStatus" NOT NULL DEFAULT 'OPEN',
    "actions_taken" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blotter_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_records" (
    "id" TEXT NOT NULL,
    "record_number" TEXT NOT NULL,
    "type" "FinancialType" NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "receipt_path" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "AnnouncementType" NOT NULL DEFAULT 'GENERAL',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disasters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "affected_areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "DisasterStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disasters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disaster_beneficiaries" (
    "id" TEXT NOT NULL,
    "disaster_id" TEXT NOT NULL,
    "resident_id" TEXT,
    "household_id" TEXT,
    "relief_type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "date_distributed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disaster_beneficiaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "min_stock" INTEGER NOT NULL DEFAULT 0,
    "qr_code" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_logs" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "type" "InventoryLogType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "notes" TEXT,
    "released_to" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "changes" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "residents_household_id_idx" ON "residents"("household_id");

-- CreateIndex
CREATE INDEX "residents_first_name_last_name_idx" ON "residents"("first_name", "last_name");

-- CreateIndex
CREATE UNIQUE INDEX "households_household_number_key" ON "households"("household_number");

-- CreateIndex
CREATE UNIQUE INDEX "documents_document_number_key" ON "documents"("document_number");

-- CreateIndex
CREATE UNIQUE INDEX "documents_request_id_key" ON "documents"("request_id");

-- CreateIndex
CREATE INDEX "documents_resident_id_idx" ON "documents"("resident_id");

-- CreateIndex
CREATE INDEX "documents_document_type_idx" ON "documents"("document_type");

-- CreateIndex
CREATE UNIQUE INDEX "document_requests_request_number_key" ON "document_requests"("request_number");

-- CreateIndex
CREATE INDEX "document_requests_resident_id_idx" ON "document_requests"("resident_id");

-- CreateIndex
CREATE INDEX "document_requests_status_idx" ON "document_requests"("status");

-- CreateIndex
CREATE INDEX "document_requests_request_number_idx" ON "document_requests"("request_number");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_incident_number_key" ON "incidents"("incident_number");

-- CreateIndex
CREATE INDEX "incidents_complainant_id_idx" ON "incidents"("complainant_id");

-- CreateIndex
CREATE INDEX "incidents_status_idx" ON "incidents"("status");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "attendance_official_id_date_idx" ON "attendance"("official_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "blotter_entries_entry_number_key" ON "blotter_entries"("entry_number");

-- CreateIndex
CREATE INDEX "blotter_entries_resident_id_idx" ON "blotter_entries"("resident_id");

-- CreateIndex
CREATE INDEX "blotter_entries_category_idx" ON "blotter_entries"("category");

-- CreateIndex
CREATE INDEX "blotter_entries_status_idx" ON "blotter_entries"("status");

-- CreateIndex
CREATE UNIQUE INDEX "financial_records_record_number_key" ON "financial_records"("record_number");

-- CreateIndex
CREATE INDEX "financial_records_type_idx" ON "financial_records"("type");

-- CreateIndex
CREATE INDEX "financial_records_date_idx" ON "financial_records"("date");

-- CreateIndex
CREATE INDEX "announcements_is_pinned_created_at_idx" ON "announcements"("is_pinned", "created_at");

-- CreateIndex
CREATE INDEX "disasters_status_idx" ON "disasters"("status");

-- CreateIndex
CREATE INDEX "disaster_beneficiaries_disaster_id_idx" ON "disaster_beneficiaries"("disaster_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_qr_code_key" ON "inventory_items"("qr_code");

-- CreateIndex
CREATE INDEX "inventory_items_category_idx" ON "inventory_items"("category");

-- CreateIndex
CREATE INDEX "inventory_logs_item_id_idx" ON "inventory_logs"("item_id");

-- CreateIndex
CREATE INDEX "inventory_logs_type_idx" ON "inventory_logs"("type");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "residents" ADD CONSTRAINT "residents_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_issued_by_fkey" FOREIGN KEY ("issued_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_resident_id_fkey" FOREIGN KEY ("resident_id") REFERENCES "residents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "document_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_resident_id_fkey" FOREIGN KEY ("resident_id") REFERENCES "residents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_complainant_id_fkey" FOREIGN KEY ("complainant_id") REFERENCES "residents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_respondent_id_fkey" FOREIGN KEY ("respondent_id") REFERENCES "residents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_official_id_fkey" FOREIGN KEY ("official_id") REFERENCES "officials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blotter_entries" ADD CONSTRAINT "blotter_entries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blotter_entries" ADD CONSTRAINT "blotter_entries_resident_id_fkey" FOREIGN KEY ("resident_id") REFERENCES "residents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_records" ADD CONSTRAINT "financial_records_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disaster_beneficiaries" ADD CONSTRAINT "disaster_beneficiaries_disaster_id_fkey" FOREIGN KEY ("disaster_id") REFERENCES "disasters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disaster_beneficiaries" ADD CONSTRAINT "disaster_beneficiaries_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disaster_beneficiaries" ADD CONSTRAINT "disaster_beneficiaries_resident_id_fkey" FOREIGN KEY ("resident_id") REFERENCES "residents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
