/*
  Warnings:

  - Added the required column `requirements` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsibilities` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "JobStatus" ADD VALUE 'OPEN';
ALTER TYPE "JobStatus" ADD VALUE 'CLOSED';
ALTER TYPE "JobStatus" ADD VALUE 'DRAFT';

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "requirements" TEXT NOT NULL,
ADD COLUMN     "responsibilities" TEXT NOT NULL,
ADD COLUMN     "type" "JobType" NOT NULL DEFAULT 'FULL_TIME';
