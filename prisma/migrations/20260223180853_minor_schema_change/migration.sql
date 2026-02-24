/*
  Warnings:

  - Made the column `contentHash` on table `Resume` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Resume" ALTER COLUMN "contentHash" SET NOT NULL;

-- AlterTable
ALTER TABLE "ResumeEvaluations" ADD COLUMN     "breakdown" JSONB;
