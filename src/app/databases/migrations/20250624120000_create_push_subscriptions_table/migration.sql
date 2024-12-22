-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" BIGSERIAL NOT NULL,
    "subscribable_id" TEXT NOT NULL,
    "subscribable_type" TEXT NOT NULL,
    "endpoint" VARCHAR(500) NOT NULL,
    "public_key" TEXT,
    "auth_token" TEXT,
    "content_encoding" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "subscribable_type_id_index" ON "push_subscriptions"("subscribable_type", "subscribable_id");
