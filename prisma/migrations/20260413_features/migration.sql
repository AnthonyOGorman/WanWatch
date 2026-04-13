-- Add configurable poll timeout and webhook URL to Settings
ALTER TABLE "Settings" ADD COLUMN "pollTimeoutSeconds" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "Settings" ADD COLUMN "webhookUrl" TEXT;

-- Add geo enrichment columns to WanIpLog
ALTER TABLE "WanIpLog" ADD COLUMN "isp"     TEXT;
ALTER TABLE "WanIpLog" ADD COLUMN "country" TEXT;
