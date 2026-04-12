-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY,
    "pollIntervalSeconds" INTEGER NOT NULL DEFAULT 300,
    "retentionDays" INTEGER NOT NULL DEFAULT 90,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "ipProvider" TEXT NOT NULL DEFAULT 'ipify',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WanIpLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ts" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "provider" TEXT NOT NULL,
    "ok" BOOLEAN NOT NULL,
    "responseMs" INTEGER,
    "error" TEXT
);

-- CreateTable
CREATE TABLE "PollRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "handledAt" DATETIME,
    "handledBy" TEXT
);

-- CreateIndex
CREATE INDEX "WanIpLog_ts_idx" ON "WanIpLog"("ts");

