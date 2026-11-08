-- 기존 refresh token 은 행마다 따로 로그인한 것으로 보고 계열을 새로 채운다.
ALTER TABLE "admin_refresh_token" ADD "family_id" uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "admin_refresh_token" ALTER COLUMN "family_id" DROP DEFAULT;
ALTER TABLE "admin_refresh_token" ADD "used_at" TIMESTAMP WITH TIME ZONE;
CREATE INDEX "IDX_da5ed363cf30f0192ad1d89089" ON "admin_refresh_token" ("family_id");
