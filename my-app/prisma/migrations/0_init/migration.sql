-- CreateTable
CREATE TABLE "loyalty_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "points" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raises" (
    "id" SERIAL NOT NULL,
    "dev_id" INTEGER,
    "token_mint_address" TEXT NOT NULL,
    "token_name" TEXT NOT NULL,
    "token_ticker" TEXT NOT NULL,
    "img_url" TEXT NOT NULL,
    "socials" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "top_dev_time" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "proof" TEXT NOT NULL,
    "user_id" INTEGER,
    "raise_id" INTEGER,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trades" (
    "id" BIGSERIAL NOT NULL,
    "user_id" INTEGER,
    "raise_id" INTEGER,
    "amount_in" INTEGER NOT NULL,
    "amount_out" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "txs_used" (
    "id" BIGSERIAL NOT NULL,
    "tx" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "txs_used_pkey" PRIMARY KEY ("id")
);


-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "wallet" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "dev_points" INTEGER NOT NULL DEFAULT 0,
    "user_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "profile_img" TEXT,


    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_loyalty_idx" ON "loyalty_history"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "raises_token_mint_address_unique" ON "raises"("token_mint_address");

-- CreateIndex
CREATE INDEX "raise_tags_idx" ON "tags"("raise_id");

-- CreateIndex
CREATE INDEX "user_tags_idx" ON "tags"("user_id");

-- CreateIndex
CREATE INDEX "raise_trades_idx" ON "trades"("raise_id");

-- CreateIndex
CREATE INDEX "user_trades_idx" ON "trades"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_unique" ON "users"("wallet");

-- CreateIndex
CREATE UNIQUE INDEX "users_profile_img_unique" ON "users"("profile_img");



-- AddForeignKey
ALTER TABLE "loyalty_history" ADD CONSTRAINT "loyalty_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "raises" ADD CONSTRAINT "raises_dev_id_users_id_fk" FOREIGN KEY ("dev_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_raise_id_raises_id_fk" FOREIGN KEY ("raise_id") REFERENCES "raises"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_raise_id_raises_id_fk" FOREIGN KEY ("raise_id") REFERENCES "raises"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

