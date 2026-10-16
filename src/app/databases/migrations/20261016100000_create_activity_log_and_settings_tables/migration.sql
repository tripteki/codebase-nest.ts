-- CreateTable
CREATE TABLE "activity_log" (
    "id" TEXT NOT NULL,
    "log_name" TEXT,
    "description" TEXT NOT NULL,
    "subject_type" TEXT,
    "event" TEXT,
    "subject_id" TEXT,
    "causer_type" TEXT,
    "causer_id" TEXT,
    "properties" JSONB,
    "batch_uuid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "value_kind" TEXT NOT NULL DEFAULT 'text',
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_activity_log_log_name" ON "activity_log"("log_name");

-- CreateIndex
CREATE INDEX "ix_activity_log_subject" ON "activity_log"("subject_type", "subject_id");

-- CreateIndex
CREATE INDEX "ix_activity_log_causer" ON "activity_log"("causer_type", "causer_id");

-- CreateIndex
CREATE INDEX "ix_activity_log_created_at" ON "activity_log"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "ix_settings_key" ON "settings"("key");
