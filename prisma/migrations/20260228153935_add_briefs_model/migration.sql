/*
  Warnings:

  - A unique constraint covering the columns `[telegramChatId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "telegramChatId" TEXT;

-- CreateTable
CREATE TABLE "Brief" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'in-progress',
    "category" TEXT NOT NULL DEFAULT 'new-testament',
    "originalTranscript" TEXT,
    "greekInsights" JSONB,
    "historicalContext" TEXT,
    "outlinePoints" JSONB,
    "telegramMessageId" TEXT,
    "telegramChatId" TEXT,
    "audioFileId" TEXT,
    "audioDuration" INTEGER,
    "userId" TEXT NOT NULL,
    "readTime" INTEGER,
    "isBookmarked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brief_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brief_telegramMessageId_key" ON "Brief"("telegramMessageId");

-- CreateIndex
CREATE INDEX "Brief_userId_idx" ON "Brief"("userId");

-- CreateIndex
CREATE INDEX "Brief_telegramChatId_idx" ON "Brief"("telegramChatId");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramChatId_key" ON "User"("telegramChatId");

-- AddForeignKey
ALTER TABLE "Brief" ADD CONSTRAINT "Brief_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
