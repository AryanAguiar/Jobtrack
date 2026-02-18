/*
  Warnings:

  - You are about to drop the column `keywords` on the `ResumeParsedData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ResumeParsedData" DROP COLUMN "keywords";

-- CreateTable
CREATE TABLE "GroqFailures" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "promptHash" TEXT NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroqFailures_pkey" PRIMARY KEY ("id")
);
